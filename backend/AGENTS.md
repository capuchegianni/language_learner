# NestJS Backend Code Quality & Architecture Rules

All code written or modified in the `backend/` directory MUST adhere to the following non-negotiable rules:

---

## 1. Type Safety & TypeScript Strictness
- **Zero compiler errors**: `pnpm exec tsc --noEmit` must pass with 0 errors at all times.
- **No `any` types**: Always define explicit interfaces, types, or DTO classes.
- **Null Safety**: Always handle nullable properties with optional chaining (`?.`) or nullish coalescing (`??`). Never call array functions (`.reduce()`, `.map()`) on potentially null elements without guarding.
- **External Type Declarations**: Ensure all third-party libraries have their `@types/*` package installed in `devDependencies`.

---

## 2. Input Validation via Class DTOs (No Inline Types)
- **Mandatory DTOs**: Never use inline type literals in controller signatures (e.g. `@Body() body: { title: string }` is strictly forbidden).
- **Validation Decorators**: All request DTOs must use `class-validator` annotations (`@IsString()`, `@IsNotEmpty()`, `@IsOptional()`, `@IsInt()`, etc.) and `class-transformer` (`@Type(...)`).
- **Global Validation Pipe**: Rely on NestJS `ValidationPipe({ whitelist: true, transform: true })` for stripping unknown properties and coercing types.

---

## 3. Multi-Tenancy & Data Isolation (Mandatory `userId`)
- **Strict Scoping**: Every database query reading, updating, or deleting user-owned records MUST include `{ where: { userId } }` or compound uniqueness including `userId`.
- **Atomic Transactions**: Multi-table or cascade modifications must use `this.prisma.$transaction(...)`.
- **JSON Column Safety**: SQLite stringified JSON columns must use safe parsing with fallback objects to prevent 500 runtime crashes on malformed data.

---

## 4. Architectural Boundaries & Clean Code
- **Thin Controllers**: Controllers only handle HTTP routing, guard evaluation, DTO parameter parsing, and HTTP status codes. Business logic belongs in services.
- **Service Size Limit**: Services should not exceed 300 lines. Monolithic services must be split into specialized sub-services or domain helpers.
- **No Stateful Services**: Services are singletons by default; never store request-scoped user state on service class instances.
- **No `console.log`**: Always use `private readonly logger = new Logger(ClassName.name)` for error and debug logging.

---

## 5. Security & Sensitive Settings
- **Secret Encryption**: Sensitive credentials (e.g. user LLM API keys) must be encrypted using AES-256-GCM before DB insertion.
- **No Secret Leakage**: Stripped or masked credentials must be returned in GET settings responses (e.g. `hasApiKey: boolean`).
- **Authentication Guards**: All private endpoints must be decorated with `@UseGuards(AuthenticatedGuard)`.
