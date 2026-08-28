import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiLlmCallerService } from './services/ai-llm-caller.service';
import { AiPromptService } from './services/ai-prompt.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [SettingsModule],
  providers: [AiService, AiLlmCallerService, AiPromptService],
  exports: [AiService, AiLlmCallerService, AiPromptService],
})
export class AiModule {}
