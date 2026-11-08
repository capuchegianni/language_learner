export interface ProposedRule {
  title: string;
  category: string;
  briefExplanation: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface LessonContent {
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
    sampleWords: string[];
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
  rawPrompt: string;
}

export type CorrectionErrorType =
  | 'spelling'
  | 'conjugation'
  | 'grammar'
  | 'vocabulary'
  | 'syntax'
  | 'other';

export interface StructuredCorrection {
  item: string;
  original: string;
  expected: string;
  explanation: string;
  errorType: CorrectionErrorType;
}

export interface ExerciseGrading {
  score: number;
  corrections: StructuredCorrection[];
  feedback: string;
}

export interface GradingResult {
  overallScore: number; // 0-100
  generalFeedback: string;
  exercise1: ExerciseGrading;
  exercise2: ExerciseGrading;
  exercise3: ExerciseGrading;
  handwrittenOcrText?: string | null;
}

export interface UserLanguages {
  nativeLanguage: string;
  targetLanguage: string;
}

export type UserSubmission =
  | { grid: Record<string, string[]> } // Ex 1 (Conjugation matrix variant)
  | { answers: string[] } // Ex 1 & Ex 2 (Standard lists: word endings, sentence translations, connector choices)
  | { text: string }; // Ex 3 (Story translation, free-form paragraphs, or raw OCR fallback)

