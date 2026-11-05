-- 0003_schedule_helpers.sql
-- Helper SQL: recurring-session expansion + late-payer query.

-- ====================================================================
-- expand_recurring_sessions(p_teacher_id, p_horizon_days)
-- Materializes the next N days of recurring sessions for a teacher's groups.
-- Idempotent: skips slots that already have a sessions row.
--
-- groups.schedule format expected (jsonb):
-- {
--   "slots": [
--     { "weekday": 2, "time": "16:00", "duration_minutes": 90 },
--     ...
--   ]
-- }
-- weekday: 0=Sun ... 6=Sat (Postgres `extract(dow ...)` convention)
-- ====================================================================

create or replace function expand_recurring_sessions(
  p_teacher_id uuid,
  p_horizon_days int default 90
) returns int
language plpgsql security definer set search_path = public as $$
declare
  rec record;
  slot jsonb;
  d date;
  scheduled timestamptz;
  inserted int := 0;
begin
  for rec in
    select g.id, g.schedule, g.teacher_id
    from groups g
    where g.teacher_id = p_teacher_id
      and g.archived_at is null
      and g.schedule is not null
  loop
    if jsonb_typeof(rec.schedule -> 'slots') <> 'array' then
      continue;
    end if;

    for d in
      select generate_series(current_date, current_date + p_horizon_days, '1 day')::date
    loop
      for slot in select * from jsonb_array_elements(rec.schedule -> 'slots')
      loop
        if (slot->>'weekday')::int <> extract(dow from d)::int then
          continue;
        end if;
        scheduled := (d::text || ' ' || (slot->>'time') || ' Africa/Cairo')::timestamptz;

        insert into sessions (teacher_id, group_id, scheduled_at, duration_minutes, type, status)
        select rec.teacher_id, rec.id, scheduled,
               coalesce((slot->>'duration_minutes')::int, 60), 'recurring', 'scheduled'
        where not exists (
          select 1 from sessions s
          where s.group_id = rec.id and s.scheduled_at = scheduled
        );
        if found then inserted := inserted + 1; end if;
      end loop;
    end loop;
  end loop;
  return inserted;
end; $$;

grant execute on function expand_recurring_sessions(uuid, int) to authenticated, service_role;

-- ====================================================================
-- overdue_students_for_today(p_today)
-- Returns each active student in a monthly-priced group whose latest payment
-- (period_to) ended before today. RLS auto-scopes via teachers/students rows.
-- ====================================================================

create or replace function overdue_students_for_today(p_today date default current_date)
returns table (
  student_id uuid,
  name_ar text,
  parent_phone text,
  group_id uuid,
  group_name text,
  amount_due numeric,
  last_period_to date
)
language sql stable security invoker as $$
  with active as (
    select s.id as student_id, s.name_ar, s.parent_phone, sg.group_id, g.name as group_name,
           g.price_monthly as amount_due
    from students s
    join student_groups sg on sg.student_id = s.id and sg.left_at is null
    join groups g on g.id = sg.group_id
    where s.archived_at is null
      and g.pricing = 'monthly'
      and g.price_monthly is not null
  ),
  latest as (
    select p.student_id, max(p.period_to) as last_period_to
    from payments p
    group by p.student_id
  )
  select a.student_id, a.name_ar, a.parent_phone, a.group_id, a.group_name,
         a.amount_due, l.last_period_to
  from active a
  left join latest l on l.student_id = a.student_id
  where coalesce(l.last_period_to, '1900-01-01'::date) < p_today;
$$;

grant execute on function overdue_students_for_today(date) to authenticated;
