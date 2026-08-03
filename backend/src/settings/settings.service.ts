import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAllSettings(userId: string): Promise<Record<string, string>> {
    const records = await this.prisma.setting.findMany({
      where: { userId },
    });
    const result: Record<string, string> = {};
    for (const rec of records) {
      result[rec.key] = rec.value;
    }
    return result;
  }

  async getSetting(userId: string, key: string): Promise<string> {
    // API_KEY is always read from env, never stored in DB
    if (key === 'API_KEY') {
      const val = process.env.API_KEY || '';
      if (!val) {
        throw new BadRequestException(`Missing AI configuration: Please set the API_KEY environment variable.`);
      }
      return val;
    }

    const record = await this.prisma.setting.findUnique({
      where: { userId_key: { userId, key } },
    });
    if (!record || !record.value) {
      throw new BadRequestException(`Missing AI configuration: ${key} is not set in the Settings menu.`);
    }

    return record.value;
  }

  async updateSettings(userId: string, settings: Record<string, string>): Promise<Record<string, string>> {
    for (const [key, value] of Object.entries(settings)) {
      await this.prisma.setting.upsert({
        where: { userId_key: { userId, key } },
        update: { value },
        create: { key, value, userId },
      });
    }
    return this.getAllSettings(userId);
  }
}
