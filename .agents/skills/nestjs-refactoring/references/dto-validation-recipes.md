# NestJS DTO Validation Recipes

This guide contains ready-to-use DTO patterns using `class-validator` and `class-transformer` for standard NestJS endpoints.

---

## 1. Setting Up Global Validation Pipe

In `main.ts`:
```typescript
import { ValidationPipe } from '@nestjs/common';

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // Strips non-decorated properties
    transform: true,              // Automatically transforms payloads to DTO instances
    forbidNonWhitelisted: false,  // Set to true if unexpected fields should throw 400
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

---

## 2. Common DTO Recipes

### A. Lesson Generation DTO
```typescript
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class GenerateLessonDto {
  @IsString()
  @IsNotEmpty({ message: 'ruleTitle cannot be empty' })
  ruleTitle: string;

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
```

### B. Lesson Submission DTO
```typescript
import { IsString, IsOptional } from 'class-validator';

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
```

### C. Proposal Replacement DTO
```typescript
import { IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ReplaceProposalDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10)
  index: number;
}
```

### D. Word CRUD DTOs
```typescript
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateWordDto {
  @IsString()
  @IsNotEmpty()
  targetLanguage: string;

  @IsString()
  @IsNotEmpty()
  nativeLanguage: string;

  @IsOptional()
  @IsString()
  pronunciation?: string;

  @IsOptional()
  @IsString()
  partOfSpeech?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateWordDto {
  @IsOptional()
  @IsString()
  targetLanguage?: string;

  @IsOptional()
  @IsString()
  nativeLanguage?: string;

  @IsOptional()
  @IsString()
  pronunciation?: string;

  @IsOptional()
  @IsString()
  partOfSpeech?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

### E. Query Filter DTOs
```typescript
import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum LessonStatusEnum {
  GENERATED = 'GENERATED',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
}

export class LessonQueryDto {
  @IsOptional()
  @IsEnum(LessonStatusEnum)
  status?: LessonStatusEnum;

  @IsOptional()
  @IsString()
  q?: string;
}
```
