import { Lesson, LessonContent, GradingResult } from '../types';

export function parseLessonContent(lesson: Lesson): LessonContent | null {
  if (lesson.exercises && lesson.exercises.length > 0) {
    const ex1 = lesson.exercises.find((e) => e.exerciseNumber === 1);
    const ex2 = lesson.exercises.find((e) => e.exerciseNumber === 2);
    const ex3 = lesson.exercises.find((e) => e.exerciseNumber === 3);

    const safeParse = (c: any) => {
      if (!c) return {};
      if (typeof c === 'string') {
        try {
          return JSON.parse(c);
        } catch {
          return {};
        }
      }
      return c;
    };

    const ex1Content = safeParse(ex1?.content);
    const ex2Content = safeParse(ex2?.content);
    const ex3Content = safeParse(ex3?.content);

    const ruleExamples = lesson.rule?.examples
      ? typeof lesson.rule.examples === 'string'
        ? JSON.parse(lesson.rule.examples)
        : lesson.rule.examples
      : [];

    return {
      rule: {
        title: lesson.rule?.title || lesson.title || '',
        explanation: lesson.rule?.explanation || '',
        examples: Array.isArray(ruleExamples) ? ruleExamples : [],
        exceptions: lesson.rule?.exceptions,
      },
      newWords:
        lesson.words?.map((w) => ({
          targetLanguage: w.word.targetLanguage,
          nativeLanguage: w.word.nativeLanguage,
          pronunciation: w.word.pronunciation,
          partOfSpeech: w.word.partOfSpeech,
        })) || [],
      exercise1: {
        instruction: ex1?.instruction || 'Exercise 1',
        targetWords: ex1Content.targetWords || [],
        sampleWords: ex1Content.sampleWords || [],
        type: ex1Content.type,
        subjectPronouns: ex1Content.subjectPronouns,
      },
      exercise2: {
        instruction: ex2?.instruction || 'Exercise 2',
        sentencesToTranslate: ex2Content.sentencesToTranslate || [],
      },
      exercise3: {
        instruction: ex3?.instruction || 'Exercise 3',
        textToTranslate: ex3Content.textToTranslate || '',
      },
      rawPrompt: lesson.rawPrompt || '',
    };
  }

  return null;
}

export function parseAiFeedback(lesson: Lesson): GradingResult | null {
  if (lesson.overallScore !== null && lesson.overallScore !== undefined) {
    const ex1 = lesson.exercises?.find((e) => e.exerciseNumber === 1);
    const ex2 = lesson.exercises?.find((e) => e.exerciseNumber === 2);
    const ex3 = lesson.exercises?.find((e) => e.exerciseNumber === 3);

    const safeParse = (c: any) => {
      if (!c) return [];
      if (typeof c === 'string') {
        try {
          return JSON.parse(c);
        } catch {
          return [];
        }
      }
      return c;
    };

    return {
      overallScore: lesson.overallScore ?? 0,
      generalFeedback: lesson.generalFeedback || '',
      handwrittenOcrText: lesson.handwrittenOcrText,
      exercise1: {
        score: ex1?.score ?? 0,
        corrections: safeParse(ex1?.corrections),
        feedback: ex1?.feedback || '',
      },
      exercise2: {
        score: ex2?.score ?? 0,
        corrections: safeParse(ex2?.corrections),
        feedback: ex2?.feedback || '',
      },
      exercise3: {
        score: ex3?.score ?? 0,
        corrections: safeParse(ex3?.corrections),
        feedback: ex3?.feedback || '',
      },
    };
  }

  return null;
}

export function parseUserSubmission(
  lesson: Lesson,
): { ex1?: string; ex2?: string; ex3?: string } | null {
  if (lesson.exercises && lesson.exercises.length > 0) {
    const extractText = (sub: any): string => {
      if (!sub) return '';
      if (typeof sub === 'string') return sub;
      if (typeof sub.text === 'string') return sub.text;
      if (Array.isArray(sub.answers)) return sub.answers.join('\n');
      if (sub.grid && typeof sub.grid === 'object') {
        return Object.entries(sub.grid)
          .map(([k, v]) => `${k} | ${Array.isArray(v) ? v.join(' | ') : v}`)
          .join('\n');
      }
      return '';
    };

    const ex1 = lesson.exercises.find((e) => e.exerciseNumber === 1);
    const ex2 = lesson.exercises.find((e) => e.exerciseNumber === 2);
    const ex3 = lesson.exercises.find((e) => e.exerciseNumber === 3);

    const ex1Text = extractText(ex1?.userSubmission);
    const ex2Text = extractText(ex2?.userSubmission);
    const ex3Text = extractText(ex3?.userSubmission);

    if (ex1Text || ex2Text || ex3Text) {
      return { ex1: ex1Text, ex2: ex2Text, ex3: ex3Text };
    }
  }

  return null;
}
