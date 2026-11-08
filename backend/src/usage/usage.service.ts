import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { createHmac } from 'crypto';
import { User } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ActionType,
  ACTION_TYPE_LABELS,
  PLAN_LIMITS,
  Plan,
} from './usage.constants';

export interface UsageSummaryItem {
  used: number;
  limit: number | null;
}

export interface DailyUsageSummary {
  plan: Plan;
  isCustom: boolean;
  date: string;
  usage: Record<ActionType, UsageSummaryItem>;
}

@Injectable()
export class UsageService implements OnModuleInit {
  private readonly logger = new Logger(UsageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.pruneOldUsageRecords();
  }

  getTodayUtcDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private hashGoogleId(googleId: string): string {
    const secret = this.configService.getOrThrow<string>('SESSION_SECRET');
    return createHmac('sha256', secret).update(googleId).digest('hex');
  }

  private async getUserContext(userIdOrUser: string | User): Promise<{
    userHash: string;
    plan: Plan;
    isCustom: boolean;
  }> {
    if (typeof userIdOrUser !== 'string') {
      return {
        userHash: this.hashGoogleId(userIdOrUser.googleId),
        plan: userIdOrUser.plan || Plan.FREE,
        isCustom: userIdOrUser.isCustom,
      };
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userIdOrUser },
      select: { plan: true, isCustom: true, googleId: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      userHash: this.hashGoogleId(user.googleId),
      plan: user.plan || Plan.FREE,
      isCustom: user.isCustom,
    };
  }

  async checkLimit(userIdOrUser: string | User, actionType: ActionType): Promise<void> {
    const { userHash, plan, isCustom } = await this.getUserContext(userIdOrUser);

    if (isCustom) {
      return; // Unlimited on custom plan
    }

    const limit = PLAN_LIMITS[plan]?.[actionType] ?? PLAN_LIMITS.FREE[actionType];
    const todayDate = this.getTodayUtcDate();

    const record = await this.prisma.usageRecord.findUnique({
      where: {
        userHash_actionType_date: {
          userHash,
          actionType,
          date: todayDate,
        },
      },
    });

    const used = record?.count ?? 0;
    if (used >= limit) {
      const label = ACTION_TYPE_LABELS[actionType] || actionType;
      throw new ForbiddenException(
        `Daily limit reached (${used}/${limit} ${label}). Resets at midnight UTC.`,
      );
    }
  }

  async incrementUsage(userIdOrUser: string | User, actionType: ActionType): Promise<void> {
    const { userHash } = await this.getUserContext(userIdOrUser);
    const todayDate = this.getTodayUtcDate();

    await this.prisma.usageRecord.upsert({
      where: {
        userHash_actionType_date: {
          userHash,
          actionType,
          date: todayDate,
        },
      },
      create: {
        userHash,
        actionType,
        date: todayDate,
        count: 1,
      },
      update: {
        count: { increment: 1 },
      },
    });
  }

  async getDailyUsageSummary(userIdOrUser: string | User): Promise<DailyUsageSummary> {
    const { userHash, plan, isCustom } = await this.getUserContext(userIdOrUser);
    const todayDate = this.getTodayUtcDate();

    const records = await this.prisma.usageRecord.findMany({
      where: {
        userHash,
        date: todayDate,
      },
    });

    const recordMap = new Map<string, number>();
    for (const r of records) {
      recordMap.set(r.actionType, r.count);
    }

    const actions: ActionType[] = [
      ActionType.RULE_PROPOSAL,
      ActionType.LESSON_GENERATION,
      ActionType.LESSON_CORRECTION,
    ];
    const usage = {} as Record<ActionType, UsageSummaryItem>;

    for (const action of actions) {
      const used = recordMap.get(action) ?? 0;
      const limit = isCustom ? null : (PLAN_LIMITS[plan]?.[action] ?? PLAN_LIMITS.FREE[action]);
      usage[action] = { used, limit };
    }

    return {
      plan,
      isCustom,
      date: todayDate,
      usage,
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async pruneOldUsageRecords(): Promise<void> {
    try {
      const cutoff = new Date();
      cutoff.setUTCDate(cutoff.getUTCDate() - 7);
      const cutoffDateStr = cutoff.toISOString().slice(0, 10);

      const { count } = await this.prisma.usageRecord.deleteMany({
        where: {
          date: {
            lt: cutoffDateStr,
          },
        },
      });

      if (count > 0) {
        this.logger.log(
          `Pruned ${count} usage record(s) older than 7 days (before ${cutoffDateStr}).`,
        );
      }
    } catch (err: unknown) {
      this.logger.error(
        'Failed to prune old usage records',
        err instanceof Error ? err.stack : err,
      );
    }
  }
}
