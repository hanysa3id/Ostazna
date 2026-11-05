#!/usr/bin/env bash
# scripts/deploy.sh — pull, rebuild app, rolling restart.
# Run on the VPS as the `deploy` user from the project root.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> git pull"
git fetch --quiet origin main
git reset --hard origin/main

echo "==> docker compose build app"
docker compose build app

echo "==> docker compose up -d"
docker compose up -d --no-deps --build app

echo "==> waiting for healthcheck"
for i in {1..20}; do
  if docker compose exec -T app wget -qO- http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "==> app healthy"
    exit 0
  fi
  sleep 3
done
echo "!! app failed to become healthy"
exit 1
