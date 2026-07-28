import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { LessonsService } from './lessons.service';

const uploadStorage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

@Controller('api/lessons')
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  @Get('stats')
  async getStats() {
    return this.lessonsService.getDashboardStats();
  }

  @Delete('stats')
  async resetStats() {
    return this.lessonsService.resetStats();
  }

  @Get('propose-rules')
  async getRuleProposals(@Query('count') count?: string, @Query('exclude') exclude?: string) {
    const numCount = count ? parseInt(count, 10) : 3;
    const excludeTitles = exclude ? exclude.split(',') : [];
    return this.lessonsService.getRuleProposals(numCount, excludeTitles);
  }

  @Post('generate')
  async generateLesson(
    @Body() body: { ruleTitle: string; wordsCount?: number; isReview?: boolean },
  ) {
    return this.lessonsService.generateLesson(body);
  }

  @Post(':id/submit')
  @UseInterceptors(
    FilesInterceptor('images', 3, {
      storage: uploadStorage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  async submitLesson(
    @Param('id') id: string,
    @Body() body: { ex1?: string; ex2?: string; ex3?: string },
    @UploadedFiles() files?: Array<Express.Multer.File>,
  ) {
    const imagePaths = files && files.length > 0 ? files.map((f) => f.path) : undefined;
    return this.lessonsService.submitLesson(id, body, imagePaths);
  }

  @Get()
  async getLessons() {
    return this.lessonsService.getLessons();
  }

  @Get(':id')
  async getLessonById(@Param('id') id: string) {
    return this.lessonsService.getLessonById(id);
  }

  @Delete(':id')
  async deleteLesson(@Param('id') id: string) {
    return this.lessonsService.deleteLesson(id);
  }
}
