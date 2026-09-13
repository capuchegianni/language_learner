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

export interface GradingResult {
  overallScore: number; // 0-100
  generalFeedback: string;
  exercise1: {
    score: number;
    corrections: string[];
    feedback: string;
  };
  exercise2: {
    score: number;
    corrections: string[];
    feedback: string;
  };
  exercise3: {
    score: number;
    corrections: string[];
    feedback: string;
  };
  handwrittenOcrText?: string;
}

export interface UserLanguages {
  nativeLanguage: string;
  targetLanguage: string;
}
