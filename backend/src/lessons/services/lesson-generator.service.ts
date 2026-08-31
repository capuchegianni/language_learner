import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { GenerateLessonDto } from '../dto/lesson.dto';

@Injectable()
export class LessonGeneratorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  /**
   * Generates a daily lesson based on chosen rule title & target words count.
   */
  async generateLesson(userId: string, dto: GenerateLessonDto) {
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

    // Call AI service to construct & execute prompt
    const content = await this.aiService.generateLesson(
      userId,
      dto.ruleTitle,
      wordsCount,
      knownWordsList,
      knownRulesList,
    );

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
          lessonData: JSON.stringify(content),
          rawPrompt: content.rawPrompt,
          status: 'GENERATED',
          userId,
          words: {
            create: wordEntities.map((w) => ({ wordId: w.id })),
          },
        },
        include: {
          rule: true,
          words: { include: { word: true } },
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
