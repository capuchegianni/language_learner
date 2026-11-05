import { Injectable, NotFoundException } from '@nestjs/common';
import { ActionType, LessonStatus } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { UsageService } from '../../usage/usage.service';
import { SubmitLessonDto } from '../dto/lesson.dto';

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
      include: { rule: true },
    });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID '${lessonId}' not found`);
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(lesson.lessonData);
    } catch {
      throw new NotFoundException('Corrupted lesson data format');
    }

    await this.usageService.checkLimit(userId, ActionType.LESSON_CORRECTION);

    const grading = await this.aiService.gradeSubmission(
      userId,
      parsedContent,
      userAnswersText,
      imagePaths,
    );

    await this.usageService.incrementUsage(userId, ActionType.LESSON_CORRECTION);

    const updated = await this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        status: LessonStatus.GRADED,
        userSubmission: JSON.stringify(userAnswersText),
        aiFeedback: JSON.stringify(grading),
        overallScore: grading.overallScore,
      },
      include: {
        rule: true,
        words: { include: { word: true } },
      },
    });

    return updated;
  }
}
