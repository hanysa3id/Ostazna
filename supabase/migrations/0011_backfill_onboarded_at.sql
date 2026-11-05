-- 0011_backfill_onboarded_at.sql
-- Any teacher who has both a subdomain AND a current_plan_id has effectively
-- completed onboarding. If `onboarded_at` is NULL on those rows, set it now
-- so they don't get bounced into the wizard on next login.

update teachers
set onboarded_at = coalesce(onboarded_at, created_at, now())
where onboarded_at is null
  and subdomain is not null
  and current_plan_id is not null;
