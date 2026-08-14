# Language Learner — AI-Powered Language Tutor & Progress Tracker

## Project Overview

A full-stack daily language learning app with AI-driven lesson generation, vocabulary/grammar tracking, spaced repetition, multimodal grading (text + handwritten images via AI Vision), and data import/export. Currently configured for Korean from English by default, but supports any language pair via user settings.

**Author:** Gianni H (capuchegianni)

## Tech Stack

| Layer        | Technology                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------------- |
| Frontend     | React 19, TypeScript, Vite 8, Vanilla CSS (dark glassmorphism theme), React Router v7          |
| Backend      | NestJS 11 (TypeScript), Prisma ORM v7 with `better-sqlite3` driver adapter, Express 5          |
| Database     | SQLite (file-based, `backend/data/dev.db`)                                                     |
| AI           | OpenAI SDK v6 — provider-agnostic via configurable `baseURL` (OpenAI, Gemini, Groq, etc.)      |
| Auth         | Google OAuth 2.0 via Passport.js, server-side sessions stored in separate SQLite (`sessions.db`)|
| Monorepo     | pnpm workspaces (`backend/` + `frontend/`), Node.js ≥22                                       |
| Deployment   | Docker Compose (backend + frontend + Cloudflare Tunnel)                                        |
| Icons        | lucide-react                                                                                   |
| Animations   | canvas-confetti (for score celebrations)                                                       |

## Repository Structure

```
language_learner/
├── backend/                  # NestJS API server
│   ├── prisma/
│   │   └── schema.prisma     # Database schema (SQLite)
│   ├── prisma.config.ts      # Prisma datasource config
│   ├── src/
│   │   ├── main.ts           # Bootstrap (session, CORS, passport, trust proxy)
│   │   ├── app.module.ts     # Root module — imports all feature modules
│   │   ├── generated/prisma/ # Auto-generated Prisma client (DO NOT EDIT)
│   │   ├── prisma/           # PrismaModule + PrismaService (singleton)
│   │   ├── auth/             # Google OAuth strategy, session serializer, guards
│   │   ├── ai/               # AiService — LLM calls, prompt building, vision grading
│   │   ├── settings/         # Key-value settings + encrypted API key + import/export/reset
│   │   ├── lessons/          # Lesson CRUD, AI generation, submission & grading flow
│   │   ├── vocabulary/       # Word bank CRUD
│   │   ├── rules/            # Grammar rule bank CRUD
│   │   └── types/            # Shared types (AuthenticatedRequest)
│   └── data/                 # SQLite database files (gitignored)
├── frontend/                 # Vite + React SPA
│   ├── src/
│   │   ├── App.tsx           # Route definitions (react-router-dom)
│   │   ├── main.tsx          # Entry: BrowserRouter + AuthProvider + LanguageProvider
│   │   ├── pages/            # Page components (Dashboard, Settings, WordBank, etc.)
│   │   ├── components/       # Shared UI (Navbar, ProtectedRoute, FilterInput, lesson/)
│   │   ├── contexts/         # AuthContext, LanguageContext
│   │   ├── services/api.ts   # Centralized axios API client
│   │   ├── types/index.ts    # TypeScript interfaces mirroring backend models
│   │   └── styles/index.css  # Global CSS design system (CSS variables, glassmorphism)
│   └── vite.config.ts        # Dev proxy (/api → backend:3000, /uploads → backend:3000)
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── .env.example
└── pnpm-workspace.yaml
```

## Database Schema (Prisma)

All models are **user-scoped** — every query MUST filter by `userId`.

- **User** — Google OAuth profile (`googleId`, `email`, `displayName`, `avatarUrl`)
- **Word** — Vocabulary bank entries. Unique per `(userId, targetLanguage)`.
- **Rule** — Grammar rules. Unique per `(userId, title)`. Fields `examples` and `exceptions` are stored as JSON strings.
- **Lesson** — Generated lessons. `lessonData`, `userSubmission`, `aiFeedback` are stored as **JSON strings** (parsed at runtime). Status: `GENERATED` → `SUBMITTED` → `GRADED`.
- **LessonWord** — Many-to-many join between Lesson ↔ Word.
- **LessonProposal** — User's active proposed rules and review rule entries (one-to-many with User: `title`, `explanation`, `category`, `difficulty`, `isReview`).
- **Setting** — Key-value pairs per user. The `api_key` setting is AES-256-GCM encrypted.

### Important: JSON String Fields

Several Prisma fields store serialized JSON as plain strings:
- `Rule.examples` — `Array<{ targetLanguage, nativeLanguage, explanation? }>`
- `Rule.exceptions` — text or JSON
- `Lesson.lessonData` — full `LessonContent` JSON
- `Lesson.userSubmission` — `{ ex1, ex2, ex3 }`
- `Lesson.aiFeedback` — `GradingResult` JSON

Always use `JSON.stringify()` when writing and `JSON.parse()` when reading these fields.

## Backend Architecture Patterns

### Module Structure (NestJS)
Each feature follows the NestJS module pattern:
```
feature/
├── feature.module.ts       # @Module declaration
├── feature.controller.ts   # REST endpoints under /api/<feature>
└── feature.service.ts      # Business logic, Prisma queries
```

### Key Conventions

1. **All routes are prefixed with `/api/`** — e.g., `@Controller('api/lessons')`.
2. **Authentication guard** — All controllers (except auth endpoints) use `@UseGuards(AuthenticatedGuard)` at the class level.
3. **User scoping** — Every controller method extracts `userId` from `req.user.id` via `@Req() req: AuthenticatedRequest`, then passes it to the service. Services always filter by `userId`.
4. **No DTOs with class-validator decorators** — Request bodies are typed inline in controller method signatures.
5. **Prisma transactions** — Used for import, export, reset, and account deletion via `this.prisma.$transaction()`.
6. **Error handling** — Uses NestJS built-in exceptions: `NotFoundException`, `BadRequestException`, `InternalServerErrorException`, `UnauthorizedException`.
7. **API key encryption** — The `api_key` setting is encrypted with AES-256-GCM using `SESSION_SECRET` as the key derivation source. Never returned to the frontend (only `hasApiKey: boolean` is exposed).

### AI Service Pattern

- Uses the OpenAI SDK with a dynamic `baseURL` for provider flexibility.
- `getClient(userId)` creates a new OpenAI client per request using the user's stored settings.
- All AI responses are expected as raw JSON strings — cleaned with `cleanJsonResponse()` to strip markdown code fences.
- Retry logic with exponential backoff on 429 rate limits.
- Vision/multimodal support via base64-encoded image parts in the message.

## Frontend Architecture Patterns

### State Management
- **AuthContext** — Session-based auth state via `GET /api/auth/status`. No tokens, pure cookie-based.
- **LanguageContext** — Fetches `NATIVE_LANGUAGE` / `TARGET_LANGUAGE` from settings API.
- No state management library — uses React hooks (`useState`, `useEffect`, `useCallback`).

### API Client (`services/api.ts`)
- Single `api` object with typed methods for all endpoints.
- Uses `axios` with `withCredentials: true` (cookies).
- `API_BASE` resolves to `/api` in dev (proxied by Vite) or `${VITE_BACKEND_URL}/api` in production.

### Styling
- **Single CSS file** (`styles/index.css`) with CSS custom properties (variables).
- Dark theme with glassmorphism (`backdrop-filter: blur`).
- Design tokens: `--bg-dark`, `--bg-card`, `--accent-primary`, `--gradient-main`, etc.
- Class naming: `.glass-card`, `.btn .btn-primary`, `.pill .pill-success`, `.input-group`, `.modal-overlay`.
- Font: 'Outfit' for UI, 'Noto Sans KR' for Korean text.
- No CSS modules, no Tailwind, no CSS-in-JS.

### Routing
All routes are defined in `App.tsx`. Protected routes wrap children with `<ProtectedRoute>`.

| Path                   | Component      | Description               |
| ---------------------- | -------------- | ------------------------- |
| `/login`               | Login          | Google OAuth login page   |
| `/`                    | Dashboard      | Stats + recent lessons    |
| `/lessons/new`         | NewLesson      | Rule proposal → generate  |
| `/lessons/:id/resume`  | NewLesson      | Resume an in-progress lesson |
| `/lessons/:id`         | LessonDetail   | View/grade a lesson       |
| `/history`             | LessonHistory  | All past lessons          |
| `/words`               | WordBank       | CRUD vocabulary           |
| `/rules`               | RuleBank       | CRUD grammar rules        |
| `/settings`            | Settings       | AI config, import/export, reset, account |

## API Endpoints Reference

### Auth (`/api/auth`)
| Method | Path                    | Auth | Description                    |
| ------ | ----------------------- | ---- | ------------------------------ |
| GET    | `/api/auth/google`      | No   | Redirects to Google OAuth      |
| GET    | `/api/auth/google/callback` | No | OAuth callback, redirects to frontend |
| GET    | `/api/auth/status`      | No   | Returns `{ authenticated, user }` |
| GET    | `/api/auth/me`          | Yes  | Returns current user profile   |
| GET    | `/api/auth/logout`      | No   | Destroys session, redirects    |
| DELETE | `/api/auth/account`     | Yes  | Deletes user + all data        |

### Lessons (`/api/lessons`)
| Method | Path                            | Auth | Description                           |
| ------ | ------------------------------- | ---- | ------------------------------------- |
| GET    | `/api/lessons/stats`            | Yes  | Dashboard stats                       |
| GET    | `/api/lessons/propose-rules`    | Yes  | Get or top-up active rule proposals (?refresh) |
| POST   | `/api/lessons/propose-rules/replace` | Yes | Replace a single proposal card ({ index }) |
| POST   | `/api/lessons/generate`         | Yes  | Generate lesson from rule             |
| POST   | `/api/lessons/:id/submit`       | Yes  | Submit answers (multipart: text + images) |
| GET    | `/api/lessons`                  | Yes  | List all lessons                      |
| GET    | `/api/lessons/:id`              | Yes  | Get lesson by ID                      |
| DELETE | `/api/lessons/:id`              | Yes  | Delete lesson                         |

### Vocabulary (`/api/vocabulary`)
| Method | Path                   | Auth | Description                    |
| ------ | ---------------------- | ---- | ------------------------------ |
| GET    | `/api/vocabulary`      | Yes  | List words (?q=search)         |
| POST   | `/api/vocabulary`      | Yes  | Create word                    |
| PUT    | `/api/vocabulary/:id`  | Yes  | Update word                    |
| DELETE | `/api/vocabulary/:id`  | Yes  | Delete word                    |

### Rules (`/api/rules`)
| Method | Path              | Auth | Description                    |
| ------ | ----------------- | ---- | ------------------------------ |
| GET    | `/api/rules`      | Yes  | List rules (?q=search)         |
| POST   | `/api/rules`      | Yes  | Create rule                    |
| PUT    | `/api/rules/:id`  | Yes  | Update rule                    |
| DELETE | `/api/rules/:id`  | Yes  | Delete rule                    |

### Settings (`/api/settings`)
| Method | Path                   | Auth | Description                    |
| ------ | ---------------------- | ---- | ------------------------------ |
| GET    | `/api/settings`        | Yes  | Get all settings               |
| POST   | `/api/settings`        | Yes  | Update settings (key-value)    |
| GET    | `/api/settings/export` | Yes  | Export data (?settings, ?words, ?rules, ?lessons) |
| POST   | `/api/settings/import` | Yes  | Import data (JSON body)        |
| POST   | `/api/settings/reset`  | Yes  | Reset selected data categories |

## Development Commands

```bash
# Install all dependencies (from project root)
pnpm install

# Start backend (with Prisma generate + hot reload)
cd backend && pnpm start:dev

# Start frontend (Vite dev server with API proxy)
cd frontend && pnpm dev

# Generate Prisma client after schema changes
cd backend && pnpm prisma:generate

# Push schema changes to database (no migrations, direct push for SQLite)
cd backend && pnpm prisma:migrate

# Production build
cd backend && pnpm build
cd frontend && pnpm build

# Docker Compose
docker compose up --build -d
```

## Environment Variables

See `.env.example`. Key variables:
- `DATABASE_URL` — SQLite path (e.g., `file:./data/dev.db`)
- `PORT` — Backend port (default 3000)
- `VITE_BACKEND_URL` — Backend URL for production frontend
- `FRONTEND_URL` — For CORS origins and OAuth redirects
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` — Google OAuth
- `SESSION_SECRET` — For session cookies AND API key encryption
- `CLOUDFLARE_TUNNEL_TOKEN` — Production tunnel

## Coding Rules

1. **TypeScript everywhere** — No `any` types unless absolutely necessary (e.g., JSON parsing boundaries).
2. **All data is user-scoped** — Never query without `userId` filter. This is a multi-user app.
3. **Preserve existing comments and docstrings** unless they are directly related to a code change.
4. **No test files exist yet** — The project has no test infrastructure.
5. **Prisma generate is required** before backend starts — The generated client is in `src/generated/prisma/` and is gitignored.
6. **SQLite-specific** — No migrations; uses `prisma db push` directly. Uses `better-sqlite3` driver adapter.
7. **JSON fields in SQLite** — SQLite has no native JSON column type, so these are `String` fields containing JSON. Always stringify/parse.
8. **No ESLint config** — No linting is set up.
9. **Frontend uses inline styles sparingly** — Only for one-off layout tweaks (footer). All reusable styles are in `index.css`.
10. **Page components are large single files** — No fine-grained component splitting within pages.
