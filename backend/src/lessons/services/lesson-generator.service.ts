import { Injectable, BadRequestException } from '@nestjs/common';
import { ActionType, LessonStatus } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { AiPromptGuardException } from '../../ai/exceptions/ai-prompt-guard.exception';
import { UsageService } from '../../usage/usage.service';
import { GuardModerationService } from '../../moderation/guard-moderation.service';
import { GenerateLessonDto } from '../dto/lesson.dto';

@Injectable()
export class LessonGeneratorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly usageService: UsageService,
    private readonly guardModerationService: GuardModerationService,
  ) {}

  /**
   * Generates a daily lesson based on chosen rule title & target words count.
   */
  async generateLesson(userId: string, dto: GenerateLessonDto) {
    const trimmed = dto.ruleTitle?.trim();
    if (!trimmed || trimmed.length > 150 || !/[\p{L}\p{N}]/u.test(trimmed)) {
      throw new BadRequestException(
        'Rule title must contain at least one letter or number and not exceed 150 characters',
      );
    }
    dto.ruleTitle = trimmed;

    const wordsCount = dto.wordsCount || 5;
    const isReview = !!dto.isReview;

    const knownWords = await this.prisma.word.findMany({
      where: { userId },
      select: { targetLanguage: true },
    });
    const knownRules = await this.prisma.rule.findMany({
      where: { userId },
      select: { title: true },
    });

    const knownWordsList = knownWords.map((w) => w.targetLanguage);
    const knownRulesList = knownRules.map((r) => r.title);

    // Enforce daily usage limit before calling AI
    await this.usageService.checkLimit(userId, ActionType.LESSON_GENERATION);

    // Call AI service to construct & execute prompt
    let content;
    try {
      content = await this.aiService.generateLesson(
        userId,
        dto.ruleTitle,
        wordsCount,
        knownWordsList,
        knownRulesList,
      );
    } catch (err: unknown) {
      if (err instanceof AiPromptGuardException) {
        await this.guardModerationService.recordGuardError(userId);
      }
      throw err;
    }

    await this.usageService.incrementUsage(userId, ActionType.LESSON_GENERATION);

    // Execute all database operations inside a single transaction
    return this.prisma.$transaction(async (tx) => {
      // Find or create rule entity in database (scoped to user)
      let ruleEntity = await tx.rule.findUnique({
        where: { userId_title: { userId, title: dto.ruleTitle } },
      });

      if (!ruleEntity) {
        ruleEntity = await tx.rule.create({
          data: {
            title: content.rule.title,
            explanation: content.rule.explanation,
            examples: JSON.stringify(content.rule.examples || []),
            exceptions: content.rule.exceptions || null,
            userId,
          },
        });
      }

      // Upsert new daily words into word bank (scoped to user)
      const wordEntities = [];
      for (const nw of content.newWords || []) {
        if (!nw.targetLanguage) continue;
        let word = await tx.word.findUnique({
          where: { userId_targetLanguage: { userId, targetLanguage: nw.targetLanguage } },
        });
        if (!word) {
          word = await tx.word.create({
            data: {
              targetLanguage: nw.targetLanguage,
              nativeLanguage: nw.nativeLanguage || '',
              pronunciation: nw.pronunciation || null,
              partOfSpeech: nw.partOfSpeech || null,
              userId,
            },
          });
        }
        wordEntities.push(word);
      }

      // Save generated lesson entity
      const lesson = await tx.lesson.create({
        data: {
          title: `Lesson: ${content.rule.title}`,
          ruleId: ruleEntity.id,
          isReview,
          wordsCount,
          rawPrompt: content.rawPrompt,
          status: LessonStatus.GENERATED,
          userId,
          words: {
            create: wordEntities.map((w) => ({ wordId: w.id })),
          },
          exercises: {
            create: [
              {
                exerciseNumber: 1,
                instruction: content.exercise1?.instruction || 'Exercise 1',
                content: {
                  type: content.exercise1?.type,
                  targetWords: content.exercise1?.targetWords || [],
                  sampleWords: content.exercise1?.sampleWords,
                  subjectPronouns: content.exercise1?.subjectPronouns,
                },
              },
              {
                exerciseNumber: 2,
                instruction: content.exercise2?.instruction || 'Exercise 2',
                content: {
                  sentencesToTranslate: content.exercise2?.sentencesToTranslate || [],
                },
              },
              {
                exerciseNumber: 3,
                instruction: content.exercise3?.instruction || 'Exercise 3',
                content: {
                  textToTranslate: content.exercise3?.textToTranslate || '',
                },
              },
            ],
          },
        },
        include: {
          rule: true,
          words: { include: { word: true } },
          exercises: { orderBy: { exerciseNumber: 'asc' } },
        },
      });

      // Remove selected proposal from user's active proposals in DB (if matched)
      await tx.lessonProposal.deleteMany({
        where: {
          userId,
          title: dto.ruleTitle,
          isReview: false,
        },
      });

      return lesson;
    });
  }
}
