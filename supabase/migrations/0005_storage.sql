-- 0005_storage.sql — Storage buckets + RLS for tenant-scoped uploads.
--
-- Path convention: <bucket>/<teacher_id>/<entity>/<filename>
-- The teacher_id segment is enforced by RLS policy so a teacher can only
-- read/write under their own folder.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('avatars',  'avatars',  true,  5  * 1024 * 1024, array['image/png','image/jpeg','image/webp']),
  ('logos',    'logos',    true,  5  * 1024 * 1024, array['image/png','image/jpeg','image/webp','image/svg+xml']),
  ('receipts', 'receipts', false, 10 * 1024 * 1024, array['image/png','image/jpeg','image/webp','application/pdf']),
  ('cms',      'cms',      true,  10 * 1024 * 1024, array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do nothing;

-- Helper: extract teacher_id segment from object name "<teacher_uuid>/..."
create or replace function storage.path_teacher_id(name text) returns uuid
language sql immutable as $$
  select case
    when name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/'
    then split_part(name, '/', 1)::uuid
    else null
  end;
$$;

-- Generic policy maker
do $$
declare
  b text;
begin
  foreach b in array array['avatars','logos','receipts','cms'] loop
    execute format($f$
      drop policy if exists %1$s_owner_read on storage.objects;
      create policy %1$s_owner_read on storage.objects for select
        using (
          bucket_id = %2$L
          and storage.path_teacher_id(name) in (select id from teachers where user_id = auth.uid())
        );
    $f$, 'st_' || b || '_owner_read', b);

    execute format($f$
      drop policy if exists %1$s_owner_write on storage.objects;
      create policy %1$s_owner_write on storage.objects for insert
        with check (
          bucket_id = %2$L
          and storage.path_teacher_id(name) in (select id from teachers where user_id = auth.uid())
        );
    $f$, 'st_' || b || '_owner_write', b);

    execute format($f$
      drop policy if exists %1$s_owner_update on storage.objects;
      create policy %1$s_owner_update on storage.objects for update
        using (
          bucket_id = %2$L
          and storage.path_teacher_id(name) in (select id from teachers where user_id = auth.uid())
        );
    $f$, 'st_' || b || '_owner_update', b);

    execute format($f$
      drop policy if exists %1$s_owner_delete on storage.objects;
      create policy %1$s_owner_delete on storage.objects for delete
        using (
          bucket_id = %2$L
          and storage.path_teacher_id(name) in (select id from teachers where user_id = auth.uid())
        );
    $f$, 'st_' || b || '_owner_delete', b);
  end loop;
end $$;

-- Public buckets (avatars/logos/cms) — anyone can SELECT.
create policy public_avatars_read on storage.objects for select using (bucket_id = 'avatars');
create policy public_logos_read   on storage.objects for select using (bucket_id = 'logos');
create policy public_cms_read     on storage.objects for select using (bucket_id = 'cms');
