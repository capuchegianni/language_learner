import {
  Lesson,
  LessonContent,
  GradingResult,
  StructuredCorrection,
  ExerciseGrading,
  CorrectionErrorType,
} from '../types';

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

export interface NormalizedExerciseCorrections {
  corrections: StructuredCorrection[];
  hasLegacyCorrections: boolean;
  legacyCorrections: string[];
}

/**
 * Normalizes correction items.
 * - If corrections contain legacy strings or lack valid `inputId` (or legacy `inputIndex`):
 *   sets `hasLegacyCorrections = true`, stores formatted strings in `legacyCorrections`, and clears `corrections`.
 * - If corrections are modern with `inputId`:
 *   sets `hasLegacyCorrections = false` and populates `corrections`.
 */
export function normalizeExerciseCorrections(rawCorrections: unknown): NormalizedExerciseCorrections {
  if (rawCorrections === null || rawCorrections === undefined) {
    return { corrections: [], hasLegacyCorrections: false, legacyCorrections: [] };
  }

  let parsed = rawCorrections;

  if (typeof rawCorrections === 'string') {
    const trimmed = rawCorrections.trim();
    if (!trimmed) {
      return { corrections: [], hasLegacyCorrections: false, legacyCorrections: [] };
    }
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return { corrections: [], hasLegacyCorrections: true, legacyCorrections: [trimmed] };
    }
  }

  let parsedArray: unknown[];
  if (Array.isArray(parsed)) {
    parsedArray = parsed;
  } else if (parsed && typeof parsed === 'object') {
    parsedArray = [parsed];
  } else {
    return { corrections: [], hasLegacyCorrections: false, legacyCorrections: [] };
  }

  const allowedErrorTypes: readonly CorrectionErrorType[] = [
    'spelling',
    'conjugation',
    'grammar',
    'vocabulary',
    'syntax',
    'other',
  ];

  const modernCorrections: StructuredCorrection[] = [];
  const legacyStrings: string[] = [];
  let isLegacy = false;

  for (const item of parsedArray) {
    if (typeof item === 'string') {
      isLegacy = true;
    } else if (item && typeof item === 'object') {
      const obj = item as Record<string, unknown>;
      let inputId: string | null = null;
      if (typeof obj.inputId === 'string' && obj.inputId.trim()) {
        inputId = obj.inputId.trim().replace(/^input\s*[:#]?\s*/i, '').trim() || null;
      } else if (typeof obj.inputId === 'number' && !isNaN(obj.inputId)) {
        inputId = String(Math.floor(obj.inputId));
      } else if (
        typeof obj.inputIndex === 'number' &&
        !isNaN(obj.inputIndex) &&
        obj.inputIndex >= 0
      ) {
        inputId = String(Math.floor(obj.inputIndex));
      } else if (typeof obj.inputIndex === 'string' && obj.inputIndex.trim()) {
        inputId = obj.inputIndex.trim().replace(/^input\s*[:#]?\s*/i, '').trim() || null;
      }

      if (inputId === null && typeof obj.item === 'string' && obj.item.trim()) {
        const itemMatch = obj.item.match(/^input\s*[:#]?\s*(\d+(?:_\d+)?)$/i);
        if (itemMatch) {
          inputId = itemMatch[1];
        }
      }

      if (inputId === null) {
        isLegacy = true;
      } else {
        const errorTypeStr =
          typeof obj.errorType === 'string' ? obj.errorType : 'other';
        const errorType: CorrectionErrorType = allowedErrorTypes.includes(
          errorTypeStr as CorrectionErrorType,
        )
          ? (errorTypeStr as CorrectionErrorType)
          : 'other';

        modernCorrections.push({
          inputId,
          original: obj.original != null ? String(obj.original) : '',
          expected: obj.expected != null ? String(obj.expected) : '',
          explanation:
            typeof obj.explanation === 'string' ? obj.explanation : '',
          errorType,
        });
      }
    }
  }

  if (isLegacy) {
    const allLegacy: string[] = [];
    for (const item of parsedArray) {
      if (typeof item === 'string') {
        allLegacy.push(item);
      } else if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        const label =
          typeof obj.item === 'string'
            ? obj.item.trim()
            : typeof obj.inputId === 'string'
              ? `Input ${obj.inputId}`
              : '';
        const original = obj.original != null ? String(obj.original).trim() : '';
        const expected = obj.expected != null ? String(obj.expected).trim() : '';
        const explanation =
          typeof obj.explanation === 'string' ? obj.explanation.trim() : '';
        const prefix = label ? `${label}: ` : '';
        const expPart = explanation ? ` (${explanation})` : '';
        allLegacy.push(`${prefix}${original} ➔ ${expected}${expPart}`.trim());
      }
    }
    return {
      corrections: [],
      hasLegacyCorrections: true,
      legacyCorrections: allLegacy,
    };
  }

  return {
    corrections: modernCorrections,
    hasLegacyCorrections: false,
    legacyCorrections: [],
  };
}

export function parseAiFeedback(lesson: Lesson): GradingResult | null {
  if (lesson.overallScore !== null && lesson.overallScore !== undefined) {
    const ex1 = lesson.exercises?.find((e) => e.exerciseNumber === 1);
    const ex2 = lesson.exercises?.find((e) => e.exerciseNumber === 2);
    const ex3 = lesson.exercises?.find((e) => e.exerciseNumber === 3);

    const norm1 = normalizeExerciseCorrections(ex1?.corrections);
    const norm2 = normalizeExerciseCorrections(ex2?.corrections);
    const norm3 = normalizeExerciseCorrections(ex3?.corrections);

    return {
      overallScore: lesson.overallScore ?? 0,
      generalFeedback: lesson.generalFeedback || '',
      handwrittenOcrText: lesson.handwrittenOcrText,
      exercise1: {
        score: ex1?.score ?? 0,
        corrections: norm1.corrections,
        feedback: ex1?.feedback || '',
        hasLegacyCorrections: norm1.hasLegacyCorrections,
        legacyCorrections: norm1.legacyCorrections,
      },
      exercise2: {
        score: ex2?.score ?? 0,
        corrections: norm2.corrections,
        feedback: ex2?.feedback || '',
        hasLegacyCorrections: norm2.hasLegacyCorrections,
        legacyCorrections: norm2.legacyCorrections,
      },
      exercise3: {
        score: ex3?.score ?? 0,
        corrections: norm3.corrections,
        feedback: ex3?.feedback || '',
        hasLegacyCorrections: norm3.hasLegacyCorrections,
        legacyCorrections: norm3.legacyCorrections,
      },
    };
  }

  return null;
}

export interface ParsedUserSubmissionResult {
  ex1?: string;
  ex2?: string;
  ex3?: string;
  ex1Answers?: string[];
  ex2Answers?: string[];
  ex3Answer?: string;
}

export function parseUserSubmission(
  lesson: Lesson,
): ParsedUserSubmissionResult | null {
  if (lesson.exercises && lesson.exercises.length > 0) {
    const parseSub = (sub: any) => {
      if (!sub) return null;
      if (typeof sub === 'string') {
        try {
          return JSON.parse(sub);
        } catch {
          return sub;
        }
      }
      return sub;
    };

    const extractText = (rawSub: any): string => {
      const sub = parseSub(rawSub);
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

    const safeParseContent = (c: any) => {
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
    const ex1Content = safeParseContent(ex1?.content);

    const extractAnswers = (rawSub: any, targetWords?: string[]): string[] => {
      const sub = parseSub(rawSub);
      if (!sub) return [];
      if (Array.isArray(sub.answers)) {
        return sub.answers.map((a: unknown) => String(a ?? ''));
      }
      if (sub.grid && typeof sub.grid === 'object') {
        if (Array.isArray(targetWords) && targetWords.length > 0) {
          return targetWords.map((word) => {
            const v = sub.grid[word];
            return Array.isArray(v) ? JSON.stringify(v) : String(v ?? '');
          });
        }
        return Object.values(sub.grid).map((v: unknown) =>
          Array.isArray(v) ? JSON.stringify(v) : String(v ?? ''),
        );
      }
      if (typeof sub.text === 'string') {
        return [sub.text];
      }
      if (typeof sub === 'string') {
        return sub.split('\n');
      }
      return [];
    };

    const ex1Text = extractText(ex1?.userSubmission);
    const ex2Text = extractText(ex2?.userSubmission);
    const ex3Text = extractText(ex3?.userSubmission);

    const ex1Answers = extractAnswers(ex1?.userSubmission, ex1Content.targetWords);
    const ex2Answers = extractAnswers(ex2?.userSubmission);

    const parsedSub3 = parseSub(ex3?.userSubmission);
    const ex3Answer =
      typeof parsedSub3?.text === 'string'
        ? parsedSub3.text
        : typeof parsedSub3 === 'string'
          ? parsedSub3
          : ex3Text;

    if (
      ex1Text ||
      ex2Text ||
      ex3Text ||
      ex1Answers.length > 0 ||
      ex2Answers.length > 0 ||
      ex3Answer
    ) {
      return {
        ex1: ex1Text,
        ex2: ex2Text,
        ex3: ex3Text,
        ex1Answers,
        ex2Answers,
        ex3Answer,
      };
    }
  }

  return null;
}
