import { IsBoolean, IsOptional } from 'class-validator';
import { Prisma } from '../../generated/prisma/client';

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
  settings?: Array<{ key: string; value: string; updatedAt?: string | Date }> | Record<string, string>;
  words?: Array<{
    targetLanguage: string;
    nativeLanguage: string;
    pronunciation?: string;
    partOfSpeech?: string;
    notes?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
  }>;
  rules?: Array<{
    title: string;
    explanation: string;
    examples: Prisma.InputJsonValue;
    exceptions?: Prisma.InputJsonValue;
    createdAt?: string | Date;
    updatedAt?: string | Date;
  }>;
  lessons?: Array<{
    title?: string;
    date?: string | Date;
    ruleTitle?: string;
    rule?: { title: string };
    isReview?: boolean;
    wordsCount?: number;
    status?: string;
    submissionImage?: string;
    overallScore?: number;
    generalFeedback?: string;
    handwrittenOcrText?: string;
    rawPrompt?: string;
    targetWords?: string[];
    words?: Array<{ word?: { targetLanguage: string }; targetLanguage?: string } | string>;
    exercises?: Array<{
      exerciseNumber: number;
      instruction: string;
      content: Prisma.InputJsonValue;
      userSubmission?: Prisma.InputJsonValue;
      score?: number;
      feedback?: string;
      corrections?: Prisma.InputJsonValue;
      createdAt?: string | Date;
      updatedAt?: string | Date;
    }>;
    lessonData?: Prisma.InputJsonValue;
    userSubmission?: Prisma.InputJsonValue;
    aiFeedback?: Prisma.InputJsonValue;
    createdAt?: string | Date;
    updatedAt?: string | Date;
  }>;
}
