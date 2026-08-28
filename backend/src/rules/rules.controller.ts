import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { RulesService } from './rules.service';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { AuthenticatedRequest } from '../types/request';
import { CreateRuleDto, UpdateRuleDto, RuleQueryDto } from './dto/rule.dto';

@Controller('api/rules')
@UseGuards(AuthenticatedGuard)
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Get()
  async getRules(@Req() req: AuthenticatedRequest, @Query() query: RuleQueryDto) {
    const userId = req.user.id;
    if (query.q) {
      return this.rulesService.searchRules(userId, query.q);
    }
    return this.rulesService.getAllRules(userId);
  }

  @Post()
  async createRule(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateRuleDto,
  ) {
    const userId = req.user.id;
    return this.rulesService.createRule(userId, dto);
  }

  @Put(':id')
  async updateRule(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateRuleDto,
  ) {
    const userId = req.user.id;
    return this.rulesService.updateRule(userId, id, dto);
  }

  @Delete(':id')
  async deleteRule(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user.id;
    return this.rulesService.deleteRule(userId, id);
  }
}
