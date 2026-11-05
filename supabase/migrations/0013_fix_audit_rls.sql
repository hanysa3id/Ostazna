-- 0013_fix_audit_rls.sql
--
-- The original `audit_logs_admin_write` policy required `(auth.jwt() ->> 'role') = 'super_admin'`
-- on EVERY insert. Audit rows are written by the `audit_trigger()` function whenever any
-- teacher writes to any audited table — but the trigger runs in the teacher's auth context,
-- not as super_admin. With RLS enabled, the INSERT into audit_logs is rejected with
-- "42501 insufficient_privilege", which then propagates back to the original UPDATE/INSERT
-- and crashes the user's request (e.g. dashboard load → backfill → trigger → 42501).
--
-- Fix:
--   1. Make audit_trigger bypass RLS explicitly via SET LOCAL row_security = off.
--   2. Add a permissive INSERT policy on audit_logs so even direct (non-trigger) inserts
--      from authenticated users work — content is controlled by application code.

-- =============== TRIGGER: bypass RLS ===============
create or replace function audit_trigger() returns trigger
language plpgsql security definer set search_path = public, auth as $$
declare
  v_teacher uuid;
  v_entity  uuid;
begin
  -- Bypass RLS for the audit insert. Safe because the trigger controls the row content.
  perform set_config('row_security', 'off', true);

  v_teacher := coalesce(
    case when TG_OP <> 'DELETE' then (to_jsonb(NEW)->>'teacher_id')::uuid end,
    case when TG_OP <> 'INSERT' then (to_jsonb(OLD)->>'teacher_id')::uuid end
  );
  v_entity := coalesce(
    case when TG_OP <> 'DELETE' then (to_jsonb(NEW)->>'id')::uuid end,
    case when TG_OP <> 'INSERT' then (to_jsonb(OLD)->>'id')::uuid end
  );

  insert into audit_logs(teacher_id, actor_id, action, entity_type, entity_id, old_values, new_values)
  values (
    v_teacher,
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    v_entity,
    case when TG_OP in ('UPDATE','DELETE') then to_jsonb(OLD) end,
    case when TG_OP in ('INSERT','UPDATE') then to_jsonb(NEW) end
  );

  return coalesce(NEW, OLD);
end; $$;

-- =============== POLICIES: audit_logs writes ===============
-- Drop the restrictive admin-only INSERT/UPDATE/DELETE policy.
drop policy if exists audit_logs_admin_write on audit_logs;

-- Allow any authenticated user to INSERT (needed for triggers running in their context).
-- Content is controlled by the trigger function and application code.
drop policy if exists audit_logs_authenticated_insert on audit_logs;
create policy audit_logs_authenticated_insert on audit_logs for insert
  to authenticated
  with check (true);

-- Only super admins can UPDATE/DELETE audit logs (they should be append-only anyway).
drop policy if exists audit_logs_admin_modify on audit_logs;
create policy audit_logs_admin_modify on audit_logs for update
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists audit_logs_admin_delete on audit_logs;
create policy audit_logs_admin_delete on audit_logs for delete
  using (public.is_super_admin());
