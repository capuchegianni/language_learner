import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Plan, Prisma } from '../generated/prisma/client';
import { GuardModerationService } from '../moderation/guard-moderation.service';
import { PrismaService } from '../prisma/prisma.service';
import { BanUserDto } from './dto/ban-user.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly guardModerationService: GuardModerationService,
  ) {}

  async getUsers(query?: string) {
    const whereClause: Prisma.UserWhereInput = {};

    if (query?.trim()) {
      const q = query.trim();
      whereClause.OR = [
        { email: { contains: q } },
        { displayName: { contains: q } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        displayName: true,
        email: true,
        avatarUrl: true,
        plan: true,
        isCustom: true,
        googleId: true,
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

    if (users.length === 0) {
      return [];
    }

    const userHashMap = new Map<string, string>();
    const userHashes: string[] = [];

    for (const u of users) {
      const hash = this.guardModerationService.hashGoogleId(u.googleId);
      userHashMap.set(u.id, hash);
      userHashes.push(hash);
    }

    const now = new Date();
    const startOfUtcDay = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
    );
    const rollingSevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [restrictions, errorEvents] = await Promise.all([
      this.prisma.userAiRestriction.findMany({
        where: {
          userHash: { in: userHashes },
        },
      }),
      this.prisma.guardErrorEvent.findMany({
        where: {
          userHash: { in: userHashes },
          forgiven: false,
          createdAt: { gte: rollingSevenDaysAgo },
        },
        select: {
          userHash: true,
          createdAt: true,
        },
      }),
    ]);

    const activeRestrictionMap = new Map<string, (typeof restrictions)[0]>();
    for (const r of restrictions) {
      if (r.isPermanent || (r.blockedUntil && r.blockedUntil.getTime() > now.getTime())) {
        activeRestrictionMap.set(r.userHash, r);
      }
    }

    const errorCountMap = new Map<string, { daily: number; weekly: number }>();
    for (const event of errorEvents) {
      let counts = errorCountMap.get(event.userHash);
      if (!counts) {
        counts = { daily: 0, weekly: 0 };
        errorCountMap.set(event.userHash, counts);
      }
      counts.weekly++;
      if (event.createdAt >= startOfUtcDay) {
        counts.daily++;
      }
    }

    return users.map((user) => {
      const userHash = userHashMap.get(user.id)!;
      const isAdmin = this.guardModerationService.isUserAdmin(user.email);
      const counts = errorCountMap.get(userHash) || { daily: 0, weekly: 0 };
      const restriction = activeRestrictionMap.get(userHash) ?? null;

      const { googleId, ...rest } = user;
      return {
        ...rest,
        isAdmin,
        guardErrorsDaily: counts.daily,
        guardErrorsWeekly: counts.weekly,
        restriction,
      };
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

  async banUser(userId: string, dto: BanUserDto, adminEmail?: string) {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    if (this.guardModerationService.isUserAdmin(targetUser.email)) {
      throw new BadRequestException('Admin accounts cannot be banned');
    }

    const userHash = this.guardModerationService.hashGoogleId(targetUser.googleId);
    const restriction = await this.guardModerationService.banUser(
      userHash,
      dto.duration,
      dto.reason,
      adminEmail,
    );

    return {
      success: true,
      restriction,
    };
  }

  async unblockUser(userId: string) {
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      throw new NotFoundException(`User with ID '${userId}' not found`);
    }

    const userHash = this.guardModerationService.hashGoogleId(targetUser.googleId);
    await this.guardModerationService.unblockUser(userHash);

    return {
      success: true,
      message: 'User unblocked and guard errors forgiven successfully',
    };
  }
}

