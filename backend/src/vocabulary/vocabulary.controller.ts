import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { AuthenticatedRequest } from '../types/request';

@Controller('api/vocabulary')
@UseGuards(AuthenticatedGuard)
export class VocabularyController {
  constructor(private vocabularyService: VocabularyService) {}

  @Get()
  async getWords(@Req() req: AuthenticatedRequest, @Query('q') q?: string) {
    const userId = req.user.id;
    if (q) {
      return this.vocabularyService.searchWords(userId, q);
    }
    return this.vocabularyService.getAllWords(userId);
  }

  @Post()
  async createWord(
    @Req() req: AuthenticatedRequest,
    @Body() body: { targetLanguage: string; nativeLanguage: string; pronunciation?: string; partOfSpeech?: string; notes?: string },
  ) {
    const userId = req.user.id;
    return this.vocabularyService.createWord(userId, body);
  }

  @Put(':id')
  async updateWord(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { targetLanguage?: string; nativeLanguage?: string; pronunciation?: string; partOfSpeech?: string; notes?: string },
  ) {
    const userId = req.user.id;
    return this.vocabularyService.updateWord(userId, id, body);
  }

  @Delete(':id')
  async deleteWord(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user.id;
    return this.vocabularyService.deleteWord(userId, id);
  }
}
