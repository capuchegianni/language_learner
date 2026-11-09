import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedRequest } from '../types/request';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
      throw new UnauthorizedException('Authentication required');
    }

    const adminEmails = (this.configService.get<string>('ADMIN_EMAILS') || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const userEmail = req.user.email?.toLowerCase();

    if (!userEmail || !adminEmails.includes(userEmail)) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}

