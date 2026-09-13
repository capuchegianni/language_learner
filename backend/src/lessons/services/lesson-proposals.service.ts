import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService } from '../../ai/ai.service';

@Injectable()
export class LessonProposalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
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

    const newRules = existingProposals.filter((p) => !p.isReview);
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
}
