import { Injectable, NotFoundException } from '@nestjs/common';
import { ActionType, LessonStatus, Prisma } from '../../generated/prisma/client';
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
    userId: string,
    lessonId: string,
    userAnswersText: SubmitLessonDto,
    imagePaths?: string[],
  ) {
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
    if (userAnswersText.exercises && userAnswersText.exercises.length > 0) {
      for (const item of userAnswersText.exercises) {
        if (item.submission !== undefined && item.submission !== null) {
          userSubmissions.set(item.exerciseNumber, item.submission);
        }
      }
    } else {
      if (userAnswersText.ex1 && userAnswersText.ex1.trim()) {
        userSubmissions.set(1, { text: userAnswersText.ex1.trim() });
      }
      if (userAnswersText.ex2 && userAnswersText.ex2.trim()) {
        userSubmissions.set(2, { text: userAnswersText.ex2.trim() });
      }
      if (userAnswersText.ex3 && userAnswersText.ex3.trim()) {
        userSubmissions.set(3, { text: userAnswersText.ex3.trim() });
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

    await this.usageService.checkLimit(userId, ActionType.LESSON_CORRECTION);

    const grading = await this.aiService.gradeSubmission(
      userId,
      lesson,
      exercisesToGrade,
      userSubmissions,
      imagePaths,
    );

    await this.usageService.incrementUsage(userId, ActionType.LESSON_CORRECTION);

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

      for (const ex of exerciseList) {
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

        await tx.lessonExercise.upsert({
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
      }

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
          rule: true,
          words: { include: { word: true } },
          exercises: { orderBy: { exerciseNumber: 'asc' } },
        },
      });

      return updatedLesson;
    });
  }
}
