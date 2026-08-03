import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleOAuthGuard } from './google-oauth.guard';
import { AuthenticatedGuard } from './authenticated.guard';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthenticatedRequest } from '../types/request';

@Controller('api/auth')
export class AuthController {
  constructor(private configService: ConfigService) {}

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  googleLogin() {
    // Guard will redirect to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  googleCallback(@Res() res: Response) {
    // After successful login, redirect to frontend
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    res.redirect(frontendUrl);
  }

  @Get('me')
  @UseGuards(AuthenticatedGuard)
  getProfile(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    return {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      avatarUrl: user.avatarUrl,
    };
  }

  @Get('status')
  getStatus(@Req() req: AuthenticatedRequest) {
    if (req.isAuthenticated()) {
      const user = req.user;
      return {
        authenticated: true,
        user: {
          id: user.id,
          displayName: user.displayName,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      };
    }
    return { authenticated: false };
  }

  @Get('logout')
  logout(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }

      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          return res.status(500).json({ message: 'Session destroy failed' });
        }
        res.clearCookie('connect.sid');
        res.redirect(`${frontendUrl}/login`);
      });
    });
  }
}
