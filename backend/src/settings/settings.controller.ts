import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { AuthenticatedRequest } from '../types/request';
import { ExportDataQueryDto, ImportPayload, ResetDataDto } from './dto/settings.dto';

@Controller('settings')
@UseGuards(AuthenticatedGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.settingsService.getAllSettings(userId);
  }

  @Get('export')
  async exportData(
    @Req() req: AuthenticatedRequest,
    @Query() query: ExportDataQueryDto,
  ) {
    const userId = req.user.id;
    return this.settingsService.exportData(userId, {
      settings: query.settings === 'true',
      words: query.words === 'true',
      rules: query.rules === 'true',
      lessons: query.lessons === 'true',
    });
  }

  @Post()
  async updateSettings(@Req() req: AuthenticatedRequest, @Body() body: Record<string, string>) {
    const userId = req.user.id;
    return this.settingsService.updateSettings(userId, body);
  }

  @Post('import')
  async importData(@Req() req: AuthenticatedRequest, @Body() body: ImportPayload) {
    const userId = req.user.id;
    return this.settingsService.importData(userId, body);
  }

  @Post('reset')
  async resetData(
    @Req() req: AuthenticatedRequest,
    @Body() body: ResetDataDto,
  ) {
    const userId = req.user.id;
    return this.settingsService.resetData(userId, body || {});
  }
}
