import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LessonQueryDto } from '../dto/lesson.dto';

@Injectable()
export class LessonQueriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getLessons(userId: string, options?: LessonQueryDto) {
    const where: any = { userId };
    if (options?.status) {
      where.status = options.status.toUpperCase();
    }
    if (options?.q) {
      const q = options.q.trim();
      if (q) {
        where.OR = [
          { title: { contains: q } },
          { rule: { title: { contains: q } } },
        ];
      }
    }

    return this.prisma.lesson.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        rule: true,
        words: { include: { word: true } },
      },
    });
  }

  async getLessonById(userId: string, id: string) {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id, userId },
      include: {
        rule: true,
        words: { include: { word: true } },
      },
    });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID '${id}' not found`);
    }
    return lesson;
  }

  async deleteLesson(userId: string, id: string) {
    const existing = await this.prisma.lesson.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException(`Lesson with ID '${id}' not found`);
    }

    return this.prisma.lesson.delete({ where: { id } });
  }

  async getDashboardStats(userId: string) {
    const totalWords = await this.prisma.word.count({ where: { userId } });
    const totalRules = await this.prisma.rule.count({ where: { userId } });
    const totalLessons = await this.prisma.lesson.count({
      where: { userId, status: 'GRADED' },
    });

    const recentLessons = await this.prisma.lesson.findMany({
      where: { userId },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { rule: true },
    });

    const scores = recentLessons
      .map((l) => l.overallScore)
      .filter((score): score is number => typeof score === 'number');
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
