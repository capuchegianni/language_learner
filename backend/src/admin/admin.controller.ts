import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { AuthenticatedRequest } from '../types/request';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { BanUserDto } from './dto/ban-user.dto';
import { UpdateUserPlanDto } from './dto/update-plan.dto';

@Controller('admin')
@UseGuards(AuthenticatedGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getUsers(@Query('q') query?: string) {
    return this.adminService.getUsers(query);
  }

  @Patch('users/:id/plan')
  async updateUserPlan(
    @Param('id') userId: string,
    @Body() dto: UpdateUserPlanDto,
  ) {
    return this.adminService.updateUserPlan(userId, dto.plan);
  }

  @Post('users/:id/ban')
  @HttpCode(HttpStatus.OK)
  async banUser(
    @Param('id') userId: string,
    @Body() dto: BanUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.adminService.banUser(userId, dto, req.user?.email);
  }

  @Post('users/:id/unblock')
  @HttpCode(HttpStatus.OK)
  async unblockUser(@Param('id') userId: string) {
    return this.adminService.unblockUser(userId);
  }
}

