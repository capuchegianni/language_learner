import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';

@Catch()
export class GoogleOAuthExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GoogleOAuthExceptionFilter.name);

  constructor(private configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

    const message = exception instanceof Error ? exception.message : String(exception);
    this.logger.warn(`Google OAuth authentication failed: ${message}`);

    const queryError = typeof request.query?.error === 'string' ? request.query.error : undefined;
    let errorParam = 'auth_failed';
    if (queryError === 'access_denied' || queryError === 'consent_required') {
      errorParam = 'cancelled';
    }

    if (!response.headersSent) {
      response.redirect(`${frontendUrl}/login?error=${errorParam}`);
    }
  }
}
