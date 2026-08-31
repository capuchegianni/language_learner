#!/usr/bin/env bash
# Quick automated audit script for NestJS backend

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
BACKEND_DIR="$WORKSPACE_ROOT/backend"

echo "========================================================"
echo "🔍 Starting NestJS Automated Audit Scan"
echo "========================================================"

echo ""
echo "1. Checking TypeScript Compiler Health (tsc --noEmit)..."
if cd "$BACKEND_DIR" && pnpm exec tsc --noEmit; then
  echo "✅ TypeScript build passes with 0 errors."
else
  echo "❌ TypeScript compilation reported errors. Review above output."
fi

echo ""
echo "2. Auditing Prisma multi-tenancy scoping (searching for unscoped queries)..."
cd "$BACKEND_DIR"
UNSCOPED_CALLS=$(grep -rnE 'this\.prisma\.[a-zA-Z]+\.(findMany|findFirst|update|delete|deleteMany|count)\(' src/ \
  | grep -v 'where' \
  | grep -v 'user\.' \
  | grep -v 'prisma\.service' || true)

if [ -n "$UNSCOPED_CALLS" ]; then
  echo "⚠️ Potential unscoped Prisma queries detected:"
  echo "$UNSCOPED_CALLS"
else
  echo "✅ No obvious unscoped Prisma find/update/delete calls found without 'where'."
fi

echo ""
echo "3. Scanning for raw 'console.log' instead of NestJS Logger..."
RAW_LOGS=$(grep -rnE 'console\.(log|error|warn|info)' src/ | grep -v 'node_modules' || true)
if [ -n "$RAW_LOGS" ]; then
  echo "⚠️ Found raw console.log usages (prefer NestJS Logger):"
  echo "$RAW_LOGS"
else
  echo "✅ No raw console.log calls found."
fi

echo ""
echo "4. Scanning for unparsed or manual JSON string fields..."
JSON_CALLS=$(grep -rnE 'JSON\.(parse|stringify)' src/ || true)
echo "ℹ️ Found $(echo "$JSON_CALLS" | wc -l) JSON string manipulation points in backend."

echo ""
echo "========================================================"
echo "✅ Quick Audit Scan complete."
echo "========================================================"
