import { Module } from '@nestjs/common';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { LessonProposalsService } from './services/lesson-proposals.service';
import { LessonGeneratorService } from './services/lesson-generator.service';
import { LessonGradingService } from './services/lesson-grading.service';
import { LessonQueriesService } from './services/lesson-queries.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [LessonsController],
  providers: [
    LessonsService,
    LessonProposalsService,
    LessonGeneratorService,
    LessonGradingService,
    LessonQueriesService,
  ],
  exports: [
    LessonsService,
    LessonProposalsService,
    LessonGeneratorService,
    LessonGradingService,
    LessonQueriesService,
  ],
})
export class LessonsModule {}
