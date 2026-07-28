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
  async getRuleProposals(count: number = 3, excludeTitles: string[] = []) {
    const knownRules = await this.prisma.rule.findMany({ select: { title: true } });
    const knownRuleTitles = knownRules.map((r) => r.title);

    const proposed = await this.aiService.proposeRules(knownRuleTitles, count, excludeTitles);

    let reviewRule = null;
    if (knownRuleTitles.length > 0) {
      const randomIndex = Math.floor(Math.random() * knownRuleTitles.length);
      const randomRule = await this.prisma.rule.findFirst({
        where: { title: knownRuleTitles[randomIndex] },
      });
      if (randomRule) {
        reviewRule = {
          id: randomRule.id,
          title: randomRule.title,
          explanation: randomRule.explanation,
          isReview: true,
        };
      }
    }

    return {
      proposedNewRules: proposed,
      reviewRuleOption: reviewRule,
      totalKnownWords: await this.prisma.word.count(),
      totalKnownRules: knownRuleTitles.length,
    };
  }

  /**
   * Generates a daily lesson based on chosen rule title & target words count.
   */
  async generateLesson(dto: { ruleTitle: string; wordsCount?: number; isReview?: boolean }) {
    const wordsCount = dto.wordsCount || 5;
    const isReview = !!dto.isReview;

    const knownWords = await this.prisma.word.findMany({ select: { korean: true } });
    const knownRules = await this.prisma.rule.findMany({ select: { title: true } });

    const knownWordsList = knownWords.map((w) => w.korean);
    const knownRulesList = knownRules.map((r) => r.title);

    // Call AI service to construct & execute prompt
    const content = await this.aiService.generateLesson(
      dto.ruleTitle,
      wordsCount,
      knownWordsList,
      knownRulesList,
    );

    // Find or create rule entity in database
    let ruleEntity = await this.prisma.rule.findUnique({
      where: { title: dto.ruleTitle },
    });

    if (!ruleEntity) {
      ruleEntity = await this.prisma.rule.create({
        data: {
          title: content.rule.title,
          explanation: content.rule.explanation,
          examples: JSON.stringify(content.rule.examples || []),
          exceptions: content.rule.exceptions || null,
        },
      });
    }

    // Upsert new daily words into word bank
    const wordEntities = [];
    for (const nw of content.newWords || []) {
      if (!nw.korean) continue;
      let word = await this.prisma.word.findUnique({
        where: { korean: nw.korean },
      });
      if (!word) {
        word = await this.prisma.word.create({
          data: {
            korean: nw.korean,
            english: nw.english || '',
            pronunciation: nw.pronunciation || null,
            partOfSpeech: nw.partOfSpeech || null,
          },
        });
      }
      wordEntities.push(word);
    }

    // Save generated lesson entity
    const lesson = await this.prisma.lesson.create({
      data: {
        title: `Lesson: ${content.rule.title}`,
        ruleId: ruleEntity.id,
        isReview,
        wordsCount,
        lessonData: JSON.stringify(content),
        rawPrompt: content.rawPrompt,
        status: 'GENERATED',
        words: {
          create: wordEntities.map((w) => ({ wordId: w.id })),
        },
      },
      include: {
        rule: true,
        words: { include: { word: true } },
      },
    });

    return lesson;
  }

  /**
   * Submits user answers (text or uploaded image) and calls AI Vision/Grading engine.
   */
  async submitLesson(
    lessonId: string,
    userAnswersText: { ex1?: string; ex2?: string; ex3?: string },
    imagePaths?: string[],
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { rule: true },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const parsedContent = JSON.parse(lesson.lessonData);
    const grading = await this.aiService.gradeSubmission(
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

  async getLessons() {
    return this.prisma.lesson.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        rule: true,
        words: { include: { word: true } },
      },
    });
  }

  async getLessonById(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        rule: true,
        words: { include: { word: true } },
      },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async deleteLesson(id: string) {
    return this.prisma.lesson.delete({ where: { id } });
  }

  async getDashboardStats() {
    const totalWords = await this.prisma.word.count();
    const totalRules = await this.prisma.rule.count();
    const totalLessons = await this.prisma.lesson.count({
      where: { status: 'GRADED' },
    });

    const recentLessons = await this.prisma.lesson.findMany({
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

  async resetStats() {
    await this.prisma.lesson.deleteMany();
    return { success: true, message: 'All lesson history has been reset.' };
  }
}
