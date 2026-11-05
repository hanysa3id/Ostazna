-- 0004_phase2_3_schema.sql
-- Phase 2 + 3 tables: expenses, invoices, notifications, cms_pages, cms_settings,
-- exams, exam_targets, questions, exam_submissions, offline_grades,
-- parents, parent_students, assistants, plus their RLS policies and audit triggers.

-- =============================== ENUMS ===============================
create type invoice_status as enum ('draft','issued','paid','cancelled');
create type exam_status as enum ('draft','published','closed');
create type exam_visibility as enum ('groups','grades','all');
create type question_type as enum ('mcq','true_false','fill_blank','short_answer','essay','image_upload');
create type notification_channel as enum ('in_app','push','whatsapp','email');
create type notification_status as enum ('pending','sent','failed');
create type notification_target as enum ('student','group','grade','parent','all');
create type cms_page_type as enum ('home','about','contact','gallery','blog','custom');

-- =============================== EXPENSE CATEGORIES ===============================
create table expense_categories (
  id          uuid primary key default uuid_generate_v4(),
  teacher_id  uuid not null references teachers on delete cascade,
  name        text not null,
  color       text,
  icon        text,
  created_at  timestamptz default now(),
  unique (teacher_id, name)
);

-- =============================== EXPENSES ===============================
create table expenses (
  id            uuid primary key default uuid_generate_v4(),
  teacher_id    uuid not null references teachers on delete cascade,
  category_id   uuid references expense_categories on delete set null,
  amount        numeric(10,2) not null check (amount > 0),
  description   text,
  expense_date  date not null,
  receipt_url   text,
  created_at    timestamptz default now()
);
create index expenses_teacher_date_idx on expenses (teacher_id, expense_date desc);

-- =============================== INVOICES ===============================
create table invoices (
  id              uuid primary key default uuid_generate_v4(),
  teacher_id      uuid not null references teachers on delete cascade,
  student_id      uuid not null references students on delete cascade,
  invoice_number  text not null,
  amount          numeric(10,2) not null check (amount > 0),
  issued_at       timestamptz default now(),
  due_date        date,
  status          invoice_status not null default 'draft',
  items           jsonb not null default '[]'::jsonb,
  pdf_url         text,
  notes           text,
  created_at      timestamptz default now(),
  unique (teacher_id, invoice_number)
);
create index invoices_teacher_idx on invoices (teacher_id, issued_at desc);

-- Add foreign key for payments.invoice_id (deferred from migration 0001)
alter table payments
  add constraint payments_invoice_fk
  foreign key (invoice_id) references invoices(id) on delete set null;

-- =============================== NOTIFICATIONS ===============================
create table notifications (
  id            uuid primary key default uuid_generate_v4(),
  teacher_id    uuid not null references teachers on delete cascade,
  target_type   notification_target not null,
  target_ids    uuid[] not null default '{}',
  title         text not null,
  body          text not null,
  channel       notification_channel not null default 'in_app',
  status        notification_status not null default 'pending',
  scheduled_at  timestamptz,
  sent_at       timestamptz,
  read_by       uuid[] not null default '{}',
  created_at    timestamptz default now()
);
create index notifications_teacher_idx on notifications (teacher_id, created_at desc);

-- =============================== CMS ===============================
create table cms_pages (
  id            uuid primary key default uuid_generate_v4(),
  teacher_id    uuid not null references teachers on delete cascade,
  slug          text not null,
  title_ar      text not null,
  title_en      text,
  content_ar    jsonb not null default '[]'::jsonb,
  content_en    jsonb not null default '[]'::jsonb,
  page_type     cms_page_type not null default 'custom',
  is_published  boolean not null default false,
  seo_meta      jsonb not null default '{}'::jsonb,
  order_index   int not null default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique (teacher_id, slug)
);

create trigger cms_pages_updated_at before update on cms_pages
  for each row execute function set_updated_at();

create table cms_settings (
  id            uuid primary key default uuid_generate_v4(),
  teacher_id    uuid not null unique references teachers on delete cascade,
  logo_url      text,
  favicon_url   text,
  theme_config  jsonb not null default jsonb_build_object(
                  'primary', '#1E3A5F',
                  'secondary', '#F5A623',
                  'accent', '#2ECC71',
                  'font_ar', 'Noto Kufi Arabic',
                  'font_en', 'Plus Jakarta Sans'
                ),
  sliders       jsonb not null default '[]'::jsonb,
  social_links  jsonb not null default '{}'::jsonb,
  contact_info  jsonb not null default '{}'::jsonb,
  custom_css    text,
  updated_at    timestamptz default now()
);

create trigger cms_settings_updated_at before update on cms_settings
  for each row execute function set_updated_at();

-- =============================== EXAMS ===============================
create table exams (
  id            uuid primary key default uuid_generate_v4(),
  teacher_id    uuid not null references teachers on delete cascade,
  title         text not null,
  description   text,
  duration_minutes int not null default 60,
  total_marks   int not null default 100,
  pass_marks    int not null default 50,
  starts_at     timestamptz,
  ends_at       timestamptz,
  visibility    exam_visibility not null default 'groups',
  status        exam_status not null default 'draft',
  settings      jsonb not null default '{}'::jsonb,
  created_at    timestamptz default now()
);
create index exams_teacher_idx on exams (teacher_id, created_at desc);

-- Replaces the original `target_ids uuid[]` column with a proper join table.
create table exam_targets (
  id          uuid primary key default uuid_generate_v4(),
  teacher_id  uuid not null references teachers on delete cascade,
  exam_id     uuid not null references exams on delete cascade,
  target_type notification_target not null check (target_type in ('group','grade')),
  target_id   uuid not null,
  unique (exam_id, target_type, target_id)
);
create index exam_targets_exam_idx on exam_targets (exam_id);

create table questions (
  id                  uuid primary key default uuid_generate_v4(),
  teacher_id          uuid not null references teachers on delete cascade,
  exam_id             uuid not null references exams on delete cascade,
  type                question_type not null,
  question_text       text not null,
  question_image_url  text,
  options             jsonb,
  correct_answer      jsonb,
  marks               int not null default 1,
  order_index         int not null default 0
);
create index questions_exam_idx on questions (exam_id, order_index);

create table exam_submissions (
  id            uuid primary key default uuid_generate_v4(),
  teacher_id    uuid not null references teachers on delete cascade,
  exam_id       uuid not null references exams on delete cascade,
  student_id    uuid not null references students on delete cascade,
  answers       jsonb not null default '{}'::jsonb,
  score         numeric(10,2),
  submitted_at  timestamptz,
  graded_at     timestamptz,
  graded_by     uuid references auth.users,
  unique (exam_id, student_id)
);
create index exam_submissions_exam_idx on exam_submissions (exam_id);

create table offline_grades (
  id          uuid primary key default uuid_generate_v4(),
  teacher_id  uuid not null references teachers on delete cascade,
  student_id  uuid not null references students on delete cascade,
  exam_title  text not null,
  score       numeric(10,2) not null,
  total_marks numeric(10,2) not null,
  exam_date   date not null,
  notes       text,
  created_at  timestamptz default now()
);
create index offline_grades_student_idx on offline_grades (student_id, exam_date desc);

-- =============================== PARENTS ===============================
create table parents (
  id          uuid primary key default uuid_generate_v4(),
  teacher_id  uuid not null references teachers on delete cascade,
  user_id     uuid references auth.users on delete set null,
  name        text not null,
  email       citext,
  phone       text,
  consent_at  timestamptz,
  created_at  timestamptz default now()
);
create index parents_teacher_idx on parents (teacher_id);

create table parent_students (
  id          uuid primary key default uuid_generate_v4(),
  teacher_id  uuid not null references teachers on delete cascade,
  parent_id   uuid not null references parents on delete cascade,
  student_id  uuid not null references students on delete cascade,
  unique (parent_id, student_id)
);

-- =============================== ASSISTANTS ===============================
create table assistants (
  id           uuid primary key default uuid_generate_v4(),
  teacher_id   uuid not null references teachers on delete cascade,
  user_id      uuid not null references auth.users on delete cascade,
  name         text not null,
  email        citext not null,
  permissions  jsonb not null default '{}'::jsonb,
  is_active    boolean not null default true,
  created_at   timestamptz default now(),
  unique (teacher_id, user_id)
);

-- =============================== AUDIT TRIGGERS ===============================
create trigger _audit after insert or update or delete on expenses
  for each row execute function audit_trigger();
create trigger _audit after insert or update or delete on invoices
  for each row execute function audit_trigger();
create trigger _audit after insert or update or delete on notifications
  for each row execute function audit_trigger();
create trigger _audit after insert or update or delete on cms_pages
  for each row execute function audit_trigger();
create trigger _audit after insert or update or delete on exams
  for each row execute function audit_trigger();
create trigger _audit after insert or update or delete on exam_submissions
  for each row execute function audit_trigger();
create trigger _audit after insert or update or delete on parents
  for each row execute function audit_trigger();
create trigger _audit after insert or update or delete on assistants
  for each row execute function audit_trigger();

-- =============================== RLS ===============================
alter table expense_categories enable row level security;
alter table expenses           enable row level security;
alter table invoices           enable row level security;
alter table notifications      enable row level security;
alter table cms_pages          enable row level security;
alter table cms_settings       enable row level security;
alter table exams              enable row level security;
alter table exam_targets       enable row level security;
alter table questions          enable row level security;
alter table exam_submissions   enable row level security;
alter table offline_grades     enable row level security;
alter table parents            enable row level security;
alter table parent_students    enable row level security;
alter table assistants         enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'expense_categories','expenses','invoices','notifications','cms_pages','cms_settings',
    'exams','exam_targets','questions','exam_submissions','offline_grades',
    'parents','parent_students','assistants'
  ] loop
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

-- Public CMS read (subdomain visitors are anonymous).
drop policy if exists cms_pages_tenant_read on cms_pages;
create policy cms_pages_public_read on cms_pages for select
  using (is_published = true);
create policy cms_pages_owner_read on cms_pages for select
  using (teacher_id in (select id from teachers where user_id = auth.uid()));

drop policy if exists cms_settings_tenant_read on cms_settings;
create policy cms_settings_public_read on cms_settings for select using (true);
create policy cms_settings_owner_write on cms_settings for all
  using (teacher_id in (select id from teachers where user_id = auth.uid()))
  with check (teacher_id in (select id from teachers where user_id = auth.uid()));
