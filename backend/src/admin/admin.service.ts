import { Injectable, NotFoundException } from '@nestjs/common';
import { Plan, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(query?: string) {
    const whereClause: Prisma.UserWhereInput = {};

    if (query?.trim()) {
      const q = query.trim();
      whereClause.OR = [
        { email: { contains: q } },
        { displayName: { contains: q } },
      ];
    }

    return this.prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        displayName: true,
        email: true,
        avatarUrl: true,
        plan: true,
        isCustom: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            lessons: true,
            words: true,
            rules: true,
          },
        },
      },
    });
  }

  async updateUserPlan(userId: string, plan: Plan) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { plan },
      select: {
        id: true,
        displayName: true,
        email: true,
        avatarUrl: true,
        plan: true,
        isCustom: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            lessons: true,
            words: true,
            rules: true,
          },
        },
      },
    });
  }
}

