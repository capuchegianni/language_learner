import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RulesService {
  constructor(private prisma: PrismaService) {}

  async getAllRules(userId: string) {
    return this.prisma.rule.findMany({
      where: { userId },
      include: {
        _count: {
          select: { lessons: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async searchRules(userId: string, query: string) {
    return this.prisma.rule.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query } },
          { explanation: { contains: query } },
        ],
      },
      include: {
        _count: {
          select: { lessons: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRule(
    userId: string,
    data: {
      title: string;
      explanation: string;
      examples: string; // JSON string
      exceptions?: string;
    },
  ) {
    return this.prisma.rule.create({ data: { ...data, userId } });
  }

  async updateRule(
    userId: string,
    id: string,
    data: {
      title?: string;
      explanation?: string;
      examples?: string;
      exceptions?: string;
    },
  ) {
    return this.prisma.rule.update({
      where: { id, userId },
      data,
    });
  }

  async deleteRule(userId: string, id: string) {
    return this.prisma.rule.delete({ where: { id, userId } });
  }
}
