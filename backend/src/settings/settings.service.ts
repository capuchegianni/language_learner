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

  async importData(userId: string, data: any): Promise<{ success: boolean; message: string }> {
    const { overrideSettings, settings, words, rules, lessons } = data;

    await this.prisma.$transaction(async (tx) => {
      // 1. Settings
      if (settings && typeof settings === 'object') {
        const settingsObj = Array.isArray(settings)
          ? settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {})
          : settings;

        for (const [key, value] of Object.entries(settingsObj)) {
          if (typeof value !== 'string') continue;
          if (overrideSettings) {
            await tx.setting.upsert({
              where: { userId_key: { userId, key } },
              update: { value },
              create: { key, value, userId },
            });
          } else {
            const existing = await tx.setting.findUnique({ where: { userId_key: { userId, key } }});
            if (!existing) {
              await tx.setting.create({ data: { key, value, userId } });
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
