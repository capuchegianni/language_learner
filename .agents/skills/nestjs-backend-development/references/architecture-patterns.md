# NestJS Architecture & Design Patterns

This guide outlines core architectural patterns for scalable, maintainable NestJS applications.

---

## 1. Architectural Layers & Separation of Concerns

```
HTTP Request
     │
     ▼
┌─────────────────────────┐
│       Controller        │  --> Request routing, Guards, DTO binding, HTTP response
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│     Domain Service      │  --> Business rules, orchestration, validation
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Data Layer / Prisma    │  --> User-scoped persistence, transactions, queries
└─────────────────────────┘
```

### The "Thin Controller" Rule
Controllers must contain ZERO business logic. A controller method should rarely exceed 10 lines:

```typescript
// ✅ Good: Thin Controller
@Controller('api/vocabulary')
@UseGuards(AuthenticatedGuard)
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Post()
  async createWord(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateWordDto,
  ) {
    return this.vocabularyService.createWord(req.user.id, dto);
  }

  @Get()
  async listWords(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListWordsQueryDto,
  ) {
    return this.vocabularyService.listWords(req.user.id, query);
  }
}
```

---

## 2. DTO Design & Inheritance Patterns

Use `PartialType` or `OmitType` from `@nestjs/mapped-types` to avoid code duplication across Create and Update DTOs:

```typescript
import { PartialType } from '@nestjs/mapped-types';
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
}

export class UpdateWordDto extends PartialType(CreateWordDto) {}
```

---

## 3. Dependency Injection Best Practices

1. **Inject Interfaces via Concrete Tokens or Service Classes**: Inject services directly in constructors using `private readonly`.
2. **Avoid Global State in Services**: NestJS services are singletons by default. Never store request-specific user data or intermediate state in class properties (`this.currentUserId = ...`). Pass context via method parameters.
3. **Module Encapsulation**: Always export services in the `@Module` definition if they are needed across module boundaries:
   ```typescript
   @Module({
     providers: [VocabularyService],
     exports: [VocabularyService],
   })
   export class VocabularyModule {}
   ```
