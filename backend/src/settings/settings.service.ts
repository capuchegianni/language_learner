import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsCryptoService } from './services/settings-crypto.service';
import { SettingsBackupService } from './services/settings-backup.service';
import { ImportPayload, ResetDataDto } from './dto/settings.dto';

const SECRET_SETTING_KEY = 'api_key';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: SettingsCryptoService,
    private readonly backupService: SettingsBackupService,
  ) {}

  private normalizeKey(key: string): string {
    return key.toLowerCase() === SECRET_SETTING_KEY ? SECRET_SETTING_KEY : key;
  }

  private async upsertSettingValue(userId: string, key: string, value: string) {
    if (key === SECRET_SETTING_KEY) {
      if (!value.trim()) {
        await this.prisma.setting.deleteMany({ where: { userId, key } });
        return;
      }

      const encryptedValue = this.cryptoService.encryptSecret(value);
      await this.prisma.setting.upsert({
        where: { userId_key: { userId, key } },
        update: { value: encryptedValue },
        create: { key, value: encryptedValue, userId },
      });
      return;
    }

    await this.prisma.setting.upsert({
      where: { userId_key: { userId, key } },
      update: { value },
      create: { key, value, userId },
    });
  }

  async getAllSettings(userId: string): Promise<Record<string, string | boolean>> {
    const [records, apiKeyRecord] = await Promise.all([
      this.prisma.setting.findMany({
        where: { userId, key: { notIn: [SECRET_SETTING_KEY, 'API_KEY'] } },
      }),
      this.prisma.setting.findUnique({
        where: { userId_key: { userId, key: SECRET_SETTING_KEY } },
      }),
    ]);

    const result: Record<string, string | boolean> = {};
    for (const rec of records) {
      result[rec.key] = rec.value;
    }

    result.hasApiKey = !!apiKeyRecord;
    return result;
  }

  async getSetting(userId: string, key: string): Promise<string> {
    const normalizedKey = this.normalizeKey(key);

    if (normalizedKey === SECRET_SETTING_KEY) {
      const record = await this.prisma.setting.findUnique({
        where: { userId_key: { userId, key: normalizedKey } },
      });

      if (!record || !record.value) {
        throw new BadRequestException('Missing AI configuration: API key is not set in the Settings menu.');
      }

      return this.cryptoService.decryptSecret(record.value);
    }

    const record = await this.prisma.setting.findUnique({
      where: { userId_key: { userId, key: normalizedKey } },
    });
    if (!record || !record.value) {
      throw new BadRequestException(`Missing AI configuration: ${normalizedKey} is not set in the Settings menu.`);
    }

    return record.value;
  }

  async updateSettings(userId: string, settings: Record<string, string>): Promise<Record<string, string | boolean>> {
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value !== 'string') continue;
      await this.upsertSettingValue(userId, this.normalizeKey(key), value);
    }
    return this.getAllSettings(userId);
  }

  async importData(userId: string, data: ImportPayload): Promise<{ success: boolean; message: string }> {
    return this.backupService.importData(userId, data);
  }

  async exportData(
    userId: string,
    include: { settings?: boolean; words?: boolean; rules?: boolean; lessons?: boolean },
  ): Promise<Record<string, any>> {
    return this.backupService.exportData(userId, include);
  }

  async resetData(
    userId: string,
    options: ResetDataDto,
  ): Promise<{ success: boolean; message: string; resetItems: string[] }> {
    return this.backupService.resetData(userId, options);
  }
}
