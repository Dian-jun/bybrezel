#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

for port in 3000 3001 3002; do
  pids="$(lsof -ti tcp:${port} || true)"
  if [ -n "$pids" ]; then
    echo "Stopping processes on port ${port}: $pids"
    kill $pids || true
  fi
done

rm -rf .next
echo "Cleared .next cache"

npm run dev
