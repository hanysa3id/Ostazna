-- 0012_fix_rls_recursion.sql
--
-- Migration 0007_student_self_access added a policy on `teachers` that queried
-- `students`, while existing policies on `students` query `teachers`. The two sides
-- recurse forever during planner evaluation, raising:
--    42P17  infinite recursion detected in policy for relation "teachers"
--
-- Fix: replace the subqueries inside the policies with SECURITY DEFINER functions
-- that bypass RLS for the lookup. These functions are STABLE so Postgres can
-- inline/cache them; they are scoped to the calling user via auth.uid().

-- ============ HELPER FUNCTIONS ============

-- Returns the teacher_id owned by the current auth user (NULL if none).
create or replace function public.my_teacher_id() returns uuid
language sql stable security definer set search_path = public, auth as $$
  select id from public.teachers where user_id = auth.uid() limit 1;
$$;
grant execute on function public.my_teacher_id() to authenticated, anon;

-- Returns the set of teacher_ids whose `students.user_id` is the current auth user
-- (i.e., the teachers a student belongs to). Used by the parent/student-side policies.
create or replace function public.my_student_teacher_ids() returns uuid[]
language sql stable security definer set search_path = public, auth as $$
  select coalesce(array_agg(distinct teacher_id), '{}'::uuid[])
  from public.students where user_id = auth.uid();
$$;
grant execute on function public.my_student_teacher_ids() to authenticated, anon;

-- Returns the set of group_ids the current user (as student) is currently in.
create or replace function public.my_student_group_ids() returns uuid[]
language sql stable security definer set search_path = public, auth as $$
  select coalesce(array_agg(distinct sg.group_id), '{}'::uuid[])
  from public.student_groups sg
  join public.students s on s.id = sg.student_id
  where s.user_id = auth.uid() and sg.left_at is null;
$$;
grant execute on function public.my_student_group_ids() to authenticated, anon;

-- Returns the set of student_ids the current auth user owns (as student).
create or replace function public.my_student_ids() returns uuid[]
language sql stable security definer set search_path = public, auth as $$
  select coalesce(array_agg(id), '{}'::uuid[])
  from public.students where user_id = auth.uid();
$$;
grant execute on function public.my_student_ids() to authenticated, anon;

-- ============ DROP RECURSIVE POLICIES ============

drop policy if exists teachers_student_read on teachers;
drop policy if exists students_self_read on students;
drop policy if exists attendance_self_read on attendance;
drop policy if exists payments_self_read on payments;
drop policy if exists student_groups_self_read on student_groups;
drop policy if exists sessions_self_read on sessions;
drop policy if exists exam_subs_self_read on exam_submissions;
drop policy if exists offline_grades_self_read on offline_grades;
drop policy if exists exams_self_read on exams;
drop policy if exists groups_self_read on groups;

-- Tenant policies from 0002_resilient_rls (drop and recreate using helpers).
do $$
declare t text;
begin
  foreach t in array array[
    'subscriptions','academic_years','grades','subjects','groups',
    'students','student_groups','sessions','attendance','payments','wa_send_log'
  ] loop
    execute format('drop policy if exists %I_tenant_read on %I', t, t);
    execute format('drop policy if exists %I_tenant_write on %I', t, t);
  end loop;
end $$;

drop policy if exists audit_logs_tenant_read on audit_logs;

-- ============ RECREATE WITHOUT RECURSION ============

-- Tenant tables: read + write using my_teacher_id().
do $$
declare t text;
begin
  foreach t in array array[
    'subscriptions','academic_years','grades','subjects','groups',
    'students','student_groups','sessions','attendance','payments','wa_send_log'
  ] loop
    execute format($f$
      create policy %I_tenant_read on %I for select
        using (
          teacher_id = public.my_teacher_id()
          or public.is_super_admin()
        );
    $f$, t, t);

    execute format($f$
      create policy %I_tenant_write on %I for all
        using (teacher_id = public.my_teacher_id())
        with check (teacher_id = public.my_teacher_id());
    $f$, t, t);
  end loop;
end $$;

-- Audit logs: same shape (read-only for tenant).
create policy audit_logs_tenant_read on audit_logs for select
  using (
    teacher_id = public.my_teacher_id()
    or public.is_super_admin()
  );

-- ============ STUDENT-SIDE READ POLICIES (now non-recursive) ============

-- Student can read their own student row(s).
create policy students_self_read on students for select
  using (user_id = auth.uid());

-- Student can read teacher minimal data for the teacher they belong to.
create policy teachers_student_read on teachers for select
  using (id = ANY(public.my_student_teacher_ids()));

-- Student can read their own attendance records.
create policy attendance_self_read on attendance for select
  using (student_id = ANY(public.my_student_ids()));

-- Student can read their own payment records.
create policy payments_self_read on payments for select
  using (student_id = ANY(public.my_student_ids()));

-- Student can read their own group memberships.
create policy student_groups_self_read on student_groups for select
  using (student_id = ANY(public.my_student_ids()));

-- Student can read sessions for groups they're in.
create policy sessions_self_read on sessions for select
  using (group_id = ANY(public.my_student_group_ids()));

-- Student can read groups they're in.
create policy groups_self_read on groups for select
  using (id = ANY(public.my_student_group_ids()));

-- Student can read exams targeting their groups.
create policy exams_self_read on exams for select
  using (
    exists (
      select 1 from exam_targets et
      where et.exam_id = exams.id
        and et.target_type = 'group'
        and et.target_id = ANY(public.my_student_group_ids())
    )
  );

-- Student can read their own exam submissions.
create policy exam_subs_self_read on exam_submissions for select
  using (student_id = ANY(public.my_student_ids()));

-- Student can read their own offline grades.
create policy offline_grades_self_read on offline_grades for select
  using (student_id = ANY(public.my_student_ids()));
