-- 0008_site_cms.sql
-- Super-Admin-managed marketing site CMS:
--   site_settings  — generic key/value store (hero copy, footer, etc.)
--   site_stats     — stat cards on the homepage
--   site_hero_slides — multiple slides for the hero carousel
--   site_features  — feature cards + their internal /features/[slug] pages
--   site_testimonials — quoted reviews with avatars
--   site_faqs      — FAQ accordion items
--   site_pages     — generic CMS pages added by admin (slug-based routes)
--
-- All tables are publicly readable (the site is public). Only super_admin can write.

-- ============ TABLES ============

create table site_settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_by  uuid references auth.users,
  updated_at  timestamptz default now()
);

create table site_hero_slides (
  id            uuid primary key default uuid_generate_v4(),
  badge         text,
  title         text not null,
  highlight     text,                     -- gradient-highlighted word
  subtitle      text,
  cta_label     text,
  cta_href      text,
  image_url     text,
  bg_gradient   text default 'aurora',    -- 'aurora' | 'cool' | custom CSS
  is_active     boolean not null default true,
  order_index   int not null default 0,
  created_at    timestamptz default now()
);

create table site_stats (
  id            uuid primary key default uuid_generate_v4(),
  label         text not null,
  value         integer not null,
  suffix        text,
  source        text check (source in ('manual','live_teachers','live_students','live_uptime')) default 'manual',
  is_active     boolean not null default true,
  order_index   int not null default 0
);

create table site_features (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,
  icon          text not null,            -- lucide icon name
  tone          text default 'from-primary-500 to-violet-500',
  title         text not null,
  short_body    text not null,            -- card description
  is_primary    boolean not null default true,  -- primary 4 cards vs secondary 8
  is_active     boolean not null default true,
  order_index   int not null default 0,

  -- Internal page content
  hero_subtitle  text,
  long_body      text,                    -- markdown / html long description
  highlights     jsonb default '[]'::jsonb,  -- [{title,desc,icon}]
  examples       jsonb default '[]'::jsonb,  -- [{title,desc,image_url}]
  faq            jsonb default '[]'::jsonb,  -- [{q,a}]
  cta_label      text default 'ابدأ مجاناً',
  cta_href       text default '/register',
  seo_title      text,
  seo_desc       text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create trigger site_features_updated before update on site_features
  for each row execute function set_updated_at();

create table site_testimonials (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  role        text,
  body        text not null,
  avatar_url  text,
  rating      int not null default 5,
  is_active   boolean not null default true,
  order_index int not null default 0,
  created_at  timestamptz default now()
);

create table site_faqs (
  id          uuid primary key default uuid_generate_v4(),
  question    text not null,
  answer      text not null,
  is_active   boolean not null default true,
  order_index int not null default 0
);

create table site_pages (
  id           uuid primary key default uuid_generate_v4(),
  slug         text unique not null,
  title        text not null,
  hero_kicker  text,
  body         text not null default '',  -- HTML
  is_published boolean not null default false,
  show_in_nav  boolean not null default false,
  seo_title    text,
  seo_desc     text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create trigger site_pages_updated before update on site_pages
  for each row execute function set_updated_at();

-- ============ RLS ============
alter table site_settings    enable row level security;
alter table site_hero_slides enable row level security;
alter table site_stats       enable row level security;
alter table site_features    enable row level security;
alter table site_testimonials enable row level security;
alter table site_faqs        enable row level security;
alter table site_pages       enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'site_settings','site_hero_slides','site_stats','site_features',
    'site_testimonials','site_faqs','site_pages'
  ] loop
    execute format('create policy %I_public_read on %I for select using (true)', t, t);
    execute format($f$
      create policy %I_admin_write on %I for all
        using ((auth.jwt() ->> 'role') = 'super_admin')
        with check ((auth.jwt() ->> 'role') = 'super_admin');
    $f$, t, t);
  end loop;
end $$;

-- ============ DEFAULT SEED ============

insert into site_settings (key, value) values
  ('hero', jsonb_build_object(
    'autoplay_ms', 5500,
    'show_indicators', true
  )),
  ('site', jsonb_build_object(
    'tagline', 'منصة المدرس الأولى في مصر',
    'support_email', 'support@ostazna.com',
    'social', jsonb_build_object('facebook','#','youtube','#','instagram','#','twitter','#')
  ))
on conflict (key) do nothing;

insert into site_hero_slides (badge, title, highlight, subtitle, cta_label, cta_href, bg_gradient, order_index) values
  ('منصة المدرس الأولى في مصر · مجانية للبدء',
   'إدارة أعمالك التعليمية باحترافية ومن مكان واحد',
   'باحترافية',
   'منصة متكاملة لإدارة الطلاب، الجدول، الحضور والمالية — مصممة خصيصاً للمدرس المصري.',
   'ابدأ مجاناً', '/register', 'aurora', 1),
  ('جديد · موقعك الشخصي مع كل خطة',
   'لكل مدرس موقعه الإحترافي الخاص',
   'الإحترافي',
   'Subdomain تلقائي + نظام إدارة محتوى + ثيم بألوانك ولوغوك. ينطلق فوراً.',
   'استكشف الميزة', '/features/cms', 'cool', 2),
  ('وفّر ساعات شهرياً',
   'أدوات مالية تتعقّب كل قرش',
   'كل قرش',
   'تسجيل المدفوعات، تنبيهات للمتأخرين، فواتير PDF احترافية، وتقارير بصرية.',
   'تعرف على الميزة', '/features/finance', 'aurora', 3);

insert into site_stats (label, value, suffix, source, order_index) values
  ('مدرس مستخدم',  500,  '+',   'live_teachers', 1),
  ('طالب نشط',    25000, '+',   'live_students', 2),
  ('وقت تشغيل',     99,  '%',   'live_uptime',   3),
  ('دعم فني',       24,  '/٧',  'manual',        4);

insert into site_features (slug, icon, tone, title, short_body, is_primary, order_index,
                            hero_subtitle, long_body, highlights, examples, cta_label) values

  ('students', 'GraduationCap', 'from-primary-500 to-violet-500',
   'إدارة الطلاب', 'ملف كامل لكل طالب، مجموعات، حقول مخصصة، وأرشفة آمنة.',
   true, 1,
   'تعرّف على نظام إدارة الطلاب الأقوى في المنصة',
   'إدارة شاملة لكل طالب بدءاً من البيانات الأساسية مروراً بالتعيينات في المجموعات، الحضور، المدفوعات، حتى الأرشفة الآمنة. مع استيراد جماعي عبر CSV لتوفير ساعات من الإدخال اليدوي.',
   '[
     {"title":"ملفات شاملة","desc":"بيانات الطالب، ولي الأمر، الحقول المخصصة، الصور","icon":"User"},
     {"title":"استيراد جماعي","desc":"رفع 500 طالب في دقيقة عبر CSV","icon":"Upload"},
     {"title":"بحث وفلترة","desc":"بحث فوري بالاسم، فلتر بالمجموعة أو الحالة","icon":"Search"},
     {"title":"أرشفة آمنة","desc":"احتفظ بسجلات الطلاب القدامى دون فقدها","icon":"Archive"}
   ]'::jsonb,
   '[
     {"title":"بطاقة الطالب الكاملة","desc":"كل بياناته في صفحة واحدة: الحضور، المدفوعات، الدرجات، المجموعات."},
     {"title":"استيراد بضغطة","desc":"حمّل ملف CSV من Excel وستُضاف كل الطلاب فوراً مع التحقق."}
   ]'::jsonb,
   'جرّب إدارة الطلاب مجاناً'),

  ('schedule', 'CalendarClock', 'from-cyan-500 to-primary-500',
   'جدول ذكي', 'حصص متكررة وأخرى استثنائية، مع تذكيرات تلقائية.',
   true, 2,
   'جدولك الأسبوعي يدير نفسه',
   'أنشئ جدولك الأسبوعي مرة واحدة، وستتولّد الحصص تلقائياً لمدة 90 يوم قادمة. مع عرض أسبوعي/يومي، طباعة A4 احترافية، وإشعارات قبل كل حصة.',
   '[
     {"title":"حصص متكررة","desc":"حدّد المواعيد مرة، تتولّد كل أسبوع تلقائياً","icon":"Repeat"},
     {"title":"عرض أسبوعي","desc":"شبكة 7 أيام واضحة مع ألوان لكل مجموعة","icon":"LayoutGrid"},
     {"title":"طباعة احترافية","desc":"اطبع جدولك بـ A4 landscape مع لوغوك","icon":"Printer"},
     {"title":"تذكيرات ذكية","desc":"إشعار قبل الحصة بالوقت اللي تحدده","icon":"Bell"}
   ]'::jsonb,
   '[
     {"title":"تعديل لحظي","desc":"غيّر موعد حصة بسحب وإفلات (قريباً)."},
     {"title":"حصص استثنائية","desc":"أضف مراجعة عاجلة بدون التأثير على الجدول الثابت."}
   ]'::jsonb,
   'جرّب الجدول الذكي'),

  ('finance', 'Wallet', 'from-accent-500 to-cyan-500',
   'الإدارة المالية', 'تتبع المدفوعات، تنبيهات للمتأخرين، تقارير شهرية.',
   true, 3,
   'تحكّم كامل في مالية مركزك',
   'سجّل كل دفعة، تابع الإيرادات الشهرية، أصدر فواتير PDF احترافية، واستلم تنبيهات تلقائية بالطلاب المتأخرين مع روابط واتساب جاهزة لإرسال التذكير.',
   '[
     {"title":"تسجيل مرن","desc":"نقدي / تحويل / محفظة، مع فترات مخصصة","icon":"Wallet"},
     {"title":"تنبيهات للمتأخرين","desc":"قائمة فورية + روابط واتساب جاهزة","icon":"AlertTriangle"},
     {"title":"فواتير PDF","desc":"بترقيم تلقائي وشعارك","icon":"FileText"},
     {"title":"مصروفات وأرباح","desc":"تتبع كامل للمصروفات + صافي الربح","icon":"TrendingUp"}
   ]'::jsonb,
   '[
     {"title":"تذكير ذكي","desc":"اضغط زر — سيُفتح واتساب تلقائياً برسالة جاهزة بالعربية."},
     {"title":"فواتير لحظية","desc":"اختر الطالب والبنود، الفاتورة جاهزة بـ PDF."}
   ]'::jsonb,
   'ابدأ تتبع ماليتك'),

  ('cms', 'Globe', 'from-violet-500 to-primary-700',
   'موقعك الشخصي', 'Subdomain تلقائي + CMS + ثيم بألوانك ولوغوك.',
   true, 4,
   'موقع احترافي بدون أي معرفة تقنية',
   'كل مدرس يحصل على موقعه الخاص فور التسجيل: name.ostazna.com مع نظام إدارة محتوى كامل، Theme Builder بألوانك، صفحات قابلة للتخصيص، وحتى دومين خاص في خطة Premium.',
   '[
     {"title":"Subdomain فوري","desc":"name.ostazna.com جاهز خلال ثوانٍ","icon":"Globe"},
     {"title":"Theme Builder","desc":"ألوان، خطوط، شعار — كله بضغطة","icon":"Palette"},
     {"title":"صفحات مرنة","desc":"أضف صفحات حسب احتياجك","icon":"FileText"},
     {"title":"دومين مخصص","desc":"اربط دومينك الخاص بسهولة","icon":"Link"}
   ]'::jsonb,
   '[
     {"title":"معرض إنجازاتك","desc":"اعرض شهاداتك وتفوقات طلابك."},
     {"title":"نموذج تواصل","desc":"يستقبل استفسارات الطلاب الجدد مباشرة."}
   ]'::jsonb,
   'أنشئ موقعك الآن');

insert into site_features (slug, icon, tone, title, short_body, is_primary, order_index) values
  ('students-mgmt', 'Users',         'from-primary-500 to-violet-500', 'إدارة طلاب لا متناهية', 'حتى 500 طالب مع ملفات كاملة وحقول مخصصة.', false, 5),
  ('schedule-auto', 'CalendarClock', 'from-cyan-500 to-primary-500',   'جدول ذكي ومتكرر',     'حصص أسبوعية تُولَّد تلقائياً + إشعارات.',     false, 6),
  ('payments-pro',  'Wallet',        'from-accent-500 to-cyan-500',    'مدفوعات متقدّمة',       'تتبع، تنبيهات، فواتير PDF بشعارك.',           false, 7),
  ('invoices',      'FileText',      'from-secondary-500 to-accent-500','فواتير رسمية',        'إصدار وطباعة فواتير احترافية مرقّمة.',         false, 8),
  ('notifications', 'Bell',          'from-violet-500 to-primary-500',  'إشعارات وتذكيرات',    'داخل المنصة + Web Push + روابط واتساب.',       false, 9),
  ('reports',       'BarChart3',     'from-cyan-500 to-violet-500',     'تقارير وتحليلات',     'رسوم بيانية للإيرادات والحضور والأداء.',       false, 10),
  ('your-site',     'Globe',         'from-primary-500 to-cyan-500',    'موقعك الشخصي',         'Subdomain تلقائي + CMS + ثيم.',              false, 11),
  ('security',      'ShieldCheck',   'from-accent-500 to-primary-500',  'أمان من الطراز الأول', 'RLS لكل جدول + 2FA + نسخ احتياطي يومي.',     false, 12);

insert into site_testimonials (name, role, body, avatar_url, rating, order_index) values
  ('أ. أحمد محمد',  'مدرس فيزياء — القاهرة',
   'وفرت عليّ ساعات من المحاسبة اليدوية. التقارير عبقرية، والتنبيهات للمتأخرين رفعت تحصيلي بنسبة 40%!',
   'https://i.pravatar.cc/200?img=14', 5, 1),
  ('أ. سارة عبد الله', 'مدرسة لغة عربية — المنصورة',
   'الموقع الشخصي نقلة حقيقية. أهالي طلابي بياخدوني بجدية أكبر، والتسجيل في مجموعاتي زاد طبيعياً.',
   'https://i.pravatar.cc/200?img=47', 5, 2),
  ('أ. محمد خالد', 'مدرس كيمياء — الإسكندرية',
   'تذكيرات الواتساب وفّرت لي 40% من المتأخرات. شيء لا يصدق فعلاً، أصبحت أركز على التدريس بدل المتابعة.',
   'https://i.pravatar.cc/200?img=33', 5, 3),
  ('أ. منى السيد', 'مدرسة رياضيات — أسيوط',
   'استيراد الطلاب بـ CSV وفّر علي يومين كاملين. والتقارير الشهرية ساعدتني أفهم نمو نشاطي.',
   'https://i.pravatar.cc/200?img=23', 5, 4),
  ('أ. كريم فؤاد', 'مدرس إنجليزي — الجيزة',
   'بوابة الطالب وحدها تستحق الاشتراك. الأهالي مبسوطين جداً وبيتابعوا أداء أبنائهم لحظة بلحظة.',
   'https://i.pravatar.cc/200?img=51', 5, 5),
  ('أ. هدى حسن', 'مدرسة أحياء — طنطا',
   'منصة عربية بمستوى عالمي. الدعم الفني سريع جداً، والتحديثات المستمرة تخليني أحس إن صوتي مسموع.',
   'https://i.pravatar.cc/200?img=45', 5, 6);

insert into site_faqs (question, answer, order_index) values
  ('هل أحتاج بطاقة ائتمان للبدء؟', 'لا. الخطة المجانية حتى 20 طالب بدون أي بطاقة، وبدون حد زمني.', 1),
  ('هل بياناتي آمنة؟', 'بياناتك معزولة تماماً عن المدرسين الآخرين عبر Row Level Security، ومخزّنة في خوادم أوروبية متوافقة مع GDPR.', 2),
  ('كيف يحصل الطلاب على حساباتهم؟', 'يسجّلون عبر رابط دعوة منك، ثم تربط حساباتهم ببياناتك من ضغطة زر.', 3),
  ('هل يدعم الموبايل؟', 'نعم، PWA كاملة قابلة للتثبيت كتطبيق على الموبايل، مع إشعارات Push.', 4),
  ('هل يمكنني استرجاع اشتراكي؟', 'استرجاع كامل خلال 7 أيام، ونسبي بعدها. اقرأ سياسة الاسترجاع.', 5);
