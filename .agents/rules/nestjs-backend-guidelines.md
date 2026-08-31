# NestJS Quality Guidelines & Engineering Standards

These rules apply across all backend engineering workflows:

1. **Compiler Health**: Never leave broken TypeScript compilation (`pnpm exec tsc --noEmit`).
2. **DTO Enforcement**: Every API endpoint receiving data must declare a class DTO with `class-validator` decorators.
3. **Multi-Tenancy Guardrails**: All Prisma reads/writes on user data must filter by `userId`.
4. **Structured Error Handling**: Use NestJS HTTP exceptions (`NotFoundException`, `BadRequestException`, etc.) and NestJS `Logger`.
5. **No God Services**: Break down services when they combine multiple domains or exceed ~300 lines.
