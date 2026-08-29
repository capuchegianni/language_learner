# Advanced React Component Patterns & Memoization Rules

This reference outlines architectural patterns, decomposition techniques, and memoization guidelines for React 19 + TypeScript.

---

## 1. Composition Patterns vs Prop Drilling

### The Children & Slot Pattern
Instead of passing 10 different props through 4 intermediate wrapper components just to render a button or title, pass the rendered elements as `children` or named slots:

```tsx
// ❌ ANTI-PATTERN: Prop drilling through Card to reach Action Buttons
interface CardProps {
  title: string;
  badgeText: string;
  onEdit: () => void;
  onDelete: () => void;
  editDisabled?: boolean;
}

// ✅ RECOMMENDED: Slot composition
interface CardProps {
  header: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const GlassCard: React.FC<CardProps> = ({ header, actions, children }) => (
  <div className="glass-card">
    <div className="card-header">
      {header}
      {actions && <div className="card-actions">{actions}</div>}
    </div>
    <div className="card-body">{children}</div>
  </div>
);
```

### Compound Component Pattern
For multi-part UI elements (e.g. Accordions, Tab systems, Filter bars), use compound components to share implicit context cleanly:

```tsx
export const Tabs = ({ activeTab, onChange, children }: TabsProps) => {
  return (
    <TabsContext.Provider value={{ activeTab, onChange }}>
      <div className="tabs-container">{children}</div>
    </TabsContext.Provider>
  );
};

Tabs.List = TabsList;
Tabs.Tab = TabTrigger;
Tabs.Panel = TabPanel;
```

---

## 2. Container vs Presentational Separation

| Feature | Container Component | Presentational Component |
| :--- | :--- | :--- |
| **Primary Goal** | How things work (data fetching, business logic) | How things look (styles, markup, animations) |
| **State** | Server state (TanStack Query), route params, global context | Pure props, transient UI state (hover, dropdown toggle) |
| **Reusability** | Feature-specific, bound to route or page | High reusability across features |
| **Testing** | Integration / flow tests | Snapshot / visual / unit tests |

---

## 3. Custom Hook Extraction Guidelines

Extract stateful logic into a custom hook when:
1. **The component has >2 pieces of interrelated state** (e.g., form fields, step indicators, validation errors).
2. **The logic involves window listeners, timers, or web APIs** (e.g. `useKeyboardShortcut`, `useAudioPlayer`, `useLocalStorage`).
3. **The component mixes business calculations with DOM markup**.

### Clean Custom Hook Signature Pattern
```typescript
interface UseWordFilterOptions {
  words: Word[];
  initialSearch?: string;
  initialPartOfSpeech?: string;
}

interface UseWordFilterReturn {
  search: string;
  setSearch: (query: string) => void;
  partOfSpeech: string;
  setPartOfSpeech: (pos: string) => void;
  filteredWords: Word[];
  totalMatches: number;
}

export function useWordFilter({
  words,
  initialSearch = '',
  initialPartOfSpeech = 'ALL',
}: UseWordFilterOptions): UseWordFilterReturn {
  const [search, setSearch] = useState(initialSearch);
  const [partOfSpeech, setPartOfSpeech] = useState(initialPartOfSpeech);

  const filteredWords = useMemo(() => {
    return words.filter(w => {
      const matchesSearch = !search || w.targetLanguage.toLowerCase().includes(search.toLowerCase()) || w.nativeLanguage.toLowerCase().includes(search.toLowerCase());
      const matchesPos = partOfSpeech === 'ALL' || w.partOfSpeech === partOfSpeech;
      return matchesSearch && matchesPos;
    });
  }, [words, search, partOfSpeech]);

  return {
    search,
    setSearch,
    partOfSpeech,
    setPartOfSpeech,
    filteredWords,
    totalMatches: filteredWords.length,
  };
}
```

---

## 4. Memoization Guidelines (`useMemo`, `useCallback`, `React.memo`)

### When to Use `useMemo`:
- Heavy data transformations (filtering/sorting lists with >100 items).
- Complex regex operations or parsed JSON transformations.
- Creating stable object references passed as dependency to `useEffect` or to a memoized child component.

### When NOT to Use `useMemo`:
- Trivial primitives: `const isReady = useMemo(() => a && b, [a, b]);` (unnecessary overhead).
- Simple string concatenations or basic math.

### When to Use `useCallback`:
- Event handlers or functions passed as props to children wrapped with `React.memo`.
- Functions included in a `useEffect` dependency array.

### When to Use `React.memo`:
- Frequently rendered list items (e.g., items in a large Word Bank or Rule list).
- Heavy visualization components that receive identical props during unrelated parent re-renders.
