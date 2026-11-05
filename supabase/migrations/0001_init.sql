-- 0001_init.sql — Ostazna MVP schema
-- Creates: enums, plans, teachers, subscriptions, academic_years, grades, subjects,
-- groups, students, student_groups, sessions, attendance, payments, audit_logs, wa_send_log.
-- Plus RLS policies, audit triggers, seed plans, and the JWT teacher_id custom claim helper.

create extension if not exists "uuid-ossp";
create extension if not exists "citext";

-- ============================================================
-- ENUMS
-- ============================================================
create type subscription_status as enum ('trial','active','frozen','archived');
create type plan_tier           as enum ('free','basic','pro','premium');
create type session_status      as enum ('scheduled','completed','cancelled');
create type session_type        as enum ('recurring','custom','makeup');
create type attendance_status   as enum ('present','absent','late','excused');
create type payment_method      as enum ('cash','bank_transfer','wallet','other');
create type pricing_type        as enum ('per_session','monthly');
create type school_level        as enum ('primary','preparatory','secondary');

-- ============================================================
-- PLANS
-- ============================================================
create table plans (
  id              uuid primary key default uuid_generate_v4(),
  tier            plan_tier unique not null,
  name_ar         text not null,
  name_en         text not null,
  price_egp       integer not null,
  student_cap     integer,
  wa_cap_monthly  integer,
  bundled_addons  text[] not null default '{}',
  features        jsonb  not null default '{}'::jsonb,
  is_active       boolean not null default true,
  created_at      timestamptz default now()
);

insert into plans (tier, name_ar, name_en, price_egp, student_cap, wa_cap_monthly, bundled_addons) values
  ('free',    'مجاني',   'Free',    0,    20,  50,   '{}'),
  ('basic',   'أساسي',   'Basic',   300,  100, 200,  '{}'),
  ('pro',     'احترافي', 'Pro',     700,  500, 1000, array['invoices','advanced_reports','theme_builder']),
  ('premium', 'بريميوم', 'Premium', 1200, null, null, array['invoices','advanced_reports','theme_builder','exams','parent_portal','assistant','blog','whatsapp']);

-- ============================================================
-- TEACHERS
-- ============================================================
create table teachers (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null unique references auth.users on delete cascade,
  name_ar          text not null,
  name_en          text,
  email            citext not null unique,
  phone            text,
  avatar_url       text,
  subdomain        citext unique,
  custom_domain    citext unique,
  current_status   subscription_status not null default 'trial',
  current_plan_id  uuid references plans(id),
  timezone         text not null default 'Africa/Cairo',
  locale           text not null default 'ar',
  settings         jsonb not null default '{}'::jsonb,
  onboarded_at     timestamptz,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
create index teachers_status_idx on teachers (current_status);

create or replace function set_updated_at() returns trigger as $$
begin new.updated_at := now(); return new; end;
$$ language plpgsql;

create trigger teachers_updated_at before update on teachers
  for each row execute function set_updated_at();

-- ============================================================
-- SUBSCRIPTIONS (history)
-- ============================================================
create table subscriptions (
  id               uuid primary key default uuid_generate_v4(),
  teacher_id       uuid not null references teachers on delete cascade,
  plan_id          uuid not null references plans,
  status           subscription_status not null,
  starts_at        date not null,
  ends_at          date not null,
  amount_paid_egp  integer,
  payment_method   payment_method,
  confirmed_by     uuid references auth.users,
  notes            text,
  created_at       timestamptz default now()
);
create index subscriptions_teacher_idx on subscriptions (teacher_id, ends_at desc);

-- ============================================================
-- ACADEMIC YEARS
-- ============================================================
create table academic_years (
  id           uuid primary key default uuid_generate_v4(),
  teacher_id   uuid not null references teachers on delete cascade,
  name         text not null,
  start_date   date not null,
  end_date     date not null,
  is_current   boolean not null default false,
  created_at   timestamptz default now(),
  unique (teacher_id, name)
);
create unique index one_current_year_per_teacher
  on academic_years (teacher_id) where is_current;

-- ============================================================
-- GRADES
-- ============================================================
create table grades (
  id                uuid primary key default uuid_generate_v4(),
  teacher_id        uuid not null references teachers on delete cascade,
  academic_year_id  uuid not null references academic_years on delete cascade,
  name              text not null,
  level             school_level not null,
  created_at        timestamptz default now()
);
create index grades_teacher_year_idx on grades (teacher_id, academic_year_id);

-- ============================================================
-- SUBJECTS
-- ============================================================
create table subjects (
  id          uuid primary key default uuid_generate_v4(),
  teacher_id  uuid not null references teachers on delete cascade,
  name_ar     text not null,
  name_en     text,
  color       text,
  created_at  timestamptz default now(),
  unique (teacher_id, name_ar)
);

-- ============================================================
-- GROUPS
-- ============================================================
create table groups (
  id                 uuid primary key default uuid_generate_v4(),
  teacher_id         uuid not null references teachers on delete cascade,
  academic_year_id   uuid not null references academic_years on delete cascade,
  grade_id           uuid references grades on delete set null,
  subject_id         uuid references subjects on delete set null,
  name               text not null,
  max_students       integer,
  pricing            pricing_type not null default 'monthly',
  price_per_session  numeric(10,2),
  price_monthly      numeric(10,2),
  schedule           jsonb,
  archived_at        timestamptz,
  created_at         timestamptz default now()
);
create index groups_teacher_year_idx on groups (teacher_id, academic_year_id);

-- ============================================================
-- STUDENTS
-- ============================================================
create table students (
  id              uuid primary key default uuid_generate_v4(),
  teacher_id      uuid not null references teachers on delete cascade,
  user_id         uuid references auth.users on delete set null,
  name_ar         text not null,
  name_en         text,
  photo_url       text,
  date_of_birth   date,
  phone           text,
  parent_name     text,
  parent_phone    text,
  notes           text,
  custom_fields   jsonb not null default '{}'::jsonb,
  archived_at     timestamptz,
  created_at      timestamptz default now()
);
create index students_active_idx on students (teacher_id) where archived_at is null;

-- ============================================================
-- STUDENT_GROUPS
-- ============================================================
create table student_groups (
  id           uuid primary key default uuid_generate_v4(),
  teacher_id   uuid not null references teachers on delete cascade,
  student_id   uuid not null references students on delete cascade,
  group_id     uuid not null references groups on delete cascade,
  joined_at    timestamptz not null default now(),
  left_at      timestamptz,
  unique (student_id, group_id, joined_at)
);
create index sg_active_group_idx on student_groups (group_id) where left_at is null;
create index sg_active_student_idx on student_groups (student_id) where left_at is null;

-- ============================================================
-- SESSIONS
-- ============================================================
create table sessions (
  id                uuid primary key default uuid_generate_v4(),
  teacher_id        uuid not null references teachers on delete cascade,
  group_id          uuid references groups on delete cascade,
  student_id        uuid references students on delete cascade,
  title             text,
  scheduled_at      timestamptz not null,
  duration_minutes  integer not null default 60,
  type              session_type not null default 'recurring',
  status            session_status not null default 'scheduled',
  notes             text,
  created_at        timestamptz default now(),
  check (group_id is not null or student_id is not null)
);
create index sessions_teacher_when_idx on sessions (teacher_id, scheduled_at);
create index sessions_group_when_idx on sessions (group_id, scheduled_at);

-- ============================================================
-- ATTENDANCE
-- ============================================================
create table attendance (
  id           uuid primary key default uuid_generate_v4(),
  teacher_id   uuid not null references teachers on delete cascade,
  session_id   uuid not null references sessions on delete cascade,
  student_id   uuid not null references students on delete cascade,
  status       attendance_status not null,
  notes        text,
  recorded_by  uuid not null references auth.users,
  recorded_at  timestamptz default now(),
  unique (session_id, student_id)
);
create index attendance_teacher_when_idx on attendance (teacher_id, recorded_at);
create index attendance_student_idx on attendance (student_id);

-- ============================================================
-- PAYMENTS
-- ============================================================
create table payments (
  id                  uuid primary key default uuid_generate_v4(),
  teacher_id          uuid not null references teachers on delete cascade,
  student_id          uuid not null references students on delete cascade,
  amount              numeric(10,2) not null check (amount > 0),
  currency            text not null default 'EGP',
  payment_date        date not null,
  method              payment_method not null,
  period_from         date,
  period_to           date,
  notes               text,
  invoice_id          uuid, -- FK added in Phase 2
  created_by          uuid not null references auth.users,
  actor_assistant_id  uuid references auth.users,
  created_at          timestamptz default now()
);
create index payments_teacher_date_idx on payments (teacher_id, payment_date desc);
create index payments_student_date_idx on payments (student_id, payment_date desc);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
create table audit_logs (
  id           uuid primary key default uuid_generate_v4(),
  teacher_id   uuid references teachers on delete set null,
  actor_id     uuid references auth.users,
  actor_role   text,
  action       text not null,
  entity_type  text not null,
  entity_id    uuid,
  old_values   jsonb,
  new_values   jsonb,
  ip_address   inet,
  user_agent   text,
  created_at   timestamptz default now()
);
create index audit_logs_teacher_idx on audit_logs (teacher_id, created_at desc);
create index audit_logs_entity_idx  on audit_logs (entity_type, entity_id);

-- ============================================================
-- WHATSAPP SEND LOG (cap enforcement)
-- ============================================================
create table wa_send_log (
  id              uuid primary key default uuid_generate_v4(),
  teacher_id      uuid not null references teachers on delete cascade,
  recipient_phone text not null,
  template        text,
  sent_at         timestamptz default now()
);
create index wa_send_log_teacher_when_idx on wa_send_log (teacher_id, sent_at);

-- ============================================================
-- AUDIT TRIGGER
-- ============================================================
create or replace function audit_trigger() returns trigger
language plpgsql security definer set search_path = public, auth as $$
declare
  v_teacher uuid;
  v_entity  uuid;
begin
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

create trigger _audit after insert or update or delete on students
  for each row execute function audit_trigger();
create trigger _audit after insert or update or delete on groups
  for each row execute function audit_trigger();
create trigger _audit after insert or update or delete on sessions
  for each row execute function audit_trigger();
create trigger _audit after insert or update or delete on attendance
  for each row execute function audit_trigger();
create trigger _audit after insert or update or delete on payments
  for each row execute function audit_trigger();
create trigger _audit after insert or update or delete on subscriptions
  for each row execute function audit_trigger();
create trigger _audit after insert or update or delete on teachers
  for each row execute function audit_trigger();

-- ============================================================
-- RLS — enable + tenant policies
-- ============================================================
alter table teachers       enable row level security;
alter table subscriptions  enable row level security;
alter table academic_years enable row level security;
alter table grades         enable row level security;
alter table subjects       enable row level security;
alter table groups         enable row level security;
alter table students       enable row level security;
alter table student_groups enable row level security;
alter table sessions       enable row level security;
alter table attendance     enable row level security;
alter table payments       enable row level security;
alter table audit_logs     enable row level security;
alter table wa_send_log    enable row level security;
alter table plans          enable row level security;

-- Plans are publicly readable (pricing page)
create policy plans_public_read on plans for select using (true);
create policy plans_admin_write on plans for all
  using ((auth.jwt() ->> 'role') = 'super_admin')
  with check ((auth.jwt() ->> 'role') = 'super_admin');

-- Teachers row: teacher reads/updates own; admin all
create policy teachers_self_read   on teachers for select
  using (user_id = auth.uid() or (auth.jwt() ->> 'role') = 'super_admin');
create policy teachers_self_update on teachers for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy teachers_admin_all   on teachers for all
  using ((auth.jwt() ->> 'role') = 'super_admin')
  with check ((auth.jwt() ->> 'role') = 'super_admin');

-- Generic tenant pattern macro: applied below to each business table
do $$
declare
  t text;
begin
  foreach t in array array[
    'subscriptions','academic_years','grades','subjects','groups',
    'students','student_groups','sessions','attendance','payments','wa_send_log'
  ] loop
    execute format($f$
      create policy %I_tenant_read on %I for select
        using ( teacher_id = (auth.jwt() ->> 'teacher_id')::uuid
                or (auth.jwt() ->> 'role') = 'super_admin' );
    $f$, t, t);
    execute format($f$
      create policy %I_tenant_write on %I for all
        using ( teacher_id = (auth.jwt() ->> 'teacher_id')::uuid )
        with check ( teacher_id = (auth.jwt() ->> 'teacher_id')::uuid );
    $f$, t, t);
    execute format($f$
      create policy %I_admin_all on %I for all
        using ( (auth.jwt() ->> 'role') = 'super_admin' )
        with check ( (auth.jwt() ->> 'role') = 'super_admin' );
    $f$, t, t);
  end loop;
end $$;

-- Audit logs: read-only for teacher (own), full for admin, no client writes
create policy audit_logs_tenant_read on audit_logs for select
  using ( teacher_id = (auth.jwt() ->> 'teacher_id')::uuid
          or (auth.jwt() ->> 'role') = 'super_admin' );
create policy audit_logs_admin_write on audit_logs for all
  using ( (auth.jwt() ->> 'role') = 'super_admin' )
  with check ( (auth.jwt() ->> 'role') = 'super_admin' );

-- ============================================================
-- CUSTOM ACCESS TOKEN HOOK — injects teacher_id + role into JWT
-- Register this in Supabase dashboard → Auth → Hooks.
-- ============================================================
create or replace function public.add_custom_claims(event jsonb) returns jsonb
language plpgsql stable security definer set search_path = public, auth as $$
declare
  uid uuid := (event->>'user_id')::uuid;
  tid uuid;
  is_admin boolean;
  claims jsonb := coalesce(event->'claims', '{}'::jsonb);
begin
  select id into tid from teachers where user_id = uid;
  if tid is not null then
    claims := jsonb_set(claims, '{teacher_id}', to_jsonb(tid::text));
  end if;

  select coalesce((raw_app_meta_data ->> 'role') = 'super_admin', false)
    into is_admin from auth.users where id = uid;
  if is_admin then
    claims := jsonb_set(claims, '{role}', '"super_admin"');
  end if;

  return jsonb_set(event, '{claims}', claims);
end; $$;

grant execute on function public.add_custom_claims to supabase_auth_admin;
