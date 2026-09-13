# Prisma & Multi-Tenancy Data Patterns

This guide outlines database query conventions and safety patterns using Prisma with SQLite.

---

## 1. Mandatory Multi-Tenancy Isolation

In a multi-tenant application, every entity owned by a user must be queried with `userId`.

### Query Patterns
```typescript
// 1. Single entity fetch (never use findUnique unless the unique index includes userId)
const word = await this.prisma.word.findFirst({
  where: { id, userId },
});
if (!word) {
  throw new NotFoundException(`Word with ID '${id}' not found`);
}

// 2. Updates (use compound unique if defined, or update with userId check)
const updated = await this.prisma.word.update({
  where: { id },
  data: { ...updateDto },
});

// 3. Deletes (ensure user ownership before deletion or use deleteMany)
const deleted = await this.prisma.word.deleteMany({
  where: { id, userId },
});
if (deleted.count === 0) {
  throw new NotFoundException(`Word with ID '${id}' not found`);
}
```

---

## 2. Transactions for Multi-Entity Operations

Whenever creating, updating, or deleting related entities, always wrap in `this.prisma.$transaction()`:

```typescript
async deleteUserAccount(userId: string): Promise<void> {
  await this.prisma.$transaction(async (tx) => {
    // 1. Delete intermediate many-to-many joins
    await tx.lessonWord.deleteMany({
      where: { lesson: { userId } },
    });
    // 2. Delete main entities
    await tx.lesson.deleteMany({ where: { userId } });
    await tx.word.deleteMany({ where: { userId } });
    await tx.rule.deleteMany({ where: { userId } });
    await tx.setting.deleteMany({ where: { userId } });
    // 3. Delete user
    await tx.user.delete({ where: { id: userId } });
  });
}
```

---

## 3. SQLite Serialized JSON Handling

Since SQLite does not have a native JSON data type, structured data is stored as a `String`.

### Parsing Guard Helper
```typescript
export function parseJsonField<T>(jsonStr: string | null | undefined, fallback: T): T {
  if (!jsonStr || typeof jsonStr !== 'string') return fallback;
  try {
    const parsed = JSON.parse(jsonStr);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}
```

### Writing Guard Helper
```typescript
export function stringifyJsonField<T>(data: T): string {
  if (data === undefined || data === null) return JSON.stringify(null);
  return JSON.stringify(data);
}
```
