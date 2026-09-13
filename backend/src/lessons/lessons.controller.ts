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
import {
  GenerateLessonDto,
  LessonQueryDto,
  ReplaceProposalDto,
  RuleProposalQueryDto,
  SubmitLessonDto,
} from './dto/lesson.dto';

const uploadStorage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

@Controller('lessons')
@UseGuards(AuthenticatedGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get('stats')
  async getStats(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.lessonsService.getDashboardStats(userId);
  }

  @Get('propose-rules')
  async getRuleProposals(
    @Req() req: AuthenticatedRequest,
    @Query() query: RuleProposalQueryDto,
  ) {
    const userId = req.user.id;
    const forceRefresh = query.refresh === 'true';
    return this.lessonsService.getRuleProposals(userId, { forceRefresh });
  }

  @Post('propose-rules/replace')
  async replaceProposal(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ReplaceProposalDto,
  ) {
    const userId = req.user.id;
    return this.lessonsService.replaceProposal(userId, dto.index ?? 0);
  }

  @Post('generate')
  async generateLesson(
    @Req() req: AuthenticatedRequest,
    @Body() dto: GenerateLessonDto,
  ) {
    const userId = req.user.id;
    return this.lessonsService.generateLesson(userId, dto);
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
    @Body() dto: SubmitLessonDto,
    @UploadedFiles() files?: Array<Express.Multer.File>,
  ) {
    const userId = req.user.id;
    const imagePaths = files && files.length > 0 ? files.map((f) => f.path) : undefined;
    return this.lessonsService.submitLesson(userId, id, dto, imagePaths);
  }

  @Get()
  async getLessons(
    @Req() req: AuthenticatedRequest,
    @Query() query: LessonQueryDto,
  ) {
    const userId = req.user.id;
    return this.lessonsService.getLessons(userId, query);
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
