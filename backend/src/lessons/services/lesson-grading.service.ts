import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { SubmitLessonDto } from '../dto/lesson.dto';

@Injectable()
export class LessonGradingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
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

    const grading = await this.aiService.gradeSubmission(
      userId,
      parsedContent,
      userAnswersText,
      imagePaths,
    );

    const updated = await this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        status: 'GRADED',
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
