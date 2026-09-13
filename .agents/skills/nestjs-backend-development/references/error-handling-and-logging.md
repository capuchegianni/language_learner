# Error Handling & Observability Guidelines

This guide standardizes exception handling and telemetry across all NestJS services and controllers.

---

## 1. Exception Hierarchy & Usage

Always use NestJS built-in HTTP exceptions over generic JavaScript `Error`:

| Exception | HTTP Code | Use Case |
| :--- | :--- | :--- |
| `BadRequestException` | 400 | Invalid payload, validation failure, malformed query |
| `UnauthorizedException`| 401 | Missing or expired session / authentication |
| `ForbiddenException` | 403 | Authenticated user lacks permission for the resource |
| `NotFoundException` | 404 | Resource not found or belongs to another user |
| `ConflictException` | 409 | Unique constraint violation (e.g. duplicate word title) |
| `InternalServerErrorException` | 500 | Unexpected system failure, unrecoverable disk/API crash |

---

## 2. Structured Logging with NestJS Logger

Never use `console.log` or `console.error` in production services. Use `Logger`:

```typescript
import { Injectable, Logger, BadRequestException } from '@nestjs/common';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  async callLlm(userId: string, prompt: string): Promise<string> {
    this.logger.debug(`Initiating LLM call for user: ${userId}`);

    try {
      // ... API call
    } catch (err: any) {
      this.logger.error(
        `LLM call failed for user ${userId}: ${err.message}`,
        err.stack,
      );
      throw new BadRequestException(
        'Failed to generate AI response. Please verify your API key configuration.',
      );
    }
  }
}
```

---

## 3. Resilience for External Dependencies (LLMs, APIs)

When calling external APIs (e.g., OpenAI, Gemini, Ollama):
1. **Never leak raw stack traces or internal secrets** to client responses.
2. **Implement Retries with Backoff** on transient errors (429 Rate Limit, 503 Unavailable).
3. **Set Request Timeouts** to prevent request hanging indefinitely.
4. **Sanitize JSON Responses** (strip markdown code block wrappers like ```` ```json ````).
