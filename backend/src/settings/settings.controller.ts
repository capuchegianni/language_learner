import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { AuthenticatedRequest } from '../types/request';

@Controller('api/settings')
@UseGuards(AuthenticatedGuard)
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  async getSettings(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.settingsService.getAllSettings(userId);
  }

  @Post()
  async updateSettings(@Req() req: AuthenticatedRequest, @Body() body: Record<string, string>) {
    const userId = req.user.id;
    return this.settingsService.updateSettings(userId, body);
  }
}
