#!/usr/bin/env bash
# scripts/backup.sh — nightly Postgres dump of the Supabase database to Backblaze B2 via restic.
# Schedule: cron entry → 0 3 * * * /opt/ostazna/scripts/backup.sh
set -euo pipefail

: "${SUPABASE_DB_URL:?SUPABASE_DB_URL not set}"
: "${RESTIC_REPOSITORY:?RESTIC_REPOSITORY not set (e.g. b2:ostazna-backups:/postgres)}"
: "${RESTIC_PASSWORD:?RESTIC_PASSWORD not set}"
: "${B2_ACCOUNT_ID:?B2_ACCOUNT_ID not set}"
: "${B2_ACCOUNT_KEY:?B2_ACCOUNT_KEY not set}"

TS=$(date +%Y-%m-%dT%H-%M-%S)
TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT

echo "==> pg_dump → $TMP"
pg_dump --format=custom --no-owner --no-privileges --dbname="$SUPABASE_DB_URL" --file="$TMP"

echo "==> restic backup"
restic backup --tag "$TS" --stdin-filename "ostazna-${TS}.dump" --stdin < "$TMP"

echo "==> restic forget (keep 7d/4w/6m)"
restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --prune

echo "==> done"
