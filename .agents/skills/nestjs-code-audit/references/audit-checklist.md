# Comprehensive NestJS Audit Checklist

Use this checklist during every backend audit or code review.

---

## 1. Type Safety & TypeScript Compiler
- [ ] Does `pnpm exec tsc --noEmit` exit with 0 errors?
- [ ] Are all external packages typed (no missing `@types/*` in `devDependencies`)?
- [ ] Are `noImplicitAny` and strict null checking respected?
- [ ] Are array operations guarded against null/undefined elements (e.g. `.reduce()`, `.map()`, `[0]`)?
- [ ] Are `process.env` access points strongly typed or validated via a ConfigService schema?

## 2. NestJS Architecture & Module Organization
- [ ] Are controllers strictly focused on HTTP concerns (request routing, validation, status codes)?
- [ ] Is business logic cleanly encapsulated in injectable services?
- [ ] Are module `imports` and `exports` minimal and non-circular?
- [ ] Are providers registered in the appropriate module rather than duplicated across multiple modules?
- [ ] Are shared utilities organized in a dedicated common module or helper layer?

## 3. Security & Multi-Tenancy
- [ ] Are all protected routes secured with `@UseGuards(...)`?
- [ ] Does **every single** database read, update, and delete query include `userId` filter?
- [ ] Are sensitive tokens/keys (e.g. OpenAI/Gemini API keys) encrypted with AES-256-GCM before DB write?
- [ ] Is the encrypted API key stripped from all GET responses returned to the client?
- [ ] Are CORS, trust proxy headers, and session cookie security settings configured correctly for both dev and production?
- [ ] Are uploaded files validated for file type, MIME type, and size limits?

## 4. Database & ORM (Prisma/SQLite)
- [ ] Are database migrations/schemas in sync with Prisma client (`prisma generate`)?
- [ ] Are multi-table or cascading mutations executed inside `prisma.$transaction()`?
- [ ] For stringified JSON columns, is there safety handling for parsing errors or corrupted data?
- [ ] Are database indexes present on frequently filtered foreign keys (`userId`, `ruleId`, etc.)?
- [ ] Is there proper cascade deletion configured on user-owned relations?

## 5. API Contracts & Validation
- [ ] Are request bodies typed using DTO classes with `class-validator` decorators?
- [ ] Is `ValidationPipe({ whitelist: true, transform: true })` enabled globally or per controller?
- [ ] Are URL params and query params cast/validated (e.g. `ParseIntPipe`, `ParseUUIDPipe`)?
- [ ] Do endpoints return appropriate HTTP status codes (200, 201, 204)?
- [ ] Are API routes prefixed consistently (e.g. `/api/...`)?

## 6. Error Handling & Observability
- [ ] Are NestJS built-in exceptions used instead of untyped errors?
- [ ] Is NestJS `Logger` used consistently for errors and debug information instead of `console.log`?
- [ ] Are external API failures (e.g. LLM timeouts, rate limits) caught, logged, and mapped to friendly HTTP exceptions?
- [ ] Is there retry/backoff logic for flaky external API calls?

## 7. Dead & Redundant Code
- [ ] Are there unused service methods or orphaned controller endpoints?
- [ ] Are there unused Prisma models, fields, or relations?
- [ ] Are there duplicate utility functions spread across multiple service files?
- [ ] Are there leftover debug logs, commented-out legacy code, or obsolete mock data?
