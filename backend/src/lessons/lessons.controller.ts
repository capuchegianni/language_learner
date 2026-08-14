import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { LessonsService } from './lessons.service';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { AuthenticatedRequest } from '../types/request';

const uploadStorage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

@Controller('api/lessons')
@UseGuards(AuthenticatedGuard)
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  @Get('stats')
  async getStats(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.lessonsService.getDashboardStats(userId);
  }

  @Get('propose-rules')
  async getRuleProposals(@Req() req: AuthenticatedRequest, @Query('count') count?: string, @Query('exclude') exclude?: string) {
    const userId = req.user.id;
    const numCount = count !== undefined ? parseInt(count, 10) : 3;
    const excludeTitles = exclude ? exclude.split(',') : [];
    return this.lessonsService.getRuleProposals(userId, numCount, excludeTitles);
  }

  @Post('generate')
  async generateLesson(
    @Req() req: AuthenticatedRequest,
    @Body() body: { ruleTitle: string; wordsCount?: number; isReview?: boolean },
  ) {
    const userId = req.user.id;
    return this.lessonsService.generateLesson(userId, body);
  }

  @Post(':id/submit')
  @UseInterceptors(
    FilesInterceptor('images', 3, {
      storage: uploadStorage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  async submitLesson(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: { ex1?: string; ex2?: string; ex3?: string },
    @UploadedFiles() files?: Array<Express.Multer.File>,
  ) {
    const userId = req.user.id;
    const imagePaths = files && files.length > 0 ? files.map((f) => f.path) : undefined;
    return this.lessonsService.submitLesson(userId, id, body, imagePaths);
  }

  @Get()
  async getLessons(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.lessonsService.getLessons(userId);
  }

  @Get(':id')
  async getLessonById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user.id;
    return this.lessonsService.getLessonById(userId, id);
  }

  @Delete(':id')
  async deleteLesson(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId = req.user.id;
    return this.lessonsService.deleteLesson(userId, id);
  }
}
