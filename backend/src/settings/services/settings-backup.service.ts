import { Injectable } from '@nestjs/common';
import { LessonStatus, Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingsCryptoService } from './settings-crypto.service';
import { ImportPayload, ResetDataDto } from '../dto/settings.dto';

interface LegacyExercise1Data {
  instruction?: string;
  type?: string;
  targetWords?: string[];
  sampleWords?: string[];
  subjectPronouns?: string[];
}

interface LegacyExercise2Data {
  instruction?: string;
  sentencesToTranslate?: string[];
}

interface LegacyExercise3Data {
  instruction?: string;
  textToTranslate?: string;
}

interface LegacyLessonData {
  exercise1?: LegacyExercise1Data;
  exercise2?: LegacyExercise2Data;
  exercise3?: LegacyExercise3Data;
}

interface LegacyFeedbackData {
  overallScore?: number;
  generalFeedback?: string;
  handwrittenOcrText?: string;
  exercise1?: { score?: number | null; feedback?: string | null; corrections?: Prisma.InputJsonValue };
  exercise2?: { score?: number | null; feedback?: string | null; corrections?: Prisma.InputJsonValue };
  exercise3?: { score?: number | null; feedback?: string | null; corrections?: Prisma.InputJsonValue };
}

interface LegacyUserSubmissionData {
  ex1?: string;
  ex2?: string;
  ex3?: string;
}

const SECRET_SETTING_KEY = 'api_key';

@Injectable()
export class SettingsBackupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: SettingsCryptoService,
  ) {}

  private parseDate(val: unknown): Date | undefined {
    if (!val || typeof val !== 'string' && !(val instanceof Date) && typeof val !== 'number') return undefined;
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
        const settingsList: Array<{ key: string; value: string; updatedAt?: string | Date }> = Array.isArray(settings)
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
          if (!l.exercises && !l.lessonData) continue;
          const ruleId = await resolveRule(l.ruleTitle || (l.rule ? l.rule.title : ''));
          const createdAt = this.parseDate(l.createdAt);
          const updatedAt = this.parseDate(l.updatedAt);

          let newLesson;

          if (Array.isArray(l.exercises) && l.exercises.length > 0) {
            const safeParseJson = (
              val: unknown,
              fallback: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue = Prisma.DbNull,
            ): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue => {
              if (val === undefined || val === null) return fallback;
              if (typeof val === 'string') {
                try {
                  return JSON.parse(val) as Prisma.InputJsonValue;
                } catch {
                  return fallback !== Prisma.DbNull ? fallback : val;
                }
              }
              return val as Prisma.InputJsonValue;
            };

            newLesson = await tx.lesson.create({
              data: {
                title: l.title || null,
                date: this.parseDate(l.date) || new Date(),
                ruleId,
                isReview: !!l.isReview,
                wordsCount: l.wordsCount || 5,
                status: (l.status as LessonStatus) || LessonStatus.GENERATED,
                submissionImage: l.submissionImage || null,
                overallScore: l.overallScore ?? null,
                generalFeedback: l.generalFeedback || null,
                handwrittenOcrText: l.handwrittenOcrText || null,
                rawPrompt: l.rawPrompt || null,
                userId,
                ...(createdAt ? { createdAt } : {}),
                ...(updatedAt ? { updatedAt } : {}),
                exercises: {
                  create: l.exercises.map((ex) => ({
                    exerciseNumber: ex.exerciseNumber,
                    instruction: ex.instruction || `Exercise ${ex.exerciseNumber}`,
                    content: safeParseJson(ex.content, {}) as Prisma.InputJsonValue,
                    userSubmission: safeParseJson(ex.userSubmission, Prisma.DbNull) as Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue,
                    score: ex.score ?? null,
                    feedback: ex.feedback ?? null,
                    corrections: safeParseJson(ex.corrections, Prisma.DbNull) as Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue,
                    createdAt: this.parseDate(ex.createdAt) || undefined,
                    updatedAt: this.parseDate(ex.updatedAt) || undefined,
                  })),
                },
              },
            });
          } else {
            // Legacy backup import fallback
            let ld: LegacyLessonData = {};
            try {
              ld = typeof l.lessonData === 'string' ? JSON.parse(l.lessonData) : (l.lessonData as LegacyLessonData) || {};
            } catch {}
            let fb: LegacyFeedbackData | null = null;
            if (l.aiFeedback) {
              try {
                fb = typeof l.aiFeedback === 'string' ? JSON.parse(l.aiFeedback) : (l.aiFeedback as LegacyFeedbackData) || null;
              } catch {}
            }
            let us: LegacyUserSubmissionData | null = null;
            if (l.userSubmission) {
              try {
                us = typeof l.userSubmission === 'string' ? JSON.parse(l.userSubmission) : (l.userSubmission as LegacyUserSubmissionData) || null;
              } catch {}
            }

            newLesson = await tx.lesson.create({
              data: {
                title: l.title || null,
                date: this.parseDate(l.date) || new Date(),
                ruleId,
                isReview: !!l.isReview,
                wordsCount: l.wordsCount || 5,
                status: (l.status as LessonStatus) || LessonStatus.GENERATED,
                submissionImage: l.submissionImage || null,
                overallScore: l.overallScore ?? fb?.overallScore ?? null,
                generalFeedback: l.generalFeedback ?? fb?.generalFeedback ?? null,
                handwrittenOcrText: l.handwrittenOcrText ?? fb?.handwrittenOcrText ?? null,
                rawPrompt: l.rawPrompt || null,
                userId,
                ...(createdAt ? { createdAt } : {}),
                ...(updatedAt ? { updatedAt } : {}),
                exercises: {
                  create: [
                    {
                      exerciseNumber: 1,
                      instruction: ld?.exercise1?.instruction || 'Exercise 1',
                      content: {
                        type: ld?.exercise1?.type,
                        targetWords: ld?.exercise1?.targetWords || [],
                        sampleWords: ld?.exercise1?.sampleWords,
                        subjectPronouns: ld?.exercise1?.subjectPronouns,
                      },
                      userSubmission: us?.ex1 ? { text: us.ex1 } : undefined,
                      score: fb?.exercise1?.score ?? null,
                      feedback: fb?.exercise1?.feedback ?? null,
                      corrections: fb?.exercise1?.corrections ?? undefined,
                    },
                    {
                      exerciseNumber: 2,
                      instruction: ld?.exercise2?.instruction || 'Exercise 2',
                      content: {
                        sentencesToTranslate: ld?.exercise2?.sentencesToTranslate || [],
                      },
                      userSubmission: us?.ex2 ? { text: us.ex2 } : undefined,
                      score: fb?.exercise2?.score ?? null,
                      feedback: fb?.exercise2?.feedback ?? null,
                      corrections: fb?.exercise2?.corrections ?? undefined,
                    },
                    {
                      exerciseNumber: 3,
                      instruction: ld?.exercise3?.instruction || 'Exercise 3',
                      content: {
                        textToTranslate: ld?.exercise3?.textToTranslate || '',
                      },
                      userSubmission: us?.ex3 ? { text: us.ex3 } : undefined,
                      score: fb?.exercise3?.score ?? null,
                      feedback: fb?.exercise3?.feedback ?? null,
                      corrections: fb?.exercise3?.corrections ?? undefined,
                    },
                  ],
                },
              },
            });
          }

          const targetWords: string[] = Array.isArray(l.targetWords)
            ? l.targetWords
            : Array.isArray(l.words)
            ? l.words
                .map((w: unknown) => {
                  if (typeof w === 'string') return w;
                  if (w && typeof w === 'object') {
                    const wordObj = w as { word?: { targetLanguage?: string }; targetLanguage?: string };
                    return wordObj.word?.targetLanguage || wordObj.targetLanguage;
                  }
                  return undefined;
                })
                .filter((w): w is string => Boolean(w))
            : [];
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
            status: true,
            submissionImage: true,
            overallScore: true,
            generalFeedback: true,
            handwrittenOcrText: true,
            rawPrompt: true,
            createdAt: true,
            updatedAt: true,
            rule: { select: { title: true } },
            words: { select: { word: { select: { targetLanguage: true } } } },
            exercises: {
              select: {
                exerciseNumber: true,
                instruction: true,
                content: true,
                userSubmission: true,
                score: true,
                feedback: true,
                corrections: true,
                createdAt: true,
                updatedAt: true,
              },
              orderBy: { exerciseNumber: 'asc' },
            },
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
