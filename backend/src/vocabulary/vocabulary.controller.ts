import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { AuthenticatedRequest } from '../types/request';
import { CreateWordDto, UpdateWordDto, WordQueryDto } from './dto/word.dto';

@Controller('vocabulary')
@UseGuards(AuthenticatedGuard)
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Get()
  async getWords(@Req() req: AuthenticatedRequest, @Query() query: WordQueryDto) {
    const userId = req.user.id;
    if (query.q) {
      return this.vocabularyService.searchWords(userId, query.q);
    }
    return this.vocabularyService.getAllWords(userId);
  }

  @Post()
  async createWord(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateWordDto,
  ) {
    const userId = req.user.id;
    return this.vocabularyService.createWord(userId, dto);
  }

  @Put(':id')
  async updateWord(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateWordDto,
  ) {
    const userId = req.user.id;
    return this.vocabularyService.updateWord(userId, id, dto);
  }

  @Delete(':id')
  async deleteWord(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user.id;
    return this.vocabularyService.deleteWord(userId, id);
  }
}
