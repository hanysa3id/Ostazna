<div dir="rtl">

# 📝 Changelog

كل التحديثات الكبيرة على المشروع، مرتبة من الأحدث للأقدم.

النمط مستوحى من [Keep a Changelog](https://keepachangelog.com).

---

## [Unreleased]

### قيد العمل
- Production launch (Phase 6)
- Payment integration (Phase 7)

---

## [0.5.2] — 2026-05-15 — Stability + Documentation

### Fixed
- 🐛 **42501 errors on dashboard** — `is_super_admin()` كانت SECURITY INVOKER، تحوّلت لـ DEFINER
- 🐛 **Wizard infinite loop** — `isTeacherOnboarded()` يستخدم structural fallback (subdomain + plan)
- 🐛 **Email rate limit on signup** — رسالة خطأ واضحة + توجيه لتعطيل تأكيد البريد
- 🐛 **"missing required error components"** — global-error.tsx + error.tsx لكل route group
- 🐛 **formatDate crashes on null** — wrapped في try/catch + null checks
- 🐛 **Student detail page errors** — كل query في safe() wrapper
- 🐛 **Audit trigger blocked by RLS** — `set_config('row_security', 'off')` داخل الـ trigger

### Added
- 📚 **Comprehensive docs** — 12 ملف md في `docs/` يغطّي كل جوانب المشروع
- 🛠️ `scripts/diagnose.ts` — فحص شامل لحالة DB والإعدادات
- 🛠️ `scripts/test-dashboard.ts` — تجربة RLS بـ session حقيقي
- 🛠️ `scripts/test-student-detail.ts` — تجربة استعلامات student page
- 🛠️ `scripts/apply-migration.ts` — تطبيق migration SQL مباشرة عبر pg
- 🛠️ `scripts/check-state.ts` — فحص جداول + teachers data

### Migrations
- `0013_fix_audit_rls.sql` — audit trigger يتجاوز RLS + permissive INSERT policy
- `0014_fix_is_super_admin.sql` — تحويل `is_super_admin()` لـ SECURITY DEFINER

---

## [0.5.1] — 2026-05-15 — Super Admin CMS + Polish

### Added
- 🎨 **Super Admin CMS** — إدارة كل محتوى الموقع التسويقي
  - Hero Carousel (شرائح متعددة)
  - Stats (manual + live من DB)
  - Features (12 ميزة + صفحات داخلية)
  - Testimonials (بصور + خلفيات tinted)
  - FAQs
  - Custom pages (`/p/[slug]`)
- 🎨 **UI Overhaul كامل** — cool palette + framer-motion + glass morphism
- 📊 **Admin Dashboard** بـ 8 stat cards + charts + recent activity
- 📋 **Plans Editor** كامل (price, caps, addons)
- 📦 **Add-ons Management** (CRUD + grant/revoke per teacher)
- ⚙️ **Platform Settings** (payment methods + branding)
- 🔍 **Audit Logs** بـ filters + JSON viewer
- 📞 **WhatsApp Send Log** (top senders + filters)
- 👨‍🏫 **Teacher Detail page** بـ stats + addons + reset password + delete

### Migrations
- `0008_site_cms.sql` — site_* tables + seed (3 hero, 4 stats, 12 features, 6 testimonials, 5 FAQs)
- `0009_cms_resilient_rls.sql` — `is_super_admin()` function + CMS write policies
- `0010_admin_extensions.sql` — addons + teacher_addons + platform_settings
- `0011_backfill_onboarded_at.sql` — تحديث legacy rows
- `0012_fix_rls_recursion.sql` — helper functions تكسر recursion

---

## [0.5.0] — 2026-05-15 — Production Polish + Mobile

### Added
- 📱 **Mobile drawer nav** — burger menu + side drawer
- 🔍 **Global search (Cmd+K)** — يبحث في طلاب/مجموعات/فواتير/مصروفات
- 📊 **Super Admin Analytics** — revenue chart + signups bar + plan distribution
- ☑️ **Bulk operations** على الطلاب (multi-select + archive)
- 🖨️ **Print views** للجدول (A4 landscape)
- 🔔 **Web Push notifications** (VAPID + service worker)
- 📖 **Notification reads tracking** (per-user)
- 🎓 **Student Portal** كامل (dashboard, schedule, grades, payments)
- 🔗 **Student account linking** للمدرس عبر email
- ⏳ **Loading states** (loading.tsx لكل route group)
- 🎯 **Empty states** بـ onboarding nudges

### Migrations
- `0006_push_subs.sql` — push_subscriptions + notification_reads
- `0007_student_self_access.sql` — RLS للطلاب لقراءة بياناتهم

---

## [0.4.0] — 2026-05-14 — Storage + 2FA + Custom Domains

### Added
- 🪣 **Supabase Storage** (4 buckets: avatars, logos, receipts, cms)
- 📤 **Image uploader** component مع RLS path validation
- 👤 **Profile editing** + avatar upload
- ✏️ **Student edit form** + custom fields editor
- 📥 **CSV import** للطلاب (bulk با preview)
- 🔔 **Real-time notifications bell** (Supabase Realtime)
- 🎭 **Admin Impersonation** (magic link based)
- ⏰ **Edge Function** `nightly-tasks` (session expansion + auto-freeze)
- 🔐 **2FA TOTP** enrollment + verify
- 🌐 **Custom domain support** (admin UI + Caddy on_demand_tls)
- 📧 **Welcome email** عبر Resend
- 🧪 **Tests scaffold** (Playwright E2E + pgTAP RLS)

### Migrations
- `0005_storage.sql` — 4 buckets + RLS

---

## [0.3.0] — 2026-05-14 — Phase 3 (Exams + Reports + Portals)

### Added
- 📝 **Exams module** (4 question types, publishing)
- 📊 **Reports** بـ Recharts (revenue, expenses, attendance)
- 👥 **Assistants** with granular permissions
- 👨‍👩‍👧 **Parent Portal** (separate route + RLS)

### Migrations
- `0004_phase2_3_schema.sql` — 14 جدول جديد (CMS, exams, parents, assistants)

---

## [0.2.0] — 2026-05-14 — Phase 2 (CMS + Notifications + Finance)

### Added
- 🌐 **Teacher subdomain CMS** (pages + theme builder)
- 🔔 **Notifications** (in-app + wa.me broadcasts)
- 💸 **Expenses module** + categories
- 🧾 **Invoices** + PDF generation (@react-pdf/renderer)

---

## [0.1.0] — 2026-05-14 — Phase 1 MVP

### Added
- 🔐 **Auth** (Email/password + Google OAuth)
- 🎓 **4-step Onboarding wizard**
- 👥 **Students** CRUD + filtering
- 📚 **Groups** + weekly schedule editor
- 📅 **Schedule** view + auto-generated sessions
- ✅ **Attendance** sheet (idempotent)
- 💰 **Payments** + late-payer alerts + WA reminders
- 📊 **Dashboard** with 5 stat cards
- 🦸 **Minimal Super Admin** (teacher list, manual subscription)

### Migrations
- `0001_init.sql` — كل الـ MVP schema (14 جدول)
- `0002_resilient_rls.sql` — RLS بـ subquery (لا يعتمد على JWT claim)
- `0003_schedule_helpers.sql` — `expand_recurring_sessions()` + `overdue_students_for_today()`

---

## [0.0.1] — 2026-05-14 — Initial Setup

### Added
- 🏗️ Next.js 15 + React 19 + TypeScript + Tailwind v4 scaffold
- 🔧 Supabase Cloud project linked
- 🐳 Docker + Caddy + docker-compose
- 🌍 next-intl (Arabic RTL primary + English LTR)
- 🛠️ CI workflows (typecheck + build)
- 📝 `seed-admin.ts` script

---

## 📅 Format Reference

كل version فيه:
- **Added** — ميزات جديدة
- **Changed** — تعديلات على ميزات موجودة
- **Deprecated** — ميزات ستُحذف قريباً
- **Removed** — ميزات حُذفت
- **Fixed** — bug fixes
- **Security** — security patches
- **Migrations** — DB migrations مرفقة بهذا الإصدار

</div>
