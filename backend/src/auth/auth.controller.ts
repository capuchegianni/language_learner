import {
  Controller,
  Delete,
  Get,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { GoogleOAuthGuard } from './google-oauth.guard';
import { GoogleOAuthExceptionFilter } from './google-oauth.filter';
import { AuthenticatedGuard } from './authenticated.guard';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthenticatedRequest } from '../types/request';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  @UseFilters(GoogleOAuthExceptionFilter)
  googleLogin() {
    // Guard will redirect to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @UseFilters(GoogleOAuthExceptionFilter)
  googleCallback(@Res() res: Response) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    res.redirect(frontendUrl);
  }

  @Get('me')
  @UseGuards(AuthenticatedGuard)
  getProfile(@Req() req: AuthenticatedRequest) {
    return this.authService.getProfile(req.user);
  }

  @Get('status')
  getStatus(@Req() req: AuthenticatedRequest) {
    return this.authService.getStatus(req.isAuthenticated(), req.user);
  }

  @Get('logout')
  async logout(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    return this.authService.logout(req, res);
  }

  @Delete('account')
  @UseGuards(AuthenticatedGuard)
  async deleteAccount(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    return this.authService.deleteAccount(req.user.id, req, res);
  }
}
