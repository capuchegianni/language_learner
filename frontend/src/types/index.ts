export interface User {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  plan?: 'FREE' | 'PREMIUM';
  isCustom?: boolean;
  isAdmin?: boolean;
}

export type BanType = 'COOLDOWN_48H' | 'BAN_7D' | 'MANUAL';

export type BanDurationPreset = '1h' | '24h' | '48h' | '7d' | '1m' | '1y' | 'Permanent';

export interface UserAiRestriction {
  id?: string;
  userHash?: string;
  banType: BanType;
  reason?: string | null;
  blockedAt: string;
  blockedUntil?: string | null;
  isPermanent: boolean;
  bannedBy?: string | null;
}

export interface BanUserPayload {
  duration: BanDurationPreset;
  reason?: string;
}

export interface GuardErrorCounts {
  daily: number;
  dailyLimit?: number;
  weekly: number;
  weeklyLimit?: number;
}

export interface AdminUser {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  plan: 'FREE' | 'PREMIUM';
  isCustom: boolean;
  isAdmin?: boolean;
  guardErrorsDaily?: number;
  guardErrorsWeekly?: number;
  restriction?: UserAiRestriction | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    lessons: number;
    words: number;
    rules: number;
  };
}

export interface Word {
  id: string;
  targetLanguage: string;
  nativeLanguage: string;
  pronunciation?: string;
  partOfSpeech?: string;
  notes?: string;
  createdAt: string;
}

export interface Rule {
  id: string;
  title: string;
  explanation: string;
  examples: string; // JSON string
  exceptions?: string;
  createdAt: string;
  _count?: {
    lessons: number;
  };
}

export interface ProposedRule {
  title: string;
  category: string;
  briefExplanation: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface LessonContent {
  rawPrompt?: string;
  rule: {
    title: string;
    explanation: string;
    examples: Array<{ targetLanguage: string; nativeLanguage: string; explanation?: string }>;
    exceptions?: string;
  };
  newWords: Array<{
    targetLanguage: string;
    nativeLanguage: string;
    pronunciation?: string;
    partOfSpeech?: string;
  }>;
  exercise1: {
    instruction: string;
    targetWords: string[];
    sampleWords?: string[];
    type?: string;
    subjectPronouns?: string[];
  };
  exercise2: {
    instruction: string;
    sentencesToTranslate: string[];
  };
  exercise3: {
    instruction: string;
    textToTranslate: string;
  };
}

export type CorrectionErrorType =
  | 'spelling'
  | 'conjugation'
  | 'grammar'
  | 'vocabulary'
  | 'syntax'
  | 'other';

export interface StructuredCorrection {
  inputId: string; // "0", "1", "2" or "0_0", "0_1" for 2D matrix
  original: string;
  expected: string;
  explanation: string;
  errorType: CorrectionErrorType;
}

export type UserSubmission =
  | { grid: Record<string, string[]> } // Ex 1 (Conjugation matrix variant)
  | { answers: string[] } // Ex 1 & Ex 2 (Standard lists: word endings, sentence translations, connector choices)
  | { text: string }; // Ex 3 (Story translation, free-form paragraphs, or raw OCR fallback)

export interface ExerciseGrading<T = StructuredCorrection> {
  score: number;
  corrections: T[];
  feedback: string;
  hasLegacyCorrections?: boolean;
  legacyCorrections?: string[];
}

export interface GradingResult {
  overallScore: number;
  generalFeedback: string;
  handwrittenOcrText?: string;
  exercise1: ExerciseGrading;
  exercise2: ExerciseGrading;
  exercise3: ExerciseGrading;
}

export interface LessonExercise {
  id: string;
  lessonId: string;
  exerciseNumber: number;
  instruction: string;
  content: any;
  userSubmission?: any;
  score?: number | null;
  feedback?: string | null;
  corrections?: StructuredCorrection[] | string[] | any;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lesson {
  id: string;
  title?: string;
  date: string;
  ruleId?: string;
  rule?: Rule;
  isReview: boolean;
  wordsCount: number;
  exercises?: LessonExercise[]; // Structured relational exercises
  status: 'GENERATED' | 'SUBMITTED' | 'GRADED';
  overallScore?: number;
  generalFeedback?: string;
  handwrittenOcrText?: string;
  rawPrompt?: string;
  createdAt: string;
  words?: Array<{ word: Word }>;
}

export interface DashboardStats {
  totalWords: number;
  totalRules: number;
  completedLessons: number;
  averageScore: number;
  recentLessons: Lesson[];
}

export interface UsageRecordItem {
  used: number;
  limit: number | null;
}

export interface UsageInfo {
  plan: 'FREE' | 'PREMIUM';
  isCustom: boolean;
  date: string;
  usage: {
    RULE_PROPOSAL: UsageRecordItem;
    LESSON_GENERATION: UsageRecordItem;
    LESSON_CORRECTION: UsageRecordItem;
  };
  guardErrors?: GuardErrorCounts;
  restriction?: UserAiRestriction | null;
  isRestricted?: boolean;
}

export interface Settings {
  AI_MODEL?: string;
  AI_BASE_URL?: string;
  NATIVE_LANGUAGE?: string;
  TARGET_LANGUAGE?: string;
  hasApiKey?: boolean;
  TUTORIAL_COMPLETED?: string;
  plan?: 'FREE' | 'PREMIUM';
  isCustom?: boolean;
}

export interface SettingsUpdatePayload {
  AI_MODEL?: string;
  AI_BASE_URL?: string;
  api_key?: string;
  NATIVE_LANGUAGE?: string;
  TARGET_LANGUAGE?: string;
  TUTORIAL_COMPLETED?: string;
  isCustom?: boolean;
}

export interface LanguageOption {
  name: string;
  voiceCode: string;
  tier?: 1 | 2 | 3;
}

