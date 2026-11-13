import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedRequest } from '../../types/request';
import { GuardModerationService } from '../guard-moderation.service';

@Injectable()
export class AiAccessGuard implements CanActivate {
  constructor(
    private readonly guardModerationService: GuardModerationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!req.user) {
      throw new UnauthorizedException('Authentication required');
    }

    // Admins bypass AI restrictions
    if (this.guardModerationService.isUserAdmin(req.user.email)) {
      return true;
    }

    // BYOK users bypass AI restrictions while isCustom === true
    if (req.user.isCustom === true) {
      return true;
    }

    const userHash = this.guardModerationService.hashGoogleId(req.user.googleId);
    const restriction = await this.guardModerationService.getActiveRestriction(userHash);

    if (restriction) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'Forbidden',
        message: 'AI access suspended.',
        restriction: {
          banType: restriction.banType,
          reason: restriction.reason,
          blockedAt: restriction.blockedAt,
          blockedUntil: restriction.blockedUntil,
          isPermanent: restriction.isPermanent,
          bannedBy: restriction.bannedBy,
        },
      });
    }

    return true;
  }
}
