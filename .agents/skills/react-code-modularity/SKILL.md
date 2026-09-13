---
name: react-code-modularity
description: >-
  Defines project directory structure, modularity rules, file colocation strategies, and boundary hygiene for React/Vite codebases. Use this skill when organizing new features, refactoring directory layouts, deciding whether to colocate or extract shared components/hooks/types, managing barrel exports, and preventing circular dependencies.
---

# React Code Modularity & Directory Structure Skill

This skill defines the architectural blueprint, file colocation rules, and boundary hygiene for organizing a React + Vite codebase into modular, scalable, and self-contained units.

---

## 1. Hybrid Feature-Colocated & Layered Architecture

The application adopts a **hybrid feature-colocated structure** combined with a clean **layered shared structure**:

```
frontend/src/
├── components/           # Shared, reusable UI widgets (Button, Modal, EmptyState, etc.)
│   └── <SharedComponent>/
│       ├── <SharedComponent>.tsx
│       ├── <SharedComponent>.css
│       └── index.ts
├── pages/                # Top-level routable views and complex feature directories
│   ├── Dashboard/
│   │   ├── components/   # Local sub-components private to Dashboard
│   │   │   ├── StatsOverview.tsx
│   │   │   └── RecentActivity.tsx
│   │   ├── hooks/        # Local custom hooks private to Dashboard
│   │   │   └── useDashboardFilters.ts
│   │   ├── types.ts      # Local types private to Dashboard
│   │   ├── Dashboard.css # Local styles for Dashboard
│   │   └── index.tsx     # Page orchestrator & router entry
│   ├── Settings/
│   │   ├── components/
│   │   │   ├── AiConfigSection.tsx
│   │   │   ├── ImportExportSection.tsx
│   │   │   └── AccountSection.tsx
│   │   ├── hooks/
│   │   │   └── useSettingsForm.ts
│   │   ├── Settings.css
│   │   └── index.tsx
│   ├── WordBank/
│   ├── RuleBank/
│   └── LessonDetail/
├── contexts/             # Global application state (Auth, Language, Theme)
├── hooks/                # Cross-cutting, domain-agnostic or shared domain hooks
│   ├── useDebounce.ts
│   ├── useAudioPlayer.ts
│   └── useModal.ts
├── services/             # API client & backend endpoint adapters
│   ├── api.ts            # Central Axios HTTP client & method definitions
│   └── queryKeys.ts      # Standardized TanStack Query cache keys
├── styles/               # Global design tokens, typography, reset, variables
│   ├── tokens.css
│   ├── base.css
│   └── index.css
└── types/                # Shared global models, database contracts & DTOs
    └── index.ts
```

---

## 2. Modularity & Colocation Rules

### Rule 1: Mandatory Dedicated Page Folders (`src/pages/<PageName>/index.tsx`)
- **Every page without exception MUST have its own dedicated directory**: `src/pages/<PageName>/index.tsx` (e.g., `src/pages/Login/index.tsx`, `src/pages/Dashboard/index.tsx`, `src/pages/WordBank/index.tsx`).
- Standalone page files at the root of `src/pages/` (e.g. `Login.tsx`, `Dashboard.tsx`) are **strictly forbidden**, regardless of size or simplicity.
- Colocate sub-components (`components/`), feature hooks (`hooks/`), private types (`types.ts`), and feature stylesheets (`<PageName>.css`) inside that folder.
- Keep the page feature self-contained and encapsulated.

### Rule 2: Shared Promotion Threshold (Reusable Entities)
- **The "Rule of Two"**: As soon as a component, hook, or type is needed in **2 or more distinct pages**, it MUST be extracted out of the local page folder and promoted to:
  - `src/components/<ComponentName>/` for reusable UI widgets.
  - `src/hooks/<hookName>.ts` for reusable logic.
  - `src/types/` for shared domain models or payload interfaces.
- Always generalize the component/hook with appropriate props/parameters when promoting it.

### Rule 3: File Naming & Encapsulation Conventions
- **Components**: PascalCase (e.g. `StatsOverview.tsx`, `AiConfigSection.tsx`).
- **Hooks**: camelCase prefixed with `use` (e.g. `useSettingsForm.ts`, `useDebounce.ts`).
- **Types**: camelCase or `types.ts` (e.g. `types/index.ts`, `pages/Settings/types.ts`).
- **Styles**: Match the component name (e.g. `Settings.css` alongside `Settings/index.tsx` or `Modal.css` inside `components/Modal/`).
- **Folder Indexing**: Use `index.tsx` or `index.ts` only as the main public entry/orchestrator of a multi-file folder.

### Rule 4: Clean Imports & Boundary Hygiene
- Avoid deep relative traversal spaghetti (e.g., `../../../../components/Navbar`).
- Use Vite path aliases (`@/...` if configured) or consistent relative imports.
- Never import a private sub-component of Page A into Page B directly (e.g. `import { AiConfigSection } from '../Settings/components/AiConfigSection'`). If Page B needs it, promote it to `src/components/`.

---

## 3. Reference Documentation

- [Directory Structure & Colocation Guidelines](./references/directory-structure-guide.md)
