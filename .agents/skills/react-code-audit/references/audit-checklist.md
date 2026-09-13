# React & Vite Audit Checklist & Anti-Pattern Catalog

This reference details specific code smells, bug patterns, and validation steps when performing frontend audits.

---

## 1. Top React Anti-Patterns to Inspect

### 1.1 The God Page / Mega-Component
- **Smell**: A single `.tsx` file exceeding 300+ lines handling UI layout, 15+ `useState` calls, 4 modal states, raw API calls, and inline forms.
- **Example in repo**: `src/pages/Settings.tsx` (~1,000 lines).
- **Risk**: Extreme cognitive overhead, impossible to test in isolation, unpredictable re-renders on any keystroke.

### 1.2 Inline Styles for Layout & Theming
- **Smell**: `style={{ display: 'flex', gap: '1rem', background: '#111827' }}` in JSX.
- **Risk**: Bypasses CSS class caching, breaks responsive media queries, ignores global design tokens, bloats DOM virtual nodes.

### 1.3 `useEffect` as an Event Handler or Computed Value
- **Smell**:
  ```tsx
  // ❌ ANTI-PATTERN: Using useEffect to compute a derived value
  const [fullName, setFullName] = useState('');
  useEffect(() => {
    setFullName(`${firstName} ${lastName}`);
  }, [firstName, lastName]);
  ```
- **Fix**: Compute directly in render body:
  ```tsx
  // ✅ Clean derived value
  const fullName = `${firstName} ${lastName}`;
  ```

### 1.4 Uncleaned Effects & Unmounted State Updates
- **Smell**:
  ```tsx
  // ❌ ANTI-PATTERN: Async fetch with setState without unmount guard
  useEffect(() => {
    api.getStats().then(data => setStats(data));
  }, []);
  ```
- **Fix**: Use TanStack Query which automatically manages query cancellation, caching, and teardown.

---

## 2. Step-by-Step Audit Checklist

- [ ] **Type Check**: Does `tsc --noEmit` return 0 errors?
- [ ] **Type Cleanliness**: Are there any `any` types or loose `as any` casts?
- [ ] **File Sizes**: Are all component files under 250 lines?
- [ ] **Data Fetching**: Are all network requests routed through TanStack Query / `services/api.ts`?
- [ ] **Loading & Error UX**: Does every async view display a loading indicator and error fallback?
- [ ] **Styling Hygiene**: Are all styles using CSS classes and CSS custom property tokens?
- [ ] **Keys in Lists**: Are all list `.map()` elements keyed with unique stable entity IDs?
- [ ] **Form Handling**: Are forms structured with controlled inputs or dedicated custom hooks?
- [ ] **Responsiveness**: Do pages render cleanly on 375px mobile screens without horizontal clipping?
