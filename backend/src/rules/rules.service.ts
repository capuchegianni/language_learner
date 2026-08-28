import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRuleDto, UpdateRuleDto } from './dto/rule.dto';

@Injectable()
export class RulesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllRules(userId: string) {
    return this.prisma.rule.findMany({
      where: { userId },
      include: {
        _count: {
          select: { lessons: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async searchRules(userId: string, query: string) {
    const trimmed = query.trim();
    return this.prisma.rule.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: trimmed } },
          { explanation: { contains: trimmed } },
        ],
      },
      include: {
        _count: {
          select: { lessons: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRule(userId: string, data: CreateRuleDto) {
    return this.prisma.rule.create({
      data: {
        title: data.title,
        explanation: data.explanation,
        examples: data.examples,
        exceptions: data.exceptions || null,
        userId,
      },
    });
  }

  async updateRule(userId: string, id: string, data: UpdateRuleDto) {
    const existing = await this.prisma.rule.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException(`Rule with ID '${id}' not found`);
    }

    return this.prisma.rule.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.explanation ? { explanation: data.explanation } : {}),
        ...(data.examples !== undefined ? { examples: data.examples } : {}),
        ...(data.exceptions !== undefined ? { exceptions: data.exceptions || null } : {}),
      },
    });
  }

  async deleteRule(userId: string, id: string) {
    const existing = await this.prisma.rule.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException(`Rule with ID '${id}' not found`);
    }

    return this.prisma.rule.delete({ where: { id } });
  }
}
