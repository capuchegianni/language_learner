import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { RulesService } from './rules.service';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { AuthenticatedRequest } from '../types/request';

@Controller('api/rules')
@UseGuards(AuthenticatedGuard)
export class RulesController {
  constructor(private rulesService: RulesService) {}

  @Get()
  async getRules(@Req() req: AuthenticatedRequest, @Query('q') q?: string) {
    const userId = req.user.id;
    if (q) {
      return this.rulesService.searchRules(userId, q);
    }
    return this.rulesService.getAllRules(userId);
  }

  @Post()
  async createRule(
    @Req() req: AuthenticatedRequest,
    @Body() body: { title: string; explanation: string; examples: string; exceptions?: string },
  ) {
    const userId = req.user.id;
    return this.rulesService.createRule(userId, body);
  }

  @Put(':id')
  async updateRule(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { title?: string; explanation?: string; examples?: string; exceptions?: string },
  ) {
    const userId = req.user.id;
    return this.rulesService.updateRule(userId, id, body);
  }

  @Delete(':id')
  async deleteRule(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user.id;
    return this.rulesService.deleteRule(userId, id);
  }
}
