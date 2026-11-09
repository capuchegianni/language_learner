import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../generated/prisma/client';
import { AuthenticatedRequest } from '../types/request';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  isUserAdmin(email?: string): boolean {
    if (!email) return false;
    const adminEmails = (this.configService.get<string>('ADMIN_EMAILS') || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    return adminEmails.includes(email.toLowerCase());
  }

  getProfile(user: User) {
    return {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      plan: user.plan,
      isCustom: user.isCustom,
      isAdmin: this.isUserAdmin(user.email),
    };
  }

  getStatus(authenticated: boolean, user?: User) {
    if (authenticated && user) {
      return {
        authenticated: true,
        user: this.getProfile(user),
      };
    }
    return { authenticated: false };
  }

  async logout(req: AuthenticatedRequest, res: Response, redirect = true): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      req.logout((err) => {
        if (err) {
          return reject(new InternalServerErrorException('Logout failed'));
        }

        req.session.destroy((sessionErr) => {
          if (sessionErr) {
            return reject(new InternalServerErrorException('Session destroy failed'));
          }
          res.clearCookie('connect.sid');
          if (redirect) {
            const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/login`);
          }
          resolve();
        });
      });
    });
  }

  async deleteAccount(userId: string, req: AuthenticatedRequest, res: Response): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.lessonWord.deleteMany({ where: { lesson: { userId } } });
      await tx.lessonWord.deleteMany({ where: { word: { userId } } });
      await tx.lesson.deleteMany({ where: { userId } });
      await tx.word.deleteMany({ where: { userId } });
      await tx.rule.deleteMany({ where: { userId } });
      await tx.setting.deleteMany({ where: { userId } });
      await tx.lessonProposal.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });

    await this.logout(req, res, false);
    res.json({ success: true, message: 'Account and all associated data deleted successfully.' });
  }
}
