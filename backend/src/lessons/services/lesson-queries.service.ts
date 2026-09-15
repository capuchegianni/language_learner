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

    const recentLessons = await this.prisma.lesson.findMany({
      where: { userId },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { rule: true },
    });

    const gradedStats = await this.prisma.lesson.aggregate({
      where: {
        userId,
        status: 'GRADED',
      },
      _count: {
        _all: true,
      },
      _avg: {
        overallScore: true,
      },
    });

    const totalLessons = gradedStats._count._all;
    const avgScore =
      gradedStats._avg.overallScore !== null &&
      gradedStats._avg.overallScore !== undefined
        ? Math.round(gradedStats._avg.overallScore)
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
