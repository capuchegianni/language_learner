# Safe Refactoring Guide for NestJS

Refactoring large backend codebases carries the risk of subtle runtime regressions, broken frontend contracts, and multi-tenancy leaks. Follow these guardrails for safe refactoring.

---

## 1. Golden Guardrails

1. **Do not change API signatures and database schemas at the same time.**
   Split changes: first refactor internal service logic keeping the existing DB schema & API contract intact. Only alter schema or API contracts in a separate, dedicated step.

2. **Always cross-reference the Frontend API Client.**
   Check `frontend/src/services/api.ts` and `frontend/src/types/index.ts` before modifying any response structure or endpoint parameter.

3. **Keep Prisma Transactions Atomic.**
   Whenever an operation updates multiple tables or deletes related items, use `$transaction`:
   ```typescript
   await this.prisma.$transaction(async (tx) => {
     await tx.lessonWord.deleteMany({ where: { lessonId } });
     await tx.lesson.delete({ where: { id: lessonId } });
   });
   ```

4. **Preserve User Scoping in Every Query.**
   Never perform:
   ```typescript
   // ❌ DANGEROUS
   await this.prisma.lesson.findUnique({ where: { id } });
   ```
   Always perform:
   ```typescript
   // ✅ SAFE
   const lesson = await this.prisma.lesson.findFirst({ where: { id, userId } });
   if (!lesson) throw new NotFoundException('Lesson not found');
   ```

---

## 2. Refactoring Staged Process

### Stage A: Type Hardening
1. Add missing `@types/*` packages.
2. Turn loose types (`any`, `object`, `Record<string, any>`) into explicit interfaces.
3. Fix nullable accessors with optional chaining (`?.`) or nullish coalescing (`??`).

### Stage B: Request Validation Layer
1. Create dedicated `dto/` directory within feature modules (e.g. `src/lessons/dto/`).
2. Define DTO classes with `class-validator`.
3. Switch `@Body() body: any` to `@Body() dto: MyDto`.

### Stage C: Internal Service Modernization
1. Split large services into focused helper services or domain managers.
2. Extract common JSON parsing/formatting logic into typed utility functions.
3. Replace raw `console.log` statements with NestJS `Logger`.

### Stage D: Verification & Cleanup
1. Run `tsc --noEmit`.
2. Clean unused imports with Prettier / linter.
3. Test end-to-end user workflows.
