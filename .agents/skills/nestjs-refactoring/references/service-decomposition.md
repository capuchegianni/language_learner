# Service Decomposition Patterns in NestJS

As applications grow, service files often accumulate multiple responsibilities, resulting in 400+ line "God Services" that are brittle and hard to test.

---

## 1. Recognizing Service Bloat

Signs a service needs decomposition:
- **Multiple Domain Responsibilities**: E.g., `LessonsService` generates AI lessons, manages proposal cards, submits OCR files, and calculates dashboard streaks.
- **Excessive Constructor Dependencies**: Injecting 6+ services, repositories, and config objects.
- **Mixed Levels of Abstraction**: High-level business flows mixed with low-level file system or regex parsing code.

---

## 2. Decomposition Patterns

### Pattern A: Facade + Sub-Services
Keep the primary service (e.g. `LessonsService`) as a lightweight facade that coordinates specialized sub-services:

```
lessons/
├── lessons.module.ts
├── lessons.controller.ts
├── lessons.service.ts              <-- High-level facade
├── services/
│   ├── lesson-proposals.service.ts <-- Proposal management & AI rule suggestions
│   ├── lesson-generator.service.ts <-- Prompt construction & lesson generation
│   ├── lesson-grading.service.ts   <-- Grading, submission, OCR handling
│   └── lesson-stats.service.ts     <-- Dashboard streaks & stats calculation
└── dto/
    ├── generate-lesson.dto.ts
    ├── submit-lesson.dto.ts
    └── replace-proposal.dto.ts
```

#### Code Example: Facade Delegation
```typescript
@Injectable()
export class LessonsService {
  constructor(
    private readonly proposalsService: LessonProposalsService,
    private readonly generatorService: LessonGeneratorService,
    private readonly gradingService: LessonGradingService,
    private readonly statsService: LessonStatsService,
  ) {}

  getRuleProposals(userId: string, options?: { forceRefresh?: boolean }) {
    return this.proposalsService.getRuleProposals(userId, options);
  }

  generateLesson(userId: string, dto: GenerateLessonDto) {
    return this.generatorService.generateLesson(userId, dto);
  }

  submitLesson(userId: string, lessonId: string, dto: SubmitLessonDto, imagePaths?: string[]) {
    return this.gradingService.submitLesson(userId, lessonId, dto, imagePaths);
  }

  getDashboardStats(userId: string) {
    return this.statsService.getDashboardStats(userId);
  }
}
```

### Pattern B: Extracting Pure Helpers / Utilities
Functions that do not need NestJS dependency injection (e.g., JSON sanitizers, prompt text builders, math helpers) should be moved to pure utility modules:

```typescript
// utils/json-parser.util.ts
export function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
```

---

## 3. Step-by-Step Execution Plan

1. **Create Sub-Service File**: Create the new service with `@Injectable()`.
2. **Move Methods**: Transfer the specific methods and their private helpers to the new service.
3. **Inject Dependencies**: Inject `PrismaService` or other dependencies directly into the sub-service.
4. **Register in Module**: Add the sub-service to `@Module({ providers: [...], exports: [...] })`.
5. **Update Controller or Facade**: Replace direct logic in the main service with the delegated call.
6. **Verify Compilation**: Run `pnpm exec tsc --noEmit`.
