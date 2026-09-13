#!/usr/bin/env bash
# Quick automated scan for React/Vite code quality anti-patterns

FRONTEND_SRC="frontend/src"

echo "=== React Frontend Quick Audit ==="
echo ""

# 1. Type check
echo "1. Running TypeScript compiler check..."
pnpm --filter language-learner-frontend exec tsc --noEmit
if [ $? -eq 0 ]; then
  echo "✅ TypeScript check passed with 0 errors."
else
  echo "❌ TypeScript compiler reported errors."
fi
echo ""

# 2. Large files (>250 lines)
echo "2. Checking for large component files (>250 lines)..."
find "$FRONTEND_SRC" -name "*.tsx" -not -path "*/node_modules/*" | while read -r file; do
  lines=$(wc -l < "$file")
  if [ "$lines" -gt 250 ]; then
    echo "⚠️  Large file ($lines lines): $file"
  fi
done
echo ""

# 3. Inline style usages
echo "3. Scanning for inline style usages (style={{ ... }})..."
inline_count=$(grep -rn "style={{" "$FRONTEND_SRC" --include="*.tsx" 2>/dev/null | wc -l)
echo "Found $inline_count inline style occurrences."
if [ "$inline_count" -gt 0 ]; then
  grep -rn "style={{" "$FRONTEND_SRC" --include="*.tsx" | head -n 10
  if [ "$inline_count" -gt 10 ]; then
    echo "... and more."
  fi
fi
echo ""

# 4. Search for 'any' types
echo "4. Scanning for explicit 'any' types..."
any_count=$(grep -rn ": any" "$FRONTEND_SRC" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
echo "Found $any_count ': any' type occurrences."
if [ "$any_count" -gt 0 ]; then
  grep -rn ": any" "$FRONTEND_SRC" --include="*.ts" --include="*.tsx" | head -n 10
fi
echo ""

# 5. Search for raw axios calls in components
echo "5. Scanning for direct axios imports outside services/..."
axios_in_components=$(grep -rn "from 'axios'" "$FRONTEND_SRC" --exclude-dir="services" --include="*.tsx" 2>/dev/null | wc -l)
if [ "$axios_in_components" -gt 0 ]; then
  echo "⚠️  Found $axios_in_components direct axios imports in UI components!"
  grep -rn "from 'axios'" "$FRONTEND_SRC" --exclude-dir="services" --include="*.tsx"
else
  echo "✅ No direct axios imports in UI components."
fi

# 6. Check for standalone page files (must be in subfolder/index.tsx)
echo "6. Checking for standalone page files in pages/ root (must be <PageName>/index.tsx)..."
standalone_pages=$(find "$FRONTEND_SRC/pages" -maxdepth 1 -name "*.tsx" 2>/dev/null)
if [ -n "$standalone_pages" ]; then
  echo "⚠️  Found standalone page files that should be moved to <PageName>/index.tsx:"
  echo "$standalone_pages" | while read -r page; do
    echo "   - $page"
  done
else
  echo "✅ All pages follow the dedicated <PageName>/index.tsx folder convention."
fi

echo ""
echo "=== Quick Audit Complete ==="
