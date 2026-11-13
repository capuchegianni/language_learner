import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import {
  BanType,
  UserAiRestriction,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface GuardErrorRecordResult {
  restricted: boolean;
  restriction?: UserAiRestriction;
}

@Injectable()
export class GuardModerationService {
  private readonly logger = new Logger(GuardModerationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Computes HMAC-SHA256 of googleId using SESSION_SECRET.
   */
  hashGoogleId(googleId: string): string {
    const secret = this.configService.getOrThrow<string>('SESSION_SECRET');
    return createHmac('sha256', secret).update(googleId).digest('hex');
  }

  /**
   * Checks whether the given email belongs to an administrator.
   */
  isUserAdmin(email?: string): boolean {
    if (!email) return false;
    const adminEmails = (this.configService.get<string>('ADMIN_EMAILS') || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    return adminEmails.includes(email.toLowerCase());
  }

  /**
   * Records a guard error event and determines if automated restriction thresholds are exceeded.
   * - Daily UTC threshold: >= 3 errors in current UTC day -> 48-hour cooldown (COOLDOWN_48H).
   * - Rolling 7-day threshold: >= 6 errors in rolling 7 days -> 7-day ban (BAN_7D).
   * - BYOK (isCustom: true) and Admin users are exempt (no event recorded, no restriction).
   * - Existing permanent or longer restrictions are preserved (no downgrades).
   */
  async recordGuardError(userOrId: {
    id?: string;
    googleId: string;
    email?: string;
    isCustom?: boolean;
  } | string): Promise<GuardErrorRecordResult> {
    let user: {
      id?: string;
      googleId: string;
      email?: string;
      isCustom?: boolean;
    };

    if (typeof userOrId === 'string') {
      const foundUser = await this.prisma.user.findUnique({
        where: { id: userOrId },
        select: { id: true, googleId: true, email: true, isCustom: true },
      });
      if (!foundUser) {
        this.logger.warn(`User with id ${userOrId} not found when recording guard error.`);
        return { restricted: false };
      }
      user = foundUser;
    } else {
      user = userOrId;
    }

    if (user.isCustom === true) {
      this.logger.debug('Guard error ignored for BYOK user.');
      return { restricted: false };
    }

    if (this.isUserAdmin(user.email)) {
      this.logger.debug('Guard error ignored for Admin user.');
      return { restricted: false };
    }

    const userHash = this.hashGoogleId(user.googleId);

    // Record the guard error event
    await this.prisma.guardErrorEvent.create({
      data: {
        userHash,
        forgiven: false,
      },
    });

    const now = new Date();
    const startOfUtcDay = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
    );
    const rollingSevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [dailyErrors, weeklyErrors] = await Promise.all([
      this.prisma.guardErrorEvent.count({
        where: {
          userHash,
          forgiven: false,
          createdAt: { gte: startOfUtcDay },
        },
      }),
      this.prisma.guardErrorEvent.count({
        where: {
          userHash,
          forgiven: false,
          createdAt: { gte: rollingSevenDaysAgo },
        },
      }),
    ]);

    this.logger.warn(
      `User ${userHash} recorded prompt guard error. Daily count: ${dailyErrors}, Weekly count: ${weeklyErrors}`,
    );

    let newBanType: BanType | null = null;
    let newBlockedUntil: Date | null = null;
    let newReason: string | null = null;

    if (weeklyErrors >= 6) {
      newBanType = BanType.BAN_7D;
      newBlockedUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      newReason =
        'Exceeded maximum prompt guard errors (6 errors in 7 days). AI access suspended for 7 days.';
    } else if (dailyErrors >= 3) {
      newBanType = BanType.COOLDOWN_48H;
      newBlockedUntil = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      newReason =
        'Exceeded daily prompt guard errors (3 errors in a UTC day). AI access in cooldown for 48 hours.';
    }

    if (!newBanType || !newBlockedUntil || !newReason) {
      const active = await this.getActiveRestriction(userHash);
      return { restricted: !!active, restriction: active ?? undefined };
    }

    // Check existing restriction to prevent downgrading an existing longer/permanent ban
    const existing = await this.prisma.userAiRestriction.findUnique({
      where: { userHash },
    });

    if (existing) {
      if (existing.isPermanent) {
        this.logger.warn(
          `User ${userHash} triggered automated restriction, but is already permanently banned.`,
        );
        return { restricted: true, restriction: existing };
      }

      if (existing.blockedUntil && existing.blockedUntil.getTime() > newBlockedUntil.getTime()) {
        this.logger.warn(
          `User ${userHash} triggered automated restriction, but existing ban until ${existing.blockedUntil.toISOString()} is longer.`,
        );
        return { restricted: true, restriction: existing };
      }
    }

    const restriction = await this.prisma.userAiRestriction.upsert({
      where: { userHash },
      create: {
        userHash,
        banType: newBanType,
        reason: newReason,
        blockedAt: now,
        blockedUntil: newBlockedUntil,
        isPermanent: false,
        bannedBy: 'SYSTEM',
      },
      update: {
        banType: newBanType,
        reason: newReason,
        blockedAt: now,
        blockedUntil: newBlockedUntil,
        isPermanent: false,
        bannedBy: 'SYSTEM',
      },
    });

    this.logger.warn(
      `Applied ${newBanType} restriction to user ${userHash} until ${newBlockedUntil.toISOString()}`,
    );

    return { restricted: true, restriction };
  }

  /**
   * Retrieves an active restriction for the given userHash.
   * Returns null if no restriction exists or if an existing temporary restriction has expired.
   */
  async getActiveRestriction(userHash: string): Promise<UserAiRestriction | null> {
    const restriction = await this.prisma.userAiRestriction.findUnique({
      where: { userHash },
    });

    if (!restriction) {
      return null;
    }

    if (restriction.isPermanent) {
      return restriction;
    }

    if (restriction.blockedUntil && restriction.blockedUntil.getTime() > Date.now()) {
      return restriction;
    }

    return null;
  }

  /**
   * Returns the count of unforgiven guard errors in the current UTC day and rolling 7 days.
   */
  async getGuardErrorCounts(userHash: string): Promise<{ daily: number; weekly: number }> {
    const now = new Date();
    const startOfUtcDay = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
    );
    const rollingSevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [daily, weekly] = await Promise.all([
      this.prisma.guardErrorEvent.count({
        where: {
          userHash,
          forgiven: false,
          createdAt: { gte: startOfUtcDay },
        },
      }),
      this.prisma.guardErrorEvent.count({
        where: {
          userHash,
          forgiven: false,
          createdAt: { gte: rollingSevenDaysAgo },
        },
      }),
    ]);

    return { daily, weekly };
  }

  /**
   * Transactionally unblocks a user: deletes active restriction and marks all prior error events as forgiven.
   */
  async unblockUser(userHash: string): Promise<{ deleted: number; forgiven: number }> {
    const [deletedResult, forgivenResult] = await this.prisma.$transaction([
      this.prisma.userAiRestriction.deleteMany({
        where: { userHash },
      }),
      this.prisma.guardErrorEvent.updateMany({
        where: { userHash, forgiven: false },
        data: { forgiven: true },
      }),
    ]);

    this.logger.log(
      `Unblocked user ${userHash}: deleted ${deletedResult.count} restrictions, marked ${forgivenResult.count} events forgiven`,
    );

    return {
      deleted: deletedResult.count,
      forgiven: forgivenResult.count,
    };
  }

  /**
   * Manually bans a user with a duration preset or permanent status.
   */
  async banUser(
    userHash: string,
    durationPreset: string,
    reason?: string,
    bannedBy?: string,
  ): Promise<UserAiRestriction> {
    const now = new Date();
    let blockedUntil: Date | null = null;
    let isPermanent = false;

    const normalized = durationPreset.toLowerCase();
    switch (normalized) {
      case '1h':
        blockedUntil = new Date(now.getTime() + 1 * 60 * 60 * 1000);
        break;
      case '24h':
        blockedUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case '48h':
        blockedUntil = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        break;
      case '7d':
        blockedUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case '1m':
        blockedUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        blockedUntil = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
        break;
      case 'permanent':
        isPermanent = true;
        blockedUntil = null;
        break;
      default:
        throw new BadRequestException(`Invalid ban duration preset: ${durationPreset}`);
    }

    const restriction = await this.prisma.userAiRestriction.upsert({
      where: { userHash },
      create: {
        userHash,
        banType: BanType.MANUAL,
        reason: reason || 'Access restricted by administrator.',
        blockedAt: now,
        blockedUntil,
        isPermanent,
        bannedBy: bannedBy || 'ADMIN',
      },
      update: {
        banType: BanType.MANUAL,
        reason: reason || 'Access restricted by administrator.',
        blockedAt: now,
        blockedUntil,
        isPermanent,
        bannedBy: bannedBy || 'ADMIN',
      },
    });

    this.logger.log(
      `Manually banned user ${userHash} with duration ${durationPreset} until ${blockedUntil?.toISOString() ?? 'PERMANENT'} by ${bannedBy || 'ADMIN'}`,
    );

    return restriction;
  }
}
