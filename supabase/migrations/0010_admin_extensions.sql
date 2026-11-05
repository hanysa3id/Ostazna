-- 0010_admin_extensions.sql
-- Extends the schema for the Super Admin's full management surface:
--   - addons        : standalone modules teachers can buy individually
--   - teacher_addons: which add-ons each teacher has activated
--   - platform_settings : key/value store for global platform config

create table addons (
  id              uuid primary key default uuid_generate_v4(),
  key             text unique not null,                -- 'invoices' | 'exams' | ...
  name_ar         text not null,
  name_en         text,
  description_ar  text,
  price_egp       integer not null default 0,
  is_active       boolean not null default true,
  icon            text,
  created_at      timestamptz default now()
);

create table teacher_addons (
  id            uuid primary key default uuid_generate_v4(),
  teacher_id    uuid not null references teachers on delete cascade,
  addon_id      uuid not null references addons on delete cascade,
  active_from   date not null default current_date,
  active_until  date,                                  -- null = permanent
  granted_by    uuid references auth.users,
  notes         text,
  created_at    timestamptz default now(),
  unique (teacher_id, addon_id)
);
create index teacher_addons_teacher_idx on teacher_addons (teacher_id);
create index teacher_addons_addon_idx on teacher_addons (addon_id);

create table platform_settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  description text,
  updated_by  uuid references auth.users,
  updated_at  timestamptz default now()
);

-- ============ RLS ============
alter table addons            enable row level security;
alter table teacher_addons    enable row level security;
alter table platform_settings enable row level security;

-- addons: public read, admin write
create policy addons_public_read on addons for select using (true);
create policy addons_admin_write on addons for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- teacher_addons: teacher reads own, admin all
create policy teacher_addons_self_read on teacher_addons for select
  using (teacher_id in (select id from teachers where user_id = auth.uid())
         or public.is_super_admin());
create policy teacher_addons_admin_write on teacher_addons for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- platform_settings: public read certain keys, admin all
create policy platform_settings_public_read on platform_settings for select using (true);
create policy platform_settings_admin_write on platform_settings for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- Add updated_at trigger
create trigger addons_updated before update on platform_settings
  for each row execute function set_updated_at();

-- ============ SEED ============
insert into addons (key, name_ar, description_ar, price_egp, icon) values
  ('invoices',       'الفواتير الرسمية', 'إصدار وطباعة فواتير PDF احترافية مرقّمة لكل طالب.', 100, 'FileText'),
  ('exams',          'الاختبارات الإلكترونية', 'إنشاء ونشر اختبارات أونلاين مع تصحيح تلقائي.', 150, 'FileQuestion'),
  ('whatsapp',       'تكامل واتساب', 'سقف رسائل أعلى عبر روابط wa.me.', 80, 'MessageCircle'),
  ('parent_portal',  'بوابة ولي الأمر', 'حساب منفصل لولي الأمر يتابع أبناءه.', 120, 'Users'),
  ('assistant',      'حساب المساعد', 'حساب سكرتارية بصلاحيات مخصصة.', 200, 'UserCog'),
  ('advanced_reports','التقارير المتقدمة', 'Charts + تحليلات متعمقة بصرية.', 100, 'BarChart3'),
  ('theme_builder',  'Theme Builder', 'بناء ثيمات مخصصة كاملة لموقعك.', 80, 'Palette'),
  ('blog',           'المدونة + الصفحات المخصصة', 'CMS متقدم لصفحات إضافية ومقالات.', 80, 'FileEdit')
on conflict (key) do nothing;

insert into platform_settings (key, value, description) values
  ('payment_methods', '{
    "cash": {"enabled": true, "label": "نقدي / تحويل يدوي"},
    "bank":  {"enabled": true, "label": "تحويل بنكي", "iban": "EG00 0000 0000 0000"},
    "wallet":{"enabled": true, "label": "محفظة إلكترونية", "number": "01012345678"},
    "instructions_ar": "بعد التحويل، أرسل صورة الإيصال على واتساب الدعم للتفعيل."
  }'::jsonb, 'طرق الدفع المتاحة للاشتراك'),

  ('whatsapp_caps', '{
    "free": 50, "basic": 200, "pro": 1000, "premium": null
  }'::jsonb, 'سقف رسائل واتساب الشهرية لكل خطة'),

  ('platform_branding', '{
    "support_email": "support@ostazna.com",
    "support_phone": "+201000000000",
    "support_whatsapp": "201000000000"
  }'::jsonb, 'بيانات تواصل المنصة'),

  ('email_templates', '{
    "welcome_subject": "أهلاً بك في أستاذنا",
    "trial_ending_days": [7, 3, 1]
  }'::jsonb, 'قوالب الإيميلات والتذكيرات')
on conflict (key) do nothing;
