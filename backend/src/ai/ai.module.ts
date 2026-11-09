import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AiService } from './ai.service';
import { AiLlmCallerService } from './services/ai-llm-caller.service';
import { AiPromptService } from './services/ai-prompt.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [SettingsModule, PrismaModule, ConfigModule],
  providers: [AiService, AiLlmCallerService, AiPromptService],
  exports: [AiService, AiLlmCallerService, AiPromptService],
})
export class AiModule {}
