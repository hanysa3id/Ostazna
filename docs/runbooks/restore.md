# DB Restore Runbook

Run quarterly. Goal: prove the latest restic snapshot in B2 is restorable.

## Prereqs
- VPS access (`deploy` user).
- Restic env vars set (`RESTIC_REPOSITORY`, `RESTIC_PASSWORD`, `B2_*`).
- Disposable Postgres instance (Supabase branch or local docker).

## Steps
1. List snapshots:
   ```bash
   restic snapshots --tag <recent-date>
   ```
2. Pick the most recent snapshot id.
3. Stream restore to a fresh DB:
   ```bash
   restic dump <snapshot-id> ostazna-<ts>.dump | \
     pg_restore --no-owner --dbname=postgres://... --clean --if-exists
   ```
4. Connect to the restored DB and run smoke checks:
   - `select count(*) from teachers;` matches expected
   - `select count(*) from audit_logs where created_at > now() - interval '7 days';` non-zero
   - Verify a known teacher's `student_groups` count via JOIN
5. Document restore time (RTO target: <30 min for ≤10 GB DB).
6. Drop the disposable DB.

## On a real incident
- Freeze writes (Supabase dashboard → Pause API).
- Snapshot current state before restoring (forensics).
- Restore to a *new* DB first, swap DSN in `.env.production`, redeploy.
- Never restore in-place over the live DB unless explicitly authorized.
