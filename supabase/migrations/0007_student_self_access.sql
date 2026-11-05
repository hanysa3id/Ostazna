-- 0007_student_self_access.sql
-- Allow a student (auth.users row linked via students.user_id) to read their own
-- attendance, payments, sessions for their groups, and exam-related rows.

-- helper: returns true if the current user is the student row
create or replace function is_self_student(p_student_id uuid) returns boolean
language sql stable security invoker as $$
  select exists (select 1 from students where id = p_student_id and user_id = auth.uid());
$$;

create policy students_self_read on students for select
  using (user_id = auth.uid());

create policy attendance_self_read on attendance for select
  using (is_self_student(student_id));

create policy payments_self_read on payments for select
  using (is_self_student(student_id));

create policy student_groups_self_read on student_groups for select
  using (is_self_student(student_id));

-- Sessions: visible if the student is in that group.
create policy sessions_self_read on sessions for select
  using (
    group_id in (
      select sg.group_id from student_groups sg
      where sg.student_id in (select id from students where user_id = auth.uid())
        and sg.left_at is null
    )
  );

-- Exam submissions and offline grades.
create policy exam_subs_self_read on exam_submissions for select
  using (is_self_student(student_id));

create policy offline_grades_self_read on offline_grades for select
  using (is_self_student(student_id));

-- Exams visible to the student if they target a group the student belongs to.
create policy exams_self_read on exams for select
  using (
    exists (
      select 1 from exam_targets et
      where et.exam_id = exams.id
        and et.target_type = 'group'
        and et.target_id in (
          select sg.group_id from student_groups sg
          where sg.student_id in (select id from students where user_id = auth.uid())
            and sg.left_at is null
        )
    )
  );

-- Groups: a student can read groups they belong to (for the schedule join).
create policy groups_self_read on groups for select
  using (
    id in (
      select sg.group_id from student_groups sg
      where sg.student_id in (select id from students where user_id = auth.uid())
        and sg.left_at is null
    )
  );

-- Teachers row (read-only minimal): student can see their teacher's basic profile.
create policy teachers_student_read on teachers for select
  using (
    id in (select teacher_id from students where user_id = auth.uid())
  );
