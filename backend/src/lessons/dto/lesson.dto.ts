import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

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

export class SubmitLessonDto {
  @IsOptional()
  @IsString()
  ex1?: string;

  @IsOptional()
  @IsString()
  ex2?: string;

  @IsOptional()
  @IsString()
  ex3?: string;
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
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  q?: string;
}

export class RuleProposalQueryDto {
  @IsOptional()
  @IsString()
  refresh?: string;
}
