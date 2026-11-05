-- 0002_resilient_rls.sql
-- The original tenant policies depended on the JWT carrying a `teacher_id` claim
-- (set by the Custom Access Token Hook). That hook may not be registered yet, and
-- the claim is not refreshed automatically after onboarding completes.
--
-- This migration switches the canonical check to a subquery against `teachers`
-- (always reliable, RLS-bypassing on a tiny indexed lookup). The JWT claim
-- remains useful as an optimization for joins/queries but is no longer
-- *required* for correctness.

do $$
declare
  t text;
begin
  foreach t in array array[
    'subscriptions','academic_years','grades','subjects','groups',
    'students','student_groups','sessions','attendance','payments','wa_send_log'
  ] loop
    execute format('drop policy if exists %I_tenant_read on %I', t, t);
    execute format('drop policy if exists %I_tenant_write on %I', t, t);

    execute format($f$
      create policy %I_tenant_read on %I for select
        using (
          teacher_id in (select id from teachers where user_id = auth.uid())
          or (auth.jwt() ->> 'role') = 'super_admin'
        );
    $f$, t, t);

    execute format($f$
      create policy %I_tenant_write on %I for all
        using (
          teacher_id in (select id from teachers where user_id = auth.uid())
        )
        with check (
          teacher_id in (select id from teachers where user_id = auth.uid())
        );
    $f$, t, t);
  end loop;
end $$;

-- Same pattern for audit_logs reads.
drop policy if exists audit_logs_tenant_read on audit_logs;
create policy audit_logs_tenant_read on audit_logs for select
  using (
    teacher_id in (select id from teachers where user_id = auth.uid())
    or (auth.jwt() ->> 'role') = 'super_admin'
  );

-- Allow the teacher to insert their own teachers row directly (used as a
-- fallback if onboarding ever runs without service role).
drop policy if exists teachers_self_insert on teachers;
create policy teachers_self_insert on teachers for insert
  with check (user_id = auth.uid());
