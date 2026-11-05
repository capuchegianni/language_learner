import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
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
}

