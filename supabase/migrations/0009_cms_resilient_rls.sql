-- 0009_cms_resilient_rls.sql
--
-- The CMS write policies on `site_*` tables previously required `auth.jwt() ->> 'role' = 'super_admin'`.
-- That claim is only present if the Custom Access Token Hook is registered in the Supabase Dashboard.
-- If it isn't, the admin literally cannot write anything from the dashboard.
--
-- This migration adds a fallback INSERT/UPDATE/DELETE policy that recognizes
-- super admins via `auth.users.raw_app_meta_data ->> 'role'` directly. That column
-- is set by the seed-admin script and survives across sessions without depending on the hook.
--
-- The application code uses the service role for all CMS writes anyway, so this is
-- defense in depth — but ensures any future code path that uses the user-scoped client
-- still works.

create or replace function public.is_super_admin() returns boolean
language sql stable security invoker as $$
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

do $$
declare t text;
begin
  foreach t in array array[
    'site_settings','site_hero_slides','site_stats','site_features',
    'site_testimonials','site_faqs','site_pages'
  ] loop
    execute format('drop policy if exists %I_admin_write on %I', t, t);
    execute format($f$
      create policy %I_admin_write on %I for all
        using (public.is_super_admin())
        with check (public.is_super_admin());
    $f$, t, t);
  end loop;
end $$;
