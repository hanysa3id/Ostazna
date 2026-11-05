<div dir="rtl">

# 🗄️ Database · قاعدة البيانات

## نظرة عامة

PostgreSQL 15 على Supabase Cloud. **30+ جدول** مقسّمة بـ `teacher_id` لـ multi-tenancy، مع Row Level Security على كل جدول حساس، و SECURITY DEFINER helper functions تجنّب recursion في الـ policies.

---

## 📋 الجداول الكاملة

### 1. الأساسيات (Phase 1 — Migration 0001)

| الجدول | الغرض | المفاتيح الأهم |
|--------|------|---------------|
| `plans` | خطط الاشتراك (Free / Basic / Pro / Premium) | `tier UNIQUE`, `student_cap`, `wa_cap_monthly` |
| `teachers` | حسابات المدرسين | `user_id UNIQUE`, `email UNIQUE`, `subdomain UNIQUE`, `current_status`, `current_plan_id`, `onboarded_at` |
| `subscriptions` | تاريخ الاشتراكات والتجديدات | `teacher_id`, `plan_id`, `status`, `starts_at`, `ends_at` |
| `academic_years` | السنوات الدراسية لكل مدرس | UNIQUE `(teacher_id, name)`, partial UNIQUE for `is_current` |
| `grades` | المراحل الدراسية | `academic_year_id`, `level` enum |
| `subjects` | المواد (lookup per-teacher) | UNIQUE `(teacher_id, name_ar)` |
| `groups` | المجموعات | `pricing` enum, `schedule` jsonb |
| `students` | الطلاب | `user_id` (optional auth link), `archived_at` (soft delete) |
| `student_groups` | عضوية الطلاب | `joined_at`, `left_at`، unique `(student_id, group_id, joined_at)` |
| `sessions` | الحصص (مولّدة من schedule أو يدوية) | `scheduled_at`, `status`, `type` enum |
| `attendance` | تسجيل الحضور | UNIQUE `(session_id, student_id)` للـ idempotent saves |
| `payments` | المدفوعات | `period_from/to`, `method` enum, `actor_assistant_id` |
| `audit_logs` | سجل كل العمليات | trigger-driven, never deleted |
| `wa_send_log` | عداد رسائل WhatsApp للسقف | `sent_at` |

### 2. Phase 2/3 (Migration 0004)

| الجدول | الغرض |
|--------|------|
| `expense_categories` | تصنيفات المصروفات لكل مدرس |
| `expenses` | المصروفات + رابط الإيصال |
| `invoices` | الفواتير الرسمية، مرقّمة per-teacher |
| `notifications` | الإشعارات داخل المنصة + WA |
| `cms_pages` | صفحات الـ subdomain للمدرس |
| `cms_settings` | الثيم + شعار المدرس |
| `exams` | الاختبارات الإلكترونية |
| `exam_targets` | join table (group/grade ↔ exam) |
| `questions` | أسئلة الاختبارات |
| `exam_submissions` | إجابات الطلاب |
| `offline_grades` | درجات الاختبارات الورقية |
| `parents` | حسابات أولياء الأمور |
| `parent_students` | join (parent ↔ students) |
| `assistants` | حسابات السكرتارية بصلاحيات granular |

### 3. Phase 4 (Migration 0006)

| الجدول | الغرض |
|--------|------|
| `push_subscriptions` | اشتراكات Web Push لكل مدرس |
| `notification_reads` | تتبع القراءة per-user |

### 4. Site CMS (Migration 0008)

| الجدول | الغرض |
|--------|------|
| `site_settings` | إعدادات عامة (key/value JSON) |
| `site_hero_slides` | شرائح الـ Hero Carousel |
| `site_stats` | الإحصائيات (manual أو live من DB) |
| `site_features` | بطاقات المزايا + صفحاتها الداخلية |
| `site_testimonials` | آراء العملاء بصور |
| `site_faqs` | الأسئلة الشائعة |
| `site_pages` | صفحات تسويقية مخصصة |

### 5. Admin (Migration 0010)

| الجدول | الغرض |
|--------|------|
| `addons` | الـ add-ons المنفصلة |
| `teacher_addons` | تفعيل add-on لمدرس |
| `platform_settings` | إعدادات المنصة (دفع، WA caps، branding) |

---

## 🔒 Row Level Security (RLS)

كل الجداول الحساسة مفعّل عليها RLS. النمط:

### Tenant tables (مدرس واحد لكل صف)

```sql
-- READ
create policy <table>_tenant_read on <table> for select
  using (
    teacher_id = public.my_teacher_id()
    or public.is_super_admin()
  );

-- WRITE (INSERT + UPDATE + DELETE)
create policy <table>_tenant_write on <table> for all
  using (teacher_id = public.my_teacher_id())
  with check (teacher_id = public.my_teacher_id());
```

### Helper Functions (SECURITY DEFINER — لا recursion)

```sql
-- يرجع teacher_id للمستخدم الحالي (NULL إذا غير مدرس)
create function public.my_teacher_id() returns uuid
language sql stable security definer set search_path = public, auth as $$
  select id from public.teachers where user_id = auth.uid() limit 1;
$$;

-- يرجع true إذا المستخدم super admin
create function public.is_super_admin() returns boolean
language sql stable security definer set search_path = public, auth as $$
  select coalesce(
    (auth.jwt() ->> 'role') = 'super_admin',
    (
      select (raw_app_meta_data ->> 'role') = 'super_admin'
      from auth.users where id = auth.uid()
    ),
    false
  );
$$;

-- helpers للطالب (يرجع UUID[])
create function public.my_student_ids() returns uuid[] ...
create function public.my_student_teacher_ids() returns uuid[] ...
create function public.my_student_group_ids() returns uuid[] ...
```

**لماذا SECURITY DEFINER؟** لتجنب RLS recursion: لو policy على `students` تستعلم من `teachers`، و policy على `teachers` تستعلم من `students` → infinite loop. الـ SECURITY DEFINER function تعمل بصلاحيات owner (postgres) فتتجاوز RLS تماماً.

### Audit Trigger

كل تعديل على الجداول الحساسة يكتب صف في `audit_logs` تلقائياً:

```sql
create function audit_trigger() returns trigger
language plpgsql security definer set search_path = public, auth as $$
begin
  perform set_config('row_security', 'off', true);  -- bypass RLS
  insert into audit_logs(teacher_id, actor_id, action, entity_type, entity_id, old_values, new_values)
  values (...);
  return coalesce(NEW, OLD);
end; $$;
```

مرفوع كـ AFTER trigger على: `teachers`, `students`, `groups`, `sessions`, `attendance`, `payments`, `subscriptions`, `expenses`, `invoices`, `exams`, `exam_submissions`, `parents`, `assistants`, `notifications`, `cms_pages`.

---

## 📜 الـ Migrations التاريخ

| # | الاسم | الغرض |
|---|------|------|
| `0001_init.sql` | الـ schema الأساسي + plans seed | إنشاء كل جداول الـ MVP + RLS أولي |
| `0002_resilient_rls.sql` | إصلاح RLS لتعتمد على subquery بدل JWT claim | تجنب الاعتماد على Custom Token Hook |
| `0003_schedule_helpers.sql` | `expand_recurring_sessions()` + `overdue_students_for_today()` | functions لتوليد الحصص + late-payer query |
| `0004_phase2_3_schema.sql` | جداول Phase 2 + 3 (CMS, exams, expenses, parents, assistants) | 14 جدول جديد |
| `0005_storage.sql` | إنشاء 4 buckets (avatars/logos/receipts/cms) + RLS | storage.path_teacher_id() helper |
| `0006_push_subs.sql` | Web Push subscriptions + per-user notification reads | |
| `0007_student_self_access.sql` | RLS تسمح للطلاب بقراءة بياناتهم الخاصة | |
| `0008_site_cms.sql` | Super Admin CMS schema (hero/stats/features/testimonials/faqs/pages) + seed | |
| `0009_cms_resilient_rls.sql` | `is_super_admin()` function + CMS write policies | |
| `0010_admin_extensions.sql` | addons + teacher_addons + platform_settings + seed | |
| `0011_backfill_onboarded_at.sql` | تحديث صفوف legacy لتعليم `onboarded_at` | |
| `0012_fix_rls_recursion.sql` | إصلاح infinite recursion عبر helper functions | |
| `0013_fix_audit_rls.sql` | audit trigger يتجاوز RLS + INSERT policy permissive | |
| `0014_fix_is_super_admin.sql` | تحويل `is_super_admin()` لـ SECURITY DEFINER | حل مشكلة "permission denied for table users" |

---

## 🗝️ الفهارس المهمة (Indexes)

```sql
-- استعلامات Dashboard المتكررة
create index sessions_teacher_when_idx on sessions (teacher_id, scheduled_at);
create index payments_teacher_date_idx on payments (teacher_id, payment_date desc);
create index attendance_teacher_when_idx on attendance (teacher_id, recorded_at);

-- قائمة الطلاب النشطين
create index students_active_idx on students (teacher_id) where archived_at is null;

-- استعلامات عضوية المجموعات
create index sg_active_group_idx on student_groups (group_id) where left_at is null;
create index sg_active_student_idx on student_groups (student_id) where left_at is null;

-- Subdomain lookup (hot path)
-- teachers.subdomain UNIQUE (auto index)
-- teachers.custom_domain UNIQUE (auto index)

-- Audit logs filters
create index audit_logs_teacher_idx on audit_logs (teacher_id, created_at desc);
create index audit_logs_entity_idx on audit_logs (entity_type, entity_id);
```

---

## 🔢 الـ Enums

```sql
subscription_status   = ('trial','active','frozen','archived')
plan_tier             = ('free','basic','pro','premium')
session_status        = ('scheduled','completed','cancelled')
session_type          = ('recurring','custom','makeup')
attendance_status     = ('present','absent','late','excused')
payment_method        = ('cash','bank_transfer','wallet','other')
pricing_type          = ('per_session','monthly')
school_level          = ('primary','preparatory','secondary')
invoice_status        = ('draft','issued','paid','cancelled')
exam_status           = ('draft','published','closed')
exam_visibility       = ('groups','grades','all')
question_type         = ('mcq','true_false','fill_blank','short_answer','essay','image_upload')
notification_channel  = ('in_app','push','whatsapp','email')
notification_status   = ('pending','sent','failed')
notification_target   = ('student','group','grade','parent','all')
cms_page_type         = ('home','about','contact','gallery','blog','custom')
```

---

## 💾 Backup Strategy

```bash
# scripts/backup.sh — يومياً عبر cron
pg_dump --format=custom $SUPABASE_DB_URL | restic backup --stdin --repo b2:ostazna-backups

# Retention
restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 6 --prune
```

**RTO target**: < 30 دقيقة لقاعدة بيانات ≤ 10 GB.
**Restore drill**: ربع سنوي (راجع `docs/runbooks/restore.md`).

---

## ⚙️ التعامل مع DB

### من Supabase CLI

```powershell
npx supabase link --project-ref <ref>
npx supabase db push                     # تطبيق migrations جديدة
npx supabase migration list --linked     # حالة migrations
npx supabase migration repair --status applied <version> --linked
npx supabase gen types typescript > lib/supabase/database.types.ts
```

### من سكربتاتنا

```powershell
npm run diagnose                         # فحص الجداول والصفوف والأدوار
npm run db:push                          # alias لـ supabase db push
npm run db:types                         # توليد TS types
npx tsx --env-file=.env.local scripts/apply-migration.ts <file.sql>
```

### من Supabase Dashboard

```
SQL Editor: https://supabase.com/dashboard/project/<ref>/sql/new
Tables:     https://supabase.com/dashboard/project/<ref>/editor
Auth Hooks: https://supabase.com/dashboard/project/<ref>/auth/hooks
```

---

## ⚡ نصائح للأداء

1. **JWT claim أسرع من subquery**. سجّل `add_custom_claims` كـ Custom Access Token Hook في Supabase Dashboard لينقل عبء `my_teacher_id()` من query إلى claim parsing.

2. **استخدم `head: true` للعدّ**:
   ```ts
   const { count } = await sb.from('students')
     .select('id', { head: true, count: 'exact' })
     .eq('teacher_id', teacherId);
   ```

3. **Parallel queries في pages**:
   ```ts
   const [a, b, c] = await Promise.all([queryA(), queryB(), queryC()]);
   ```

4. **`safe()` wrapper** يحمي page render من فشل query واحد:
   ```ts
   const data = await safe(query(), fallback, 'label');
   ```

5. **استخدم indexes**: لو أضفت WHERE/ORDER على عمود جديد، أضف index في migration.

</div>
