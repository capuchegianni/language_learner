import { Injectable } from '@nestjs/common';
import { LessonProposalsService } from './services/lesson-proposals.service';
import { LessonGeneratorService } from './services/lesson-generator.service';
import { LessonGradingService } from './services/lesson-grading.service';
import { LessonQueriesService } from './services/lesson-queries.service';
import { GenerateLessonDto, LessonQueryDto, SubmitLessonDto } from './dto/lesson.dto';

@Injectable()
export class LessonsService {
  constructor(
    private readonly proposalsService: LessonProposalsService,
    private readonly generatorService: LessonGeneratorService,
    private readonly gradingService: LessonGradingService,
    private readonly queriesService: LessonQueriesService,
  ) {}

  /**
   * Returns AI proposed new rules + 1 random review rule if existing rules exist.
   */
  async getRuleProposals(userId: string, options?: { forceRefresh?: boolean }) {
    return this.proposalsService.getRuleProposals(userId, options);
  }

  /**
   * Replaces a single proposal card by generating a new one and updating the DB.
   */
  async replaceProposal(userId: string, index: number) {
    return this.proposalsService.replaceProposal(userId, index);
  }

  /**
   * Generates a daily lesson based on chosen rule title & target words count.
   */
  async generateLesson(userId: string, dto: GenerateLessonDto) {
    return this.generatorService.generateLesson(userId, dto);
  }

  /**
   * Submits user answers (text or uploaded image) and calls AI Vision/Grading engine.
   */
  async submitLesson(
    userId: string,
    lessonId: string,
    userAnswersText: SubmitLessonDto,
    imagePaths?: string[],
  ) {
    return this.gradingService.submitLesson(userId, lessonId, userAnswersText, imagePaths);
  }

  /**
   * Retrieves paginated/filtered list of lessons for the authenticated user.
   */
  async getLessons(userId: string, options?: LessonQueryDto) {
    return this.queriesService.getLessons(userId, options);
  }

  /**
   * Retrieves a single lesson by ID ensuring user-scoped ownership.
   */
  async getLessonById(userId: string, id: string) {
    return this.queriesService.getLessonById(userId, id);
  }

  /**
   * Deletes a lesson by ID ensuring user-scoped ownership.
   */
  async deleteLesson(userId: string, id: string) {
    return this.queriesService.deleteLesson(userId, id);
  }

  /**
   * Calculates dashboard summary metrics and streaks for the user.
   */
  async getDashboardStats(userId: string) {
    return this.queriesService.getDashboardStats(userId);
  }
}
