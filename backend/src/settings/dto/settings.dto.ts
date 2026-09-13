import { IsBoolean, IsOptional } from 'class-validator';

export class ResetDataDto {
  @IsOptional()
  @IsBoolean()
  settings?: boolean;

  @IsOptional()
  @IsBoolean()
  words?: boolean;

  @IsOptional()
  @IsBoolean()
  rules?: boolean;

  @IsOptional()
  @IsBoolean()
  lessons?: boolean;
}

export class ExportDataQueryDto {
  @IsOptional()
  settings?: string;

  @IsOptional()
  words?: string;

  @IsOptional()
  rules?: string;

  @IsOptional()
  lessons?: string;
}

export interface ImportPayload {
  overrideSettings?: boolean;
  settings?: Array<{ key: string; value: string; updatedAt?: any }> | Record<string, string>;
  words?: Array<{
    targetLanguage: string;
    nativeLanguage: string;
    pronunciation?: string;
    partOfSpeech?: string;
    notes?: string;
    createdAt?: any;
    updatedAt?: any;
  }>;
  rules?: Array<{
    title: string;
    explanation: string;
    examples: any;
    exceptions?: any;
    createdAt?: any;
    updatedAt?: any;
  }>;
  lessons?: Array<{
    title?: string;
    date?: any;
    ruleTitle?: string;
    rule?: { title: string };
    isReview?: boolean;
    wordsCount?: number;
    lessonData?: any;
    status?: string;
    userSubmission?: any;
    submissionImage?: string;
    aiFeedback?: any;
    overallScore?: number;
    rawPrompt?: string;
    targetWords?: string[];
    createdAt?: any;
    updatedAt?: any;
  }>;
}
