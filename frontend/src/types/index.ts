export interface User {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  plan?: 'FREE' | 'PREMIUM';
  isCustom?: boolean;
  isAdmin?: boolean;
}

export interface AdminUser {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  plan: 'FREE' | 'PREMIUM';
  isCustom: boolean;
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

export interface ExerciseGrading {
  score: number;
  corrections: string[];
  feedback: string;
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
  corrections?: any;
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
}

