import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';

@Controller('api/vocabulary')
export class VocabularyController {
  constructor(private vocabularyService: VocabularyService) {}

  @Get()
  async getWords(@Query('q') q?: string) {
    if (q) {
      return this.vocabularyService.searchWords(q);
    }
    return this.vocabularyService.getAllWords();
  }

  @Post()
  async createWord(
    @Body() body: { korean: string; english: string; pronunciation?: string; partOfSpeech?: string; notes?: string },
  ) {
    return this.vocabularyService.createWord(body);
  }

  @Put(':id')
  async updateWord(
    @Param('id') id: string,
    @Body() body: { korean?: string; english?: string; pronunciation?: string; partOfSpeech?: string; notes?: string },
  ) {
    return this.vocabularyService.updateWord(id, body);
  }

  @Delete(':id')
  async deleteWord(@Param('id') id: string) {
    return this.vocabularyService.deleteWord(id);
  }
}
