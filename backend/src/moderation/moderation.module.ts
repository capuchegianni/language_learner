import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { GuardModerationService } from './guard-moderation.service';
import { AiAccessGuard } from './guards/ai-access.guard';

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [GuardModerationService, AiAccessGuard],
  exports: [GuardModerationService, AiAccessGuard],
})
export class ModerationModule {}
