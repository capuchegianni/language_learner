import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class LessonsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  /**
   * Returns AI proposed new rules + 1 random review rule if existing rules exist.
   */
  async getRuleProposals(userId: string, options?: { forceRefresh?: boolean }) {
    const forceRefresh = !!options?.forceRefresh;
    const { targetLanguage } = await this.aiService.getUserLanguages(userId);

    const knownRules = await this.prisma.rule.findMany({
      where: { userId },
      select: { id: true, title: true, explanation: true },
    });
    const knownRuleTitles = knownRules.map((r) => r.title);

    if (forceRefresh) {
      await this.prisma.lessonProposal.deleteMany({ where: { userId } });
    }

    let existingProposals = await this.prisma.lessonProposal.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    // If target language changed, reset proposals for this user
    if (existingProposals.some((p) => p.targetLanguage && p.targetLanguage !== targetLanguage)) {
      await this.prisma.lessonProposal.deleteMany({ where: { userId } });
      existingProposals = [];
    }

    let newRules = existingProposals.filter((p) => !p.isReview);
    let reviewProposal = existingProposals.find((p) => p.isReview);

    // Validate review proposal against known rules
    if (reviewProposal && !knownRules.some((r) => r.title === reviewProposal!.title)) {
      await this.prisma.lessonProposal.delete({ where: { id: reviewProposal.id } });
      reviewProposal = undefined;
    }

    const missingCount = Math.max(0, 3 - newRules.length);

    if (missingCount > 0) {
      const excludeTitles = newRules.map((p) => p.title);
      const generated = await this.aiService.proposeRules(userId, knownRuleTitles, missingCount, excludeTitles);

      for (const p of generated) {
        const created = await this.prisma.lessonProposal.create({
          data: {
            userId,
            title: p.title,
            explanation: p.briefExplanation || '',
            category: p.category || 'Grammar',
            difficulty: p.difficulty || 'Beginner',
            isReview: false,
            targetLanguage,
          },
        });
        newRules.push(created);
      }
    }

    if (!reviewProposal && knownRules.length > 0) {
      const randomIndex = Math.floor(Math.random() * knownRules.length);
      const randomRule = knownRules[randomIndex];
      reviewProposal = await this.prisma.lessonProposal.create({
        data: {
          userId,
          title: randomRule.title,
          explanation: randomRule.explanation,
          isReview: true,
          targetLanguage,
        },
      });
    }

    return {
      proposedNewRules: newRules.map((p) => ({
        id: p.id,
        title: p.title,
        explanation: p.explanation,
        briefExplanation: p.explanation,
        category: p.category || 'Grammar',
        difficulty: p.difficulty || 'Beginner',
      })),
      reviewRuleOption: reviewProposal
        ? {
            id: reviewProposal.id,
            title: reviewProposal.title,
            explanation: reviewProposal.explanation,
            isReview: true,
          }
        : null,
      totalKnownWords: await this.prisma.word.count({ where: { userId } }),
      totalKnownRules: knownRuleTitles.length,
    };
  }

  /**
   * Replaces a single proposal card by generating a new one and updating the DB.
   */
  async replaceProposal(userId: string, index: number) {
    const { targetLanguage } = await this.aiService.getUserLanguages(userId);
    const knownRules = await this.prisma.rule.findMany({
      where: { userId },
      select: { id: true, title: true, explanation: true },
    });
    const knownRuleTitles = knownRules.map((r) => r.title);

    const activeProposals = await this.prisma.lessonProposal.findMany({
      where: { userId, isReview: false },
      orderBy: { createdAt: 'asc' },
    });

    const targetProposal = index >= 0 && index < activeProposals.length ? activeProposals[index] : undefined;
    const excludeTitles = activeProposals.map((p) => p.title);
    const newRules = await this.aiService.proposeRules(userId, knownRuleTitles, 1, excludeTitles);

    if (newRules.length > 0) {
      if (targetProposal) {
        const updated = await this.prisma.lessonProposal.update({
          where: { id: targetProposal.id },
          data: {
            title: newRules[0].title,
            explanation: newRules[0].briefExplanation || '',
            category: newRules[0].category || 'Grammar',
            difficulty: newRules[0].difficulty || 'Beginner',
            targetLanguage,
          },
        });
        activeProposals[index] = updated;
      } else {
        const created = await this.prisma.lessonProposal.create({
          data: {
            userId,
            title: newRules[0].title,
            explanation: newRules[0].briefExplanation || '',
            category: newRules[0].category || 'Grammar',
            difficulty: newRules[0].difficulty || 'Beginner',
            isReview: false,
            targetLanguage,
          },
        });
        activeProposals.push(created);
      }
    }

    let reviewProposal = await this.prisma.lessonProposal.findFirst({
      where: { userId, isReview: true },
    });

    if (!reviewProposal && knownRules.length > 0) {
      const randomIndex = Math.floor(Math.random() * knownRules.length);
      const randomRule = knownRules[randomIndex];
      reviewProposal = await this.prisma.lessonProposal.create({
        data: {
          userId,
          title: randomRule.title,
          explanation: randomRule.explanation,
          isReview: true,
          targetLanguage,
        },
      });
    }

    return {
      proposedNewRules: activeProposals.map((p) => ({
        id: p.id,
        title: p.title,
        explanation: p.explanation,
        briefExplanation: p.explanation,
        category: p.category || 'Grammar',
        difficulty: p.difficulty || 'Beginner',
      })),
      reviewRuleOption: reviewProposal
        ? {
            id: reviewProposal.id,
            title: reviewProposal.title,
            explanation: reviewProposal.explanation,
            isReview: true,
          }
        : null,
      totalKnownWords: await this.prisma.word.count({ where: { userId } }),
      totalKnownRules: knownRuleTitles.length,
    };
  }

  /**
   * Generates a daily lesson based on chosen rule title & target words count.
   */
  async generateLesson(userId: string, dto: { ruleTitle: string; wordsCount?: number; isReview?: boolean }) {
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

  /**
   * Submits user answers (text or uploaded image) and calls AI Vision/Grading engine.
   */
  async submitLesson(
    userId: string,
    lessonId: string,
    userAnswersText: { ex1?: string; ex2?: string; ex3?: string },
    imagePaths?: string[],
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId, userId },
      include: { rule: true },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const parsedContent = JSON.parse(lesson.lessonData);
    const grading = await this.aiService.gradeSubmission(
      userId,
      parsedContent,
      userAnswersText,
      imagePaths,
    );

    const updated = await this.prisma.lesson.update({
      where: { id: lessonId, userId },
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

  async getLessons(userId: string) {
    return this.prisma.lesson.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        rule: true,
        words: { include: { word: true } },
      },
    });
  }

  async getLessonById(userId: string, id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id, userId },
      include: {
        rule: true,
        words: { include: { word: true } },
      },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async deleteLesson(userId: string, id: string) {
    return this.prisma.lesson.delete({ where: { id, userId } });
  }

  async getDashboardStats(userId: string) {
    const totalWords = await this.prisma.word.count({ where: { userId } });
    const totalRules = await this.prisma.rule.count({ where: { userId } });
    const totalLessons = await this.prisma.lesson.count({
      where: { userId, status: 'GRADED' },
    });

    const recentLessons = await this.prisma.lesson.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { rule: true },
    });

    const scores = recentLessons
      .filter((l) => l.overallScore !== null)
      .map((l) => l.overallScore);
    const avgScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    return {
      totalWords,
      totalRules,
      completedLessons: totalLessons,
      averageScore: avgScore,
      recentLessons,
    };
  }
}

