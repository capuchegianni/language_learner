export interface User {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
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

export interface Lesson {
  id: string;
  title?: string;
  date: string;
  ruleId?: string;
  rule?: Rule;
  isReview: boolean;
  wordsCount: number;
  lessonData: string; // JSON string of LessonContent
  status: 'GENERATED' | 'SUBMITTED' | 'GRADED';
  userSubmission?: string; // JSON string of {ex1, ex2, ex3}
  submissionImage?: string;
  aiFeedback?: string; // JSON string of GradingResult
  overallScore?: number;
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

export interface Settings {
  AI_MODEL: string;
  AI_BASE_URL: string;
  NATIVE_LANGUAGE?: string;
  TARGET_LANGUAGE?: string;
  hasApiKey?: boolean;
}

export interface SettingsUpdatePayload {
  AI_MODEL?: string;
  AI_BASE_URL?: string;
  api_key?: string;
  NATIVE_LANGUAGE?: string;
  TARGET_LANGUAGE?: string;
}
