-- 0014_fix_is_super_admin.sql
--
-- The `is_super_admin()` function from 0009 was created as `security invoker`,
-- meaning it runs with the *caller's* permissions. The `authenticated` role
-- does not have SELECT on `auth.users`, so when a teacher's RLS policy calls
-- `is_super_admin()` and the JWT has no `role` claim (most teachers, until the
-- Custom Access Token Hook is registered), the fallback query reads auth.users
-- and dies with: 42501 "permission denied for table users".
--
-- That error then propagates back to whatever query triggered the RLS check
-- (e.g. `select * from students`), bringing down the whole dashboard.
--
-- Fix: re-create as `security definer` so the function runs as the (privileged)
-- function owner. The function only reads a single row's role flag, so this is
-- a tightly-scoped privilege escalation.

create or replace function public.is_super_admin() returns boolean
language sql stable security definer set search_path = public, auth as $$
  select coalesce(
    (auth.jwt() ->> 'role') = 'super_admin',
    (
      select (raw_app_meta_data ->> 'role') = 'super_admin'
      from auth.users
      where id = auth.uid()
    ),
    false
  );
$$;

grant execute on function public.is_super_admin() to authenticated, anon, service_role;
