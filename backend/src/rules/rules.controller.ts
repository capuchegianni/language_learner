import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { RulesService } from './rules.service';

@Controller('api/rules')
export class RulesController {
  constructor(private rulesService: RulesService) {}

  @Get()
  async getRules(@Query('q') q?: string) {
    if (q) {
      return this.rulesService.searchRules(q);
    }
    return this.rulesService.getAllRules();
  }

  @Post()
  async createRule(
    @Body() body: { title: string; explanation: string; examples: string; exceptions?: string },
  ) {
    return this.rulesService.createRule(body);
  }

  @Put(':id')
  async updateRule(
    @Param('id') id: string,
    @Body() body: { title?: string; explanation?: string; examples?: string; exceptions?: string },
  ) {
    return this.rulesService.updateRule(id, body);
  }

  @Delete(':id')
  async deleteRule(@Param('id') id: string) {
    return this.rulesService.deleteRule(id);
  }
}
