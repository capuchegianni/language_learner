import { Logger } from '@nestjs/common';
import { z } from 'zod';
import {
  CorrectionErrorType,
  StructuredCorrection,
  GradingResult,
} from '../interfaces/ai.interfaces';

const logger = new Logger('GradingSchema');

export const VALID_CORRECTION_ERROR_TYPES = new Set<CorrectionErrorType>([
  'spelling',
  'conjugation',
  'grammar',
  'vocabulary',
  'syntax',
  'other',
]);

export const CorrectionErrorTypeEnum = z.enum([
  'spelling',
  'conjugation',
  'grammar',
  'vocabulary',
  'syntax',
  'other',
]);

/**
 * Clamps and coerces an unknown score to an integer in the range [0, 100].
 */
export function clampScore(val: unknown, fallback = 0): number {
  if (val === null || val === undefined || val === '') {
    return fallback;
  }
  let num: number;
  if (typeof val === 'number') {
    num = val;
  } else if (typeof val === 'string') {
    const cleaned = val.trim().replace(/%/g, '');
    num = Number(cleaned);
    if (isNaN(num)) {
      num = parseFloat(cleaned);
    }
  } else {
    num = Number(val);
  }

  if (isNaN(num) || !isFinite(num)) {
    return fallback;
  }
  return Math.max(0, Math.min(100, Math.round(num)));
}

/**
 * Repairs an unknown correction item into a valid StructuredCorrection.
 * Handles legacy strings, unknown errorTypes, and malformed objects.
 */
export function repairCorrectionItem(raw: unknown): StructuredCorrection {
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    return {
      item: trimmed,
      original: '',
      expected: trimmed,
      explanation: trimmed,
      errorType: 'other',
    };
  }

  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const item =
      typeof obj.item === 'string'
        ? obj.item.trim()
        : obj.item != null
          ? String(obj.item)
          : 'Correction';
    const original =
      typeof obj.original === 'string'
        ? obj.original.trim()
        : obj.original != null
          ? String(obj.original)
          : '';
    const expected =
      typeof obj.expected === 'string'
        ? obj.expected.trim()
        : obj.expected != null
          ? String(obj.expected)
          : '';
    const explanation =
      typeof obj.explanation === 'string'
        ? obj.explanation.trim()
        : obj.explanation != null
          ? String(obj.explanation)
          : '';

    let errorType: CorrectionErrorType = 'other';
    if (typeof obj.errorType === 'string') {
      const normalized = obj.errorType.trim().toLowerCase() as CorrectionErrorType;
      if (VALID_CORRECTION_ERROR_TYPES.has(normalized)) {
        errorType = normalized;
      }
    }

    return { item, original, expected, explanation, errorType };
  }

  return {
    item: 'Correction',
    original: '',
    expected: '',
    explanation: raw != null ? String(raw) : '',
    errorType: 'other',
  };
}

export const StructuredCorrectionSchema = z.preprocess(
  repairCorrectionItem,
  z.object({
    item: z.string(),
    original: z.string(),
    expected: z.string(),
    explanation: z.string(),
    errorType: CorrectionErrorTypeEnum,
  }),
);

export const ExerciseGradingSchema = z.preprocess(
  (raw: unknown) => {
    if (!raw || typeof raw !== 'object') {
      return { score: 0, corrections: [], feedback: '' };
    }
    const obj = raw as Record<string, unknown>;
    const score = clampScore(obj.score, 0);
    const feedback =
      typeof obj.feedback === 'string'
        ? obj.feedback.trim()
        : obj.feedback != null
          ? String(obj.feedback)
          : '';

    let rawCorrections = obj.corrections;
    if (!Array.isArray(rawCorrections)) {
      rawCorrections = [];
    }
    const corrections = (rawCorrections as unknown[]).map(repairCorrectionItem);

    return { score, feedback, corrections };
  },
  z.object({
    score: z.number().int().min(0).max(100),
    corrections: z.array(StructuredCorrectionSchema),
    feedback: z.string(),
  }),
);

export const GradingResultSchema = z.preprocess(
  (raw: unknown) => {
    let input = raw;
    if (typeof raw === 'string') {
      try {
        input = JSON.parse(raw);
      } catch (parseErr: unknown) {
        const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
        const stack = parseErr instanceof Error ? parseErr.stack : undefined;
        logger.error(
          `Failed to parse stringified JSON in GradingResultSchema: ${msg}. Raw output: ${raw.slice(0, 300)}`,
          stack,
        );
        throw new Error(`AI grading output is not valid JSON: ${msg}`);
      }
    }
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      const msg = `Grading payload must be a JSON object, received ${input === null ? 'null' : Array.isArray(input) ? 'array' : typeof input}`;
      logger.error(msg);
      throw new Error(msg);
    }
    const obj = input as Record<string, unknown>;

    const ex1 = ExerciseGradingSchema.parse(obj.exercise1);
    const ex2 = ExerciseGradingSchema.parse(obj.exercise2);
    const ex3 = ExerciseGradingSchema.parse(obj.exercise3);

    let overallScore: number;
    const cleanedOverallScore =
      obj.overallScore !== undefined && obj.overallScore !== null && obj.overallScore !== ''
        ? typeof obj.overallScore === 'string'
          ? obj.overallScore.trim().replace(/%/g, '')
          : obj.overallScore
        : null;

    const hasExplicitOverallScore =
      cleanedOverallScore !== null &&
      !Number.isNaN(Number(cleanedOverallScore));

    if (hasExplicitOverallScore) {
      overallScore = clampScore(obj.overallScore, 0);
    } else {
      const avg = Math.round((ex1.score + ex2.score + ex3.score) / 3);
      overallScore = clampScore(avg, 0);
    }

    const generalFeedback =
      typeof obj.generalFeedback === 'string'
        ? obj.generalFeedback.trim()
        : obj.generalFeedback != null
          ? String(obj.generalFeedback)
          : '';

    const handwrittenOcrText =
      typeof obj.handwrittenOcrText === 'string'
        ? obj.handwrittenOcrText.trim()
        : undefined;

    return {
      overallScore,
      generalFeedback,
      exercise1: ex1,
      exercise2: ex2,
      exercise3: ex3,
      handwrittenOcrText,
    };
  },
  z.object({
    overallScore: z.number().int().min(0).max(100),
    generalFeedback: z.string(),
    exercise1: ExerciseGradingSchema,
    exercise2: ExerciseGradingSchema,
    exercise3: ExerciseGradingSchema,
    handwrittenOcrText: z.string().optional(),
  }),
);

/**
 * Validates, coerces, and auto-repairs raw LLM output into a compliant GradingResult.
 * Coerces minor formatting quirks (scores, legacy strings, missing fields).
 * If the payload is fundamentally invalid or unparseable, logs the full diagnostic
 * error and throws an explicit Error so upstream services can fail cleanly
 * without consuming quota or recording a false 0-score lesson.
 */
export function validateAndRepairGrading(raw: unknown): GradingResult {
  const result = GradingResultSchema.safeParse(raw);
  if (result.success) {
    return result.data;
  }

  const errorSummary = result.error.issues
    .map((e) => `${e.path.join('.') || 'root'}: ${e.message}`)
    .join('; ');

  logger.error(
    `GradingResult validation failed: ${errorSummary}`,
    JSON.stringify(result.error.issues, null, 2),
  );

  throw new Error(`AI grading output validation failed: ${errorSummary}`);
}
