import { Injectable, BadRequestException } from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

const SECRET_SETTING_KEY = 'api_key';
const SECRET_PREFIX = 'enc:v1:';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  private getEncryptionKey(): Buffer {
    const sessionSecret = process.env.SESSION_SECRET;
    if (!sessionSecret) {
      throw new BadRequestException('Missing SESSION_SECRET: encrypted API keys require SESSION_SECRET to be set.');
    }

    return createHash('sha256').update(sessionSecret).digest();
  }

  private encryptSecret(value: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.getEncryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${SECRET_PREFIX}${iv.toString('base64')}.${authTag.toString('base64')}.${encrypted.toString('base64')}`;
  }

  private decryptSecret(value: string): string {
    if (!value.startsWith(SECRET_PREFIX)) {
      return value;
    }

    const payload = value.slice(SECRET_PREFIX.length);
    const [ivText, authTagText, encryptedText] = payload.split('.');
    if (!ivText || !authTagText || !encryptedText) {
      throw new BadRequestException('Stored API key is corrupted. Please save a new API key.');
    }

    const iv = Buffer.from(ivText, 'base64');
    const authTag = Buffer.from(authTagText, 'base64');
    const encrypted = Buffer.from(encryptedText, 'base64');
    const decipher = createDecipheriv('aes-256-gcm', this.getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  }

  private normalizeKey(key: string): string {
    return key.toLowerCase() === SECRET_SETTING_KEY ? SECRET_SETTING_KEY : key;
  }

  private async upsertSettingValue(userId: string, key: string, value: string) {
    if (key === SECRET_SETTING_KEY) {
      if (!value.trim()) {
        await this.prisma.setting.deleteMany({ where: { userId, key } });
        return;
      }

      const encryptedValue = this.encryptSecret(value);
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

      return this.decryptSecret(record.value);
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

  async importData(userId: string, data: any): Promise<{ success: boolean; message: string }> {
    const { overrideSettings, settings, words, rules, lessons } = data;

    await this.prisma.$transaction(async (tx) => {
      // 1. Settings
      if (settings && typeof settings === 'object') {
        const settingsObj = Array.isArray(settings)
          ? settings.reduce<Record<string, string>>((acc, s) => {
            if (s && typeof s.key === 'string' && typeof s.value === 'string') {
              acc[this.normalizeKey(s.key)] = s.value;
            }
            return acc;
          }, {})
          : settings;

        for (const [key, value] of Object.entries(settingsObj)) {
          if (typeof value !== 'string') continue;
          const normalizedKey = this.normalizeKey(key);

          if (normalizedKey === SECRET_SETTING_KEY && !value.trim()) continue;

          if (overrideSettings) {
            const storedValue = normalizedKey === SECRET_SETTING_KEY ? this.encryptSecret(value) : value;
            await tx.setting.upsert({
              where: { userId_key: { userId, key: normalizedKey } },
              update: { value: storedValue },
              create: { key: normalizedKey, value: storedValue, userId },
            });
          } else {
            const existing = await tx.setting.findUnique({ where: { userId_key: { userId, key: normalizedKey } } });
            if (!existing) {
              const storedValue = normalizedKey === SECRET_SETTING_KEY ? this.encryptSecret(value) : value;
              await tx.setting.create({ data: { key: normalizedKey, value: storedValue, userId } });
            }
          }
        }
      }

      const wordMap = new Map<string, string>();
      const ruleMap = new Map<string, string>();

      // 2. Words
      if (Array.isArray(words)) {
        for (const w of words) {
          if (!w.korean || !w.english) continue;
          let korean = w.korean;
          let counter = 0;
          while (await tx.word.findUnique({ where: { userId_korean: { userId, korean } } })) {
            korean = `${w.korean}_${counter}`;
            counter++;
          }
          const newWord = await tx.word.create({
            data: {
              korean,
              english: w.english,
              pronunciation: w.pronunciation || null,
              partOfSpeech: w.partOfSpeech || null,
              notes: w.notes || null,
              userId,
            },
          });
          wordMap.set(w.korean, newWord.id);
        }
      }

      // 3. Rules
      if (Array.isArray(rules)) {
        for (const r of rules) {
          if (!r.title || !r.explanation || !r.examples) continue;
          let title = r.title;
          let counter = 0;
          while (await tx.rule.findUnique({ where: { userId_title: { userId, title } } })) {
            title = `${r.title}_${counter}`;
            counter++;
          }
          let examplesStr = typeof r.examples === 'string' ? r.examples : JSON.stringify(r.examples);
          const newRule = await tx.rule.create({
            data: {
              title,
              explanation: r.explanation,
              examples: examplesStr,
              exceptions: r.exceptions ? (typeof r.exceptions === 'string' ? r.exceptions : JSON.stringify(r.exceptions)) : null,
              userId,
            },
          });
          ruleMap.set(r.title, newRule.id);
        }
      }

      const resolveRule = async (title: string) => {
        if (!title) return null;
        if (ruleMap.has(title)) return ruleMap.get(title);
        const existing = await tx.rule.findUnique({ where: { userId_title: { userId, title } } });
        if (existing) return existing.id;
        const newRule = await tx.rule.create({
          data: { title, explanation: 'Imported rule', examples: '[]', userId }
        });
        ruleMap.set(title, newRule.id);
        return newRule.id;
      };

      const resolveWord = async (korean: string) => {
        if (!korean) return null;
        if (wordMap.has(korean)) return wordMap.get(korean);
        const existing = await tx.word.findUnique({ where: { userId_korean: { userId, korean } } });
        if (existing) return existing.id;
        const newWord = await tx.word.create({
          data: { korean, english: 'Imported word', userId }
        });
        wordMap.set(korean, newWord.id);
        return newWord.id;
      };

      // 4. Lessons
      if (Array.isArray(lessons)) {
        for (const l of lessons) {
          if (!l.lessonData) continue;
          const ruleId = await resolveRule(l.ruleTitle || (l.rule ? l.rule.title : null));

          let lessonDataStr = typeof l.lessonData === 'string' ? l.lessonData : JSON.stringify(l.lessonData);

          const newLesson = await tx.lesson.create({
            data: {
              title: l.title || null,
              date: l.date ? new Date(l.date) : new Date(),
              ruleId,
              isReview: !!l.isReview,
              wordsCount: l.wordsCount || 5,
              lessonData: lessonDataStr,
              status: l.status || 'GENERATED',
              userSubmission: l.userSubmission ? (typeof l.userSubmission === 'string' ? l.userSubmission : JSON.stringify(l.userSubmission)) : null,
              aiFeedback: l.aiFeedback ? (typeof l.aiFeedback === 'string' ? l.aiFeedback : JSON.stringify(l.aiFeedback)) : null,
              overallScore: l.overallScore || null,
              rawPrompt: l.rawPrompt || null,
              userId,
            },
          });

          const targetWords = l.targetWords || [];
          for (const kw of targetWords) {
            const wId = await resolveWord(kw);
            if (wId) {
              await tx.lessonWord.create({
                data: { lessonId: newLesson.id, wordId: wId }
              });
            }
          }
        }
      }
    });

    return { success: true, message: 'Data imported successfully' };
  }
}
