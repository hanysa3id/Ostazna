-- 0006_push_subs.sql — Web Push subscriptions per teacher.

create table push_subscriptions (
  id          uuid primary key default uuid_generate_v4(),
  teacher_id  uuid not null references teachers on delete cascade,
  endpoint    text not null,
  p256dh      text not null,
  auth        text not null,
  user_agent  text,
  created_at  timestamptz default now(),
  unique (teacher_id, endpoint)
);
create index push_subs_teacher_idx on push_subscriptions (teacher_id);

alter table push_subscriptions enable row level security;
create policy push_subs_owner_all on push_subscriptions for all
  using (teacher_id in (select id from teachers where user_id = auth.uid()))
  with check (teacher_id in (select id from teachers where user_id = auth.uid()));

-- Per-user notification reads (replaces the 24h proxy).
create table notification_reads (
  id              uuid primary key default uuid_generate_v4(),
  notification_id uuid not null references notifications on delete cascade,
  user_id         uuid not null references auth.users on delete cascade,
  read_at         timestamptz default now(),
  unique (notification_id, user_id)
);
create index notification_reads_user_idx on notification_reads (user_id, read_at desc);

alter table notification_reads enable row level security;
create policy notif_reads_self on notification_reads for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
