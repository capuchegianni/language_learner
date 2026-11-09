import { Injectable, NotFoundException } from '@nestjs/common';
import { ActionType, LessonStatus, Prisma, User } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { UsageService } from '../../usage/usage.service';
import { SubmitLessonDto } from '../dto/lesson.dto';
import { UserSubmission, ExerciseGrading } from '../../ai/interfaces/ai.interfaces';

@Injectable()
export class LessonGradingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly usageService: UsageService,
  ) {}

  /**
   * Submits user answers (text or uploaded image) and calls AI Vision/Grading engine.
   */
  async submitLesson(
    user: User | string,
    lessonId: string,
    userAnswersText: SubmitLessonDto,
    imagePaths?: string[],
  ) {
    const userId = typeof user === 'string' ? user : user.id;

    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, userId },
      include: {
        rule: true,
        words: { include: { word: true } },
        exercises: { orderBy: { exerciseNumber: 'asc' } },
      },
    });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID '${lessonId}' not found`);
    }

    const userSubmissions = new Map<number, UserSubmission>();
    if (userAnswersText.exercises && Array.isArray(userAnswersText.exercises)) {
      for (const item of userAnswersText.exercises) {
        if (item && item.submission !== undefined && item.submission !== null) {
          userSubmissions.set(item.exerciseNumber, item.submission);
        }
      }
    }

    const exercisesToGrade =
      lesson.exercises.length > 0
        ? lesson.exercises
        : [
            {
              id: '',
              lessonId,
              exerciseNumber: 1,
              instruction: 'Exercise 1',
              content: {},
              userSubmission: null,
              score: null,
              feedback: null,
              corrections: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '',
              lessonId,
              exerciseNumber: 2,
              instruction: 'Exercise 2',
              content: {},
              userSubmission: null,
              score: null,
              feedback: null,
              corrections: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: '',
              lessonId,
              exerciseNumber: 3,
              instruction: 'Exercise 3',
              content: {},
              userSubmission: null,
              score: null,
              feedback: null,
              corrections: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];

    await this.usageService.checkLimit(user, ActionType.LESSON_CORRECTION);

    const grading = await this.aiService.gradeSubmission(
      user,
      lesson,
      exercisesToGrade,
      userSubmissions,
      imagePaths,
    );

    await this.usageService.incrementUsage(user, ActionType.LESSON_CORRECTION);

    return this.prisma.$transaction(async (tx) => {
      const fallbackExercises: Array<{
        exerciseNumber: number;
        instruction: string;
        content: Prisma.InputJsonValue;
      }> = [
        { exerciseNumber: 1, instruction: 'Exercise 1', content: {} },
        { exerciseNumber: 2, instruction: 'Exercise 2', content: {} },
        { exerciseNumber: 3, instruction: 'Exercise 3', content: {} },
      ];

      const exerciseList = lesson.exercises.length > 0 ? lesson.exercises : fallbackExercises;

      await Promise.all(
        exerciseList.map((ex) => {
          const sub = userSubmissions.get(ex.exerciseNumber);
          const exerciseKey = `exercise${ex.exerciseNumber}` as 'exercise1' | 'exercise2' | 'exercise3';
          const evalResult = grading[exerciseKey] as ExerciseGrading | undefined;

          const score =
            evalResult?.score !== undefined && evalResult?.score !== null
              ? Number(evalResult.score)
              : null;

          const userSubmissionJson: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput =
            sub ? (sub as unknown as Prisma.InputJsonValue) : Prisma.DbNull;

          const correctionsJson: Prisma.InputJsonValue =
            (evalResult?.corrections ?? []) as unknown as Prisma.InputJsonValue;

          const contentJson: Prisma.InputJsonValue =
            (ex.content ?? {}) as Prisma.InputJsonValue;

          return tx.lessonExercise.upsert({
            where: {
              lessonId_exerciseNumber: {
                lessonId,
                exerciseNumber: ex.exerciseNumber,
              },
            },
            update: {
              userSubmission: userSubmissionJson,
              score,
              feedback: evalResult?.feedback ?? null,
              corrections: correctionsJson,
            },
            create: {
              lessonId,
              exerciseNumber: ex.exerciseNumber,
              instruction: ex.instruction,
              content: contentJson,
              userSubmission: userSubmissionJson,
              score,
              feedback: evalResult?.feedback ?? null,
              corrections: correctionsJson,
            },
          });
        }),
      );

      const overallScore =
        grading.overallScore !== undefined && grading.overallScore !== null
          ? Number(grading.overallScore)
          : null;

      const updatedLesson = await tx.lesson.update({
        where: { id: lessonId },
        data: {
          status: LessonStatus.GRADED,
          overallScore,
          generalFeedback: grading.generalFeedback || null,
          handwrittenOcrText: grading.handwrittenOcrText || null,
          submissionImage:
            imagePaths && imagePaths.length > 0
              ? imagePaths[0]
              : lesson.submissionImage || null,
        },
        include: {
          exercises: { orderBy: { exerciseNumber: 'asc' } },
        },
      });

      return {
        ...updatedLesson,
        rule: lesson.rule,
        words: lesson.words,
      };
    });
  }
}
