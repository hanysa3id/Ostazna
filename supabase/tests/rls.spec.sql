-- supabase/tests/rls.spec.sql
-- pgTAP tests for tenant isolation. Run with:
--   psql "$SUPABASE_DB_URL" -f supabase/tests/rls.spec.sql
--
-- Requires the pgtap extension (Supabase Cloud has it; enable from the dashboard if needed).

create extension if not exists pgtap with schema extensions;

begin;

select plan(6);

-- Setup: two synthetic teachers + a student each.
do $$
declare
  uA uuid := gen_random_uuid();
  uB uuid := gen_random_uuid();
  tA uuid;
  tB uuid;
begin
  -- Insert auth.users mocks (service-role context only).
  insert into auth.users (id, email) values (uA, 'a@test.com'), (uB, 'b@test.com');

  insert into teachers (user_id, name_ar, email) values (uA, 'مدرس أ', 'a@test.com') returning id into tA;
  insert into teachers (user_id, name_ar, email) values (uB, 'مدرس ب', 'b@test.com') returning id into tB;

  insert into students (teacher_id, name_ar) values (tA, 'طالب أ');
  insert into students (teacher_id, name_ar) values (tB, 'طالب ب');

  perform set_config('app.uA', uA::text, false);
  perform set_config('app.uB', uB::text, false);
  perform set_config('app.tA', tA::text, false);
  perform set_config('app.tB', tB::text, false);
end $$;

-- Become teacher A
set local role authenticated;
set local request.jwt.claims to (select json_build_object('sub', current_setting('app.uA'))::text);

select is(
  (select count(*)::int from students),
  1,
  'teacher A sees only their own students'
);

-- Try to write to teacher B's row → should fail.
prepare cross_write as
  update students set name_ar = 'hijack' where teacher_id = current_setting('app.tB')::uuid;
select throws_ok('cross_write', '42501', 'new row violates row-level security policy', 'cross-tenant write blocked');

-- Try to read teacher B's row directly → should return zero.
select is(
  (select count(*)::int from students where teacher_id = current_setting('app.tB')::uuid),
  0,
  'cross-tenant read returns zero'
);

-- Become teacher B
set local request.jwt.claims to (select json_build_object('sub', current_setting('app.uB'))::text);

select is(
  (select count(*)::int from students),
  1,
  'teacher B sees only their own students'
);

-- Insert a new student with their own teacher_id → should succeed.
insert into students (teacher_id, name_ar) values (current_setting('app.tB')::uuid, 'طالب ب 2');
select is(
  (select count(*)::int from students),
  2,
  'teacher B can insert into own scope'
);

-- Insert with someone else's teacher_id → should fail.
prepare bad_insert as
  insert into students (teacher_id, name_ar) values (current_setting('app.tA')::uuid, 'sneaky');
select throws_ok('bad_insert', '42501', 'new row violates row-level security policy', 'cannot insert into another teacher');

select * from finish();

rollback;
