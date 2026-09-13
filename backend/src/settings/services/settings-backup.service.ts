import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingsCryptoService } from './settings-crypto.service';
import { ImportPayload, ResetDataDto } from '../dto/settings.dto';

const SECRET_SETTING_KEY = 'api_key';

@Injectable()
export class SettingsBackupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: SettingsCryptoService,
  ) {}

  private parseDate(val: any): Date | undefined {
    if (!val) return undefined;
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
  }

  private normalizeKey(key: string): string {
    return key.toLowerCase() === SECRET_SETTING_KEY ? SECRET_SETTING_KEY : key;
  }

  async importData(userId: string, data: ImportPayload): Promise<{ success: boolean; message: string }> {
    const { overrideSettings, settings, words, rules, lessons } = data;

    await this.prisma.$transaction(async (tx) => {
      // 1. Settings
      if (settings && typeof settings === 'object') {
        const settingsList: Array<{ key: string; value: string; updatedAt?: any }> = Array.isArray(settings)
          ? settings
          : Object.entries(settings).map(([key, value]) => ({ key, value: value as string }));

        for (const s of settingsList) {
          if (!s || typeof s.key !== 'string' || typeof s.value !== 'string') continue;
          const normalizedKey = this.normalizeKey(s.key);

          if (normalizedKey === SECRET_SETTING_KEY && !s.value.trim()) continue;

          const storedValue =
            normalizedKey === SECRET_SETTING_KEY ? this.cryptoService.encryptSecret(s.value) : s.value;
          const updatedAt = this.parseDate(s.updatedAt);

          if (overrideSettings) {
            await tx.setting.upsert({
              where: { userId_key: { userId, key: normalizedKey } },
              update: {
                value: storedValue,
                ...(updatedAt ? { updatedAt } : {}),
              },
              create: {
                key: normalizedKey,
                value: storedValue,
                userId,
                ...(updatedAt ? { updatedAt } : {}),
              },
            });
          } else {
            const existing = await tx.setting.findUnique({ where: { userId_key: { userId, key: normalizedKey } } });
            if (!existing) {
              await tx.setting.create({
                data: {
                  key: normalizedKey,
                  value: storedValue,
                  userId,
                  ...(updatedAt ? { updatedAt } : {}),
                },
              });
            }
          }
        }
      }

      const wordMap = new Map<string, string>();
      const ruleMap = new Map<string, string>();

      // 2. Words
      if (Array.isArray(words)) {
        for (const w of words) {
          if (!w.targetLanguage || !w.nativeLanguage) continue;
          let targetLang = w.targetLanguage;
          let counter = 0;
          while (await tx.word.findUnique({ where: { userId_targetLanguage: { userId, targetLanguage: targetLang } } })) {
            targetLang = `${w.targetLanguage}_${counter}`;
            counter++;
          }
          const createdAt = this.parseDate(w.createdAt);
          const updatedAt = this.parseDate(w.updatedAt);
          const newWord = await tx.word.create({
            data: {
              targetLanguage: targetLang,
              nativeLanguage: w.nativeLanguage,
              pronunciation: w.pronunciation || null,
              partOfSpeech: w.partOfSpeech || null,
              notes: w.notes || null,
              userId,
              ...(createdAt ? { createdAt } : {}),
              ...(updatedAt ? { updatedAt } : {}),
            },
          });
          wordMap.set(w.targetLanguage, newWord.id);
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
          const examplesStr = typeof r.examples === 'string' ? r.examples : JSON.stringify(r.examples);
          const createdAt = this.parseDate(r.createdAt);
          const updatedAt = this.parseDate(r.updatedAt);
          const newRule = await tx.rule.create({
            data: {
              title,
              explanation: r.explanation,
              examples: examplesStr,
              exceptions: r.exceptions ? (typeof r.exceptions === 'string' ? r.exceptions : JSON.stringify(r.exceptions)) : null,
              userId,
              ...(createdAt ? { createdAt } : {}),
              ...(updatedAt ? { updatedAt } : {}),
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
          data: { title, explanation: 'Imported rule', examples: '[]', userId },
        });
        ruleMap.set(title, newRule.id);
        return newRule.id;
      };

      const resolveWord = async (targetLang: string) => {
        if (!targetLang) return null;
        if (wordMap.has(targetLang)) return wordMap.get(targetLang);
        const existing = await tx.word.findUnique({ where: { userId_targetLanguage: { userId, targetLanguage: targetLang } } });
        if (existing) return existing.id;
        const newWord = await tx.word.create({
          data: { targetLanguage: targetLang, nativeLanguage: 'Imported word', userId },
        });
        wordMap.set(targetLang, newWord.id);
        return newWord.id;
      };

      // 4. Lessons
      if (Array.isArray(lessons)) {
        for (const l of lessons) {
          if (!l.lessonData) continue;
          const ruleId = await resolveRule(l.ruleTitle || (l.rule ? l.rule.title : ''));

          const lessonDataStr = typeof l.lessonData === 'string' ? l.lessonData : JSON.stringify(l.lessonData);
          const createdAt = this.parseDate(l.createdAt);
          const updatedAt = this.parseDate(l.updatedAt);

          const newLesson = await tx.lesson.create({
            data: {
              title: l.title || null,
              date: this.parseDate(l.date) || new Date(),
              ruleId,
              isReview: !!l.isReview,
              wordsCount: l.wordsCount || 5,
              lessonData: lessonDataStr,
              status: l.status || 'GENERATED',
              userSubmission: l.userSubmission ? (typeof l.userSubmission === 'string' ? l.userSubmission : JSON.stringify(l.userSubmission)) : null,
              submissionImage: l.submissionImage || null,
              aiFeedback: l.aiFeedback ? (typeof l.aiFeedback === 'string' ? l.aiFeedback : JSON.stringify(l.aiFeedback)) : null,
              overallScore: l.overallScore || null,
              rawPrompt: l.rawPrompt || null,
              userId,
              ...(createdAt ? { createdAt } : {}),
              ...(updatedAt ? { updatedAt } : {}),
            },
          });

          const targetWords = l.targetWords || [];
          for (const kw of targetWords) {
            const wId = await resolveWord(kw);
            if (wId) {
              await tx.lessonWord.create({
                data: { lessonId: newLesson.id, wordId: wId },
              });
            }
          }
        }
      }
    });

    return { success: true, message: 'Data imported successfully' };
  }

  async exportData(
    userId: string,
    include: { settings?: boolean; words?: boolean; rules?: boolean; lessons?: boolean },
  ): Promise<Record<string, any>> {
    return this.prisma.$transaction(async (tx) => {
      const result: Record<string, any> = {};

      if (include.settings) {
        const records = await tx.setting.findMany({
          where: { userId, key: { not: SECRET_SETTING_KEY } },
          select: { key: true, value: true, updatedAt: true },
        });
        result.settings = records;
      }

      if (include.words) {
        result.words = await tx.word.findMany({
          where: { userId },
          select: {
            targetLanguage: true,
            nativeLanguage: true,
            pronunciation: true,
            partOfSpeech: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'asc' },
        });
      }

      if (include.rules) {
        result.rules = await tx.rule.findMany({
          where: { userId },
          select: {
            title: true,
            explanation: true,
            examples: true,
            exceptions: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'asc' },
        });
      }

      if (include.lessons) {
        const lessons = await tx.lesson.findMany({
          where: { userId },
          select: {
            title: true,
            date: true,
            isReview: true,
            wordsCount: true,
            lessonData: true,
            status: true,
            userSubmission: true,
            submissionImage: true,
            aiFeedback: true,
            overallScore: true,
            rawPrompt: true,
            createdAt: true,
            updatedAt: true,
            rule: { select: { title: true } },
            words: { select: { word: { select: { targetLanguage: true } } } },
          },
          orderBy: { date: 'asc' },
        });

        result.lessons = lessons.map((l) => ({
          ...l,
          ruleTitle: l.rule?.title ?? null,
          targetWords: l.words.map((w) => w.word.targetLanguage),
          rule: undefined,
          words: undefined,
        }));
      }

      return result;
    });
  }

  async resetData(
    userId: string,
    options: ResetDataDto,
  ): Promise<{ success: boolean; message: string; resetItems: string[] }> {
    const resetItems: string[] = [];

    await this.prisma.$transaction(async (tx) => {
      // 1. Lessons
      if (options.lessons) {
        await tx.lessonWord.deleteMany({
          where: { lesson: { userId } },
        });
        await tx.lesson.deleteMany({
          where: { userId },
        });
        await tx.lessonProposal.deleteMany({
          where: { userId },
        });
        resetItems.push('lessons');
      }

      // 2. Words
      if (options.words) {
        await tx.lessonWord.deleteMany({
          where: { word: { userId } },
        });
        await tx.word.deleteMany({
          where: { userId },
        });
        resetItems.push('words');
      }

      // 3. Rules
      if (options.rules) {
        await tx.lesson.updateMany({
          where: { userId },
          data: { ruleId: null },
        });
        await tx.rule.deleteMany({
          where: { userId },
        });
        resetItems.push('rules');
      }

      // 4. Settings
      if (options.settings) {
        await tx.setting.deleteMany({
          where: { userId },
        });
        resetItems.push('settings');
      }
    });

    const formattedNames = resetItems.map((item) => item.charAt(0).toUpperCase() + item.slice(1));
    return {
      success: true,
      message:
        resetItems.length > 0
          ? `Successfully reset ${formattedNames.join(', ')}.`
          : 'No data selected to reset.',
      resetItems,
    };
  }
}
