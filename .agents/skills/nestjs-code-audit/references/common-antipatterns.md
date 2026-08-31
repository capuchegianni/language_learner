# Common NestJS Anti-Patterns & Code Smells

This document catalogues frequent anti-patterns found in NestJS codebases, their root causes, and recommended remedies.

---

## 1. Monolithic "God" Services

### Symptom
A single service file (e.g. `LessonsService` or `SettingsService`) grows past 350+ lines and handles:
- Direct database ORM operations
- External API calls (AI LLM, third-party integrations)
- File I/O and multipart uploads
- String parsing and formatting
- Statistics and aggregation

### Impact
- High cognitive load and difficult testing.
- Fragile coupling: modifying AI prompt logic risks breaking database transactions.
- High likelihood of cyclic dependencies.

### Remedy
Decompose into specialized domain services:
- `LessonQueryService` (read queries, stats)
- `LessonGeneratorService` (AI prompting, rule building)
- `LessonSubmissionService` (grading, validation, file cleanup)

---

## 2. Inlined Controller Types vs. Validated DTOs

### Symptom
Controller endpoints define request bodies with inline TypeScript types:
```typescript
// ❌ Anti-pattern: TypeScript types disappear at runtime
@Post('generate')
async generateLesson(@Body() body: { ruleTitle: string; wordsCount?: number }) { ... }
```

### Impact
- No runtime validation occurs. If the frontend passes `{ wordsCount: "invalid" }` or `{ ruleTitle: "" }`, the request bypasses TypeScript checks and causes runtime crashes or database corruption.
- NestJS `ValidationPipe` is bypassed.

### Remedy
Use class-based Data Transfer Objects (DTOs) with `class-validator` and `class-transformer`:
```typescript
// ✅ Best Practice: Runtime validated DTO
export class GenerateLessonDto {
  @IsString()
  @IsNotEmpty()
  ruleTitle: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  wordsCount?: number;
}
```

---

## 3. Unsafe Serialized JSON Fields (SQLite/Document Storage)

### Symptom
Database schema stores complex structures as `String` (e.g., `lessonData`, `examples`, `userSubmission`).
Parsing is done ad-hoc:
```typescript
// ❌ Anti-pattern: Raw JSON.parse without fallback or validation
const data = JSON.parse(lesson.lessonData);
const score = data.exercises.ex1.score; // Throws TypeError if schema changed
```

### Impact
- Stale database rows cause runtime 500 crashes when older JSON shapes are read.
- `JSON.stringify` on undefined or invalid values writes `"undefined"` string or causes silent bugs.

### Remedy
Create a centralized JSON serializer/deserializer with Zod or TypeScript type guards and default fallbacks:
```typescript
// ✅ Safe parser helper
export function parseJsonSafe<T>(jsonStr: string | null | undefined, fallback: T): T {
  if (!jsonStr) return fallback;
  try {
    return JSON.parse(jsonStr) as T;
  } catch (err) {
    return fallback;
  }
}
```

---

## 4. Multi-Tenancy Leaks (Missing `userId` in Queries)

### Symptom
Prisma or database queries perform operations without filtering by `userId`:
```typescript
// ❌ Anti-pattern: Unscoped query returns or modifies data of other users
await this.prisma.rule.findUnique({ where: { id } });
await this.prisma.lessonProposal.deleteMany({});
```

### Impact
- Catastrophic privacy and multi-tenancy security violation: one user can read, modify, or wipe another user's data.

### Remedy
Always enforce compound uniqueness or explicit `userId` filtering:
```typescript
// ✅ Scoped query
const rule = await this.prisma.rule.findFirst({
  where: { id, userId },
});
if (!rule) throw new NotFoundException('Rule not found');
```

---

## 5. Generic Error Swallowing & Silent Failures

### Symptom
Catch blocks swallow errors or throw generic messages without logging context:
```typescript
// ❌ Anti-pattern
try {
  return await this.aiService.grade(payload);
} catch (e) {
  throw new InternalServerErrorException('Something went wrong');
}
```

### Impact
- Debugging production failures is impossible because stack traces and root causes are lost.

### Remedy
Log the error with NestJS `Logger` and provide descriptive, client-safe exceptions:
```typescript
// ✅ Best Practice
private readonly logger = new Logger(LessonsService.name);

try {
  return await this.aiService.grade(payload);
} catch (err) {
  this.logger.error(`AI grading failed for user ${userId}: ${err.message}`, err.stack);
  throw new BadRequestException('AI grading failed. Please verify your API key and try again.');
}
```
