# React Frontend Code Quality & Architecture Rules

All code written or modified in the `frontend/` directory MUST adhere to the following non-negotiable rules:

---

## 1. Type Safety & TypeScript Strictness
- **Zero compiler errors**: `pnpm --filter language-learner-frontend exec tsc --noEmit` must pass with 0 errors at all times.
- **No `any` types**: Always define explicit interfaces or types. Never use `any` as an escape hatch.
- **Null Safety**: Always handle nullable properties with optional chaining (`?.`) or nullish coalescing (`??`). Never call array functions (`.map()`, `.filter()`, `.reduce()`) on potentially undefined/null collections without guarding.
- **Props Typing**: Every React component must have a dedicated, exported TypeScript interface for its props (e.g. `interface RuleCardProps { ... }`). Avoid anonymous inline object types for props exceeding 2 properties.

---

## 2. Component Architecture & File Size Limits
- **Single Responsibility Principle**: Components should do one thing well (display UI, orchestrate domain flow, or manage layout).
- **File Size Limit (Max 250 Lines)**: Page components or UI components MUST NOT become monolithic god files (e.g. 500+ lines). Break complex views into sub-components, container/presentational layers, and dedicated hooks.
- **Component Decomposition**: Sibling UI sections (e.g., tabs, cards, modals, complex tables) must be extracted into dedicated sub-components in their own files.
- **Custom Hook Extraction**: Extract complex stateful logic, side effects, form management, and data orchestration into dedicated custom hooks (`use*`).

---

## 3. Modularity & Directory Structure (Hybrid Feature-Colocated)
- **Mandatory Dedicated Page Directories (No Standalone Page Files)**:
  - Every page without exception MUST be housed in its own dedicated directory: `src/pages/<PageName>/index.tsx` (e.g., `src/pages/Login/index.tsx`, `src/pages/Dashboard/index.tsx`, `src/pages/Settings/index.tsx`).
  - Standalone page files at the root of `src/pages/` (e.g., `src/pages/Login.tsx`, `src/pages/Dashboard.tsx`) are **strictly prohibited**, even if the page currently consists of only a single file.
  - Feature-specific sub-components, local custom hooks, local types, and local styles MUST be colocated inside that page's directory (e.g., `src/pages/Settings/components/`, `src/pages/Settings/hooks/`, `src/pages/Settings/Settings.css`).
- **Layered Architecture for Shared Entities**:
  - Reusable UI primitives and widgets live in `src/components/<ComponentName>/`.
  - Cross-page domain hooks live in `src/hooks/`.
  - Shared models, DTOs, and domain interfaces live in `src/types/`.
- **Threshold for Extraction**: Any component, hook, or type reused across 2 or more distinct pages/features must be promoted from local colocation to `src/components/`, `src/hooks/`, or `src/types/` in its own dedicated subfolder or file.

---

## 4. State Management & Data Fetching (TanStack Query + Axios)
- **Server State via TanStack Query**: Use React Query queries (`useQuery`) and mutations (`useMutation`) for all server interactions.
- **Centralized API Client**: All HTTP requests must go through `src/services/api.ts` or domain API service modules. Never call raw `axios.get/post` directly inside UI components.
- **Standardized Query Keys**: Group and standardize query keys in a structured constant (e.g. `['lessons', 'detail', id]`, `['words', { search }]`).
- **Async Resilience**: Always provide graceful loading (`isPending`), error (`isError`), and empty states in the UI. Ensure mutations invalidate or optimistically update related queries.
- **Context API Boundary**: Use React Context only for true global application state (e.g. `AuthContext`, `LanguageContext`, `ThemeContext`). Do not use Context as a caching layer for API entity data.

---

## 5. UI Styling, Design Tokens & Zero Inline Styles
- **No Inline Styles**: Avoid `style={{ ... }}` for layout, typography, or theming. All styling must use CSS classes. Inline styles are only permissible for dynamic runtime values (e.g. dynamic canvas coordinates or calculated progress percentages).
- **Global Design Tokens**: Rely strictly on CSS custom properties defined in `src/styles/` (`--bg-dark`, `--bg-card`, `--accent-primary`, `--glass-blur`, `--border-card`, etc.).
- **Modular Component CSS**: Colocate component/page-specific CSS files alongside their components (e.g. `src/pages/Settings/Settings.css`) and import them directly.
- **Dark Glassmorphism Fidelity**: Maintain the dark glassmorphic visual standard (`backdrop-filter: blur`, subtle border highlights, glowing accents, polished hover transitions).

---

## 6. Performance & React Best Practices
- **Stable References**: Wrap expensive callbacks in `useCallback` and memoize heavy transformations with `useMemo` when passed to memoized children.
- **Key Props**: Never use array index as `key` for dynamically reordered, filtered, or mutated lists. Always use unique entity IDs (e.g. `key={word.id}`).
- **Cleanup in Effects**: Any `useEffect` setting event listeners, timers, subscriptions, or AbortControllers MUST return a cleanup function to prevent memory leaks.
- **No Direct State Mutation**: Always treat React state as immutable. Use updater functions (`setItems(prev => [...prev, newItem])`) when new state depends on previous state.

---

## 7. Verification Checklist (Definition of Done)
Before finishing any frontend task:
1. Run `pnpm --filter language-learner-frontend exec tsc --noEmit` (Must pass with 0 errors).
2. Run `pnpm --filter language-learner-frontend build` (Vite production build must succeed).
3. Verify no `console.log` or debug statements remain.
4. Verify responsive design on mobile and desktop viewports.
