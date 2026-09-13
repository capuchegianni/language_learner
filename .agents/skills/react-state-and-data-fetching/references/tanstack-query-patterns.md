# TanStack Query Patterns & Server State Strategies

This reference provides advanced recipes for caching, pagination, optimistic updates, and error boundary integration with TanStack Query.

---

## 1. Optimistic Updates for Instant UI Responsiveness

When updating a single item (e.g. updating a word's translation or grammar rule), update the cache optimistically before the network response arrives:

```typescript
export function useUpdateWord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Word> }) =>
      api.updateWord(id, payload),
    onMutate: async ({ id, payload }) => {
      // Cancel outgoing queries to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.words.all });

      // Snapshot previous value
      const previousWords = queryClient.getQueryData<Word[]>(queryKeys.words.list());

      // Optimistically update cache
      if (previousWords) {
        queryClient.setQueryData<Word[]>(
          queryKeys.words.list(),
          previousWords.map(w => (w.id === id ? { ...w, ...payload } : w))
        );
      }

      return { previousWords };
    },
    onError: (_err, _variables, context) => {
      // Rollback on failure
      if (context?.previousWords) {
        queryClient.setQueryData(queryKeys.words.list(), context.previousWords);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.words.all });
    },
  });
}
```

---

## 2. Preventing Race Conditions & Stale Effect Bugs

### Anti-Pattern: Using `useEffect` to Sync Data to State
```tsx
// ❌ ANTI-PATTERN: Syncing prop/query data into local state manually
const { data: word } = useWord(id);
const [translation, setTranslation] = useState('');

useEffect(() => {
  if (word) setTranslation(word.nativeLanguage);
}, [word]); // Prone to stale closures and out-of-order execution!
```

### Recommended: Derive State or Key the Form
```tsx
// ✅ RECOMMENDED: Use key on component to reset local form when entity ID changes
<WordEditForm key={word.id} initialWord={word} onSave={handleSave} />
```

---

## 3. Query Client Configuration Standard

Configure default stale time and retry policies in `src/main.tsx`:

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes before refetching on window focus
      gcTime: 1000 * 60 * 15,    // 15 minutes before garbage collecting inactive cache
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Do not retry 401, 403, or 404
        const status = error?.response?.status;
        if (status === 401 || status === 403 || status === 404) return false;
        return failureCount < 2;
      },
    },
  },
});
```
