import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { LessonStatus } from '../../generated/prisma/client';
import { UserSubmission } from '../../ai/interfaces/ai.interfaces';

export class GenerateLessonDto {
  @IsString()
  @IsNotEmpty({ message: 'Rule title cannot be empty' })
  ruleTitle!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  wordsCount?: number;

  @IsOptional()
  @IsBoolean()
  isReview?: boolean;
}

export class ExerciseSubmissionItemDto {
  @IsInt()
  @Min(1)
  @Max(3)
  exerciseNumber!: number;

  @IsNotEmpty()
  submission!: UserSubmission;
}

export class SubmitLessonDto {
  @IsNotEmpty({ message: 'exercises payload is required' })
  @Transform(({ value }) => {
    let parsed = value;
    if (typeof value === 'string') {
      try {
        parsed = JSON.parse(value);
      } catch {
        return value;
      }
    }
    if (Array.isArray(parsed)) {
      return parsed.map((item) =>
        plainToInstance(ExerciseSubmissionItemDto, item),
      );
    }
    return parsed;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseSubmissionItemDto)
  exercises!: ExerciseSubmissionItemDto[];
}

export class ReplaceProposalDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10)
  index?: number;
}

export class LessonQueryDto {
  @IsOptional()
  @IsEnum(LessonStatus)
  status?: LessonStatus;

  @IsOptional()
  @IsString()
  q?: string;
}

export class RuleProposalQueryDto {
  @IsOptional()
  @IsString()
  refresh?: string;
}
