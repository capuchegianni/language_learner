# Backend Quality Checklist (Definition of Done)

Verify every item on this checklist before marking any backend feature, bugfix, or refactor complete.

---

## 1. Type Safety & Compilation
- [ ] `pnpm exec tsc --noEmit` runs with **0 errors**.
- [ ] No `any` types used (unless interacting with raw external untyped JSON boundary).
- [ ] Null and undefined cases are safely guarded (optional chaining `?.`, nullish coalescing `??`).
- [ ] Return types are explicitly typed or accurately inferred.

## 2. Input Validation (DTOs)
- [ ] Every controller endpoint uses a class DTO for request body / query params / path params.
- [ ] DTO fields are decorated with `class-validator` rules (`@IsString`, `@IsNotEmpty`, `@IsOptional`, etc.).
- [ ] Number and boolean query params use `@Type(() => Number)` / `@Type(() => Boolean)`.
- [ ] No raw object literals in controller signatures (`@Body() body: { ... }` ❌).

## 3. Multi-Tenancy & Security
- [ ] All database queries on user-owned entities contain `{ where: { userId } }`.
- [ ] All protected controller endpoints have `@UseGuards(AuthenticatedGuard)`.
- [ ] No API keys, secret hashes, or passwords are returned in response payloads.
- [ ] Secret settings are encrypted using AES-256-GCM before DB write.

## 4. Architecture & Clean Code
- [ ] Controller methods are thin (< 15 lines), delegating logic to services.
- [ ] Services do not exceed 300 lines; complex services are decomposed into sub-services.
- [ ] Multi-table mutations are wrapped in `prisma.$transaction(...)`.
- [ ] No `console.log` statements in service code; NestJS `Logger` is used instead.
- [ ] No unused imports or dead code remaining.
