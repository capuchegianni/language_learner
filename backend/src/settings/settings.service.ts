import { Injectable, BadRequestException } from '@nestjs/common';
import { Plan } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsCryptoService } from './services/settings-crypto.service';
import { SettingsBackupService } from './services/settings-backup.service';
import { UsageService } from '../usage/usage.service';
import { ImportPayload, ResetDataDto } from './dto/settings.dto';

const SECRET_SETTING_KEY = 'api_key';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: SettingsCryptoService,
    private readonly backupService: SettingsBackupService,
    private readonly usageService: UsageService,
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
    const [records, apiKeyRecord, user] = await Promise.all([
      this.prisma.setting.findMany({
        where: { userId, key: { notIn: [SECRET_SETTING_KEY, 'API_KEY'] } },
      }),
      this.prisma.setting.findUnique({
        where: { userId_key: { userId, key: SECRET_SETTING_KEY } },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true, isCustom: true },
      }),
    ]);

    const result: Record<string, string | boolean> = {};
    for (const rec of records) {
      result[rec.key] = rec.value;
    }

    result.hasApiKey = !!apiKeyRecord;
    result.plan = user?.plan || Plan.FREE;
    result.isCustom = user?.isCustom || false;
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

  async getSettings(userId: string, keys: string[]): Promise<Record<string, string>> {
    const normalizedKeys = keys.map((k) => this.normalizeKey(k));
    const records = await this.prisma.setting.findMany({
      where: {
        userId,
        key: { in: normalizedKeys },
      },
    });

    const result: Record<string, string> = {};
    for (const rec of records) {
      if (rec.key === SECRET_SETTING_KEY) {
        if (rec.value) {
          result[rec.key] = this.cryptoService.decryptSecret(rec.value);
        }
      } else {
        result[rec.key] = rec.value;
      }
    }
    return result;
  }

  async updateSettings(userId: string, settings: Record<string, any>): Promise<Record<string, string | boolean>> {
    if (settings.isCustom !== undefined) {
      const isCustomBool = typeof settings.isCustom === 'boolean'
        ? settings.isCustom
        : settings.isCustom === 'true';
      await this.prisma.user.update({
        where: { id: userId },
        data: { isCustom: isCustomBool },
      });
    }

    for (const [key, value] of Object.entries(settings)) {
      if (key === 'isCustom' || key === 'plan') continue;
      if (typeof value !== 'string') continue;
      await this.upsertSettingValue(userId, this.normalizeKey(key), value);
    }
    return this.getAllSettings(userId);
  }

  async getUsage(userId: string) {
    return this.usageService.getDailyUsageSummary(userId);
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
