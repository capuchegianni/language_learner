import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SettingsCryptoService } from './services/settings-crypto.service';
import { SettingsBackupService } from './services/settings-backup.service';
import { UsageModule } from '../usage/usage.module';

@Module({
  imports: [UsageModule],
  controllers: [SettingsController],
  providers: [SettingsService, SettingsCryptoService, SettingsBackupService],
  exports: [SettingsService, SettingsCryptoService, SettingsBackupService],
})
export class SettingsModule {}
