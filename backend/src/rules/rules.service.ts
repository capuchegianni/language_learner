import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RulesService {
  constructor(private prisma: PrismaService) {}

  async getAllRules() {
    return this.prisma.rule.findMany({
      include: {
        _count: {
          select: { lessons: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async searchRules(query: string) {
    return this.prisma.rule.findMany({
      where: {
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

  async createRule(data: {
    title: string;
    explanation: string;
    examples: string; // JSON string
    exceptions?: string;
  }) {
    return this.prisma.rule.create({ data });
  }

  async updateRule(
    id: string,
    data: {
      title?: string;
      explanation?: string;
      examples?: string;
      exceptions?: string;
    },
  ) {
    return this.prisma.rule.update({
      where: { id },
      data,
    });
  }

  async deleteRule(id: string) {
    return this.prisma.rule.delete({ where: { id } });
  }
}
