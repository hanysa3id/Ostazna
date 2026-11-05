<div dir="rtl">

# ⭐ Features Catalog

كتالوج كامل لكل ميزات المنصة، مرتبة حسب الـ portal والوظيفة.

---

## 🌐 Marketing Site (للزوار)

| الميزة | الموقع | الحالة |
|--------|-------|-------|
| Homepage بـ Hero Carousel متعدد الشرائح | `/` | ✅ |
| Stats section بأرقام حقيقية + animations | `/` | ✅ |
| Features grid (4 رئيسية + 8 ثانوية) | `/#features` | ✅ |
| 3-Steps section بـ hover animations | `/` | ✅ |
| Testimonials بصور وخلفيات tinted | `/` | ✅ |
| FAQ accordion | `/#faq` | ✅ |
| CTA section مع gradient + dot pattern | `/` | ✅ |
| Pricing page (4 tiers + comparison table) | `/pricing` | ✅ |
| Feature internal pages (لكل ميزة رئيسية) | `/features/[slug]` | ✅ |
| Custom marketing pages | `/p/[slug]` | ✅ |
| Privacy / Terms / Refund | `/privacy`, `/terms`, `/refund-policy` | ✅ |
| Sitemap.xml + robots.txt | `/sitemap.xml` | ✅ |
| Multi-language (AR/EN) | locale switcher | ✅ |

---

## 🔐 Auth (تسجيل الدخول)

| الميزة | الموقع | الحالة |
|--------|-------|-------|
| Email/Password Login | `/login` | ✅ |
| Email/Password Register | `/register` | ✅ |
| Google OAuth | `/login`, `/register` | ✅ |
| Forgot Password | `/forgot-password` | ✅ |
| Email Verification | `/verify` | ✅ |
| OAuth Callback | `/auth/callback` | ✅ |
| 2FA TOTP | `/settings/security` | ✅ |
| Split-screen layout بـ hero artwork | كل auth pages | ✅ |
| Smart routing (admin → admin panel) | `loginAction` | ✅ |
| Facebook OAuth | — | ❌ معطّل عمداً |

---

## 👨‍🏫 Teacher Portal

### 📊 Dashboard (`/dashboard`)

| الميزة | الحالة |
|--------|-------|
| Hero greeting بناءً على وقت اليوم | ✅ |
| 5 Stat cards (طلاب، إيرادات، حصص اليوم، متأخرون، حضور) | ✅ |
| Quick Actions buttons | ✅ |
| Today's Sessions panel مع رابط تسجيل الحضور | ✅ |
| Overdue Students panel مع روابط WA | ✅ |
| Onboarding nudge للمدرس الجديد | ✅ |
| Real-time updates (Supabase Realtime) | ✅ |

### 🎓 Onboarding Wizard (`/onboarding`)

| الميزة | الحالة |
|--------|-------|
| 4-step wizard (profile → year → first group → subdomain) | ✅ |
| Idempotent (يقدر يُعاد بدون تكرار) | ✅ |
| Welcome email عبر Resend (no-op لو غير مضبوط) | ✅ |
| Auto session refresh لتحديث JWT | ✅ |

### 👥 Students (`/students`)

| الميزة | الحالة |
|--------|-------|
| قائمة الطلاب مع search + filter (active/archived) | ✅ |
| Bulk operations (multi-select + bulk archive) | ✅ |
| إضافة طالب يدوياً | ✅ |
| استيراد جماعي عبر CSV | ✅ |
| تعديل + custom fields editor | ✅ |
| ملف الطالب الكامل (مدفوعات، حضور، مجموعات، معدل) | ✅ |
| ربط حساب الطالب (للـ student portal) | ✅ |
| أرشفة/استعادة | ✅ |
| تصدير CSV | ✅ |

### 📚 Groups (`/groups`)

| الميزة | الحالة |
|--------|-------|
| قائمة المجموعات | ✅ |
| إنشاء مجموعة جديدة (name, grade, subject, pricing) | ✅ |
| Weekly schedule editor (slots متعددة) | ✅ |
| إدارة أعضاء المجموعة | ✅ |
| تعديل + أرشفة | ✅ |

### 📅 Schedule (`/schedule`)

| الميزة | الحالة |
|--------|-------|
| Week view (7-day grid) | ✅ |
| Navigation السابق/التالي | ✅ |
| توليد الحصص لـ 90 يوم تلقائياً | ✅ |
| Print view (A4 landscape) | ✅ |
| Color-coded by group | ✅ |

### ✅ Attendance (`/attendance`)

| الميزة | الحالة |
|--------|-------|
| قائمة حصص اليوم | ✅ |
| Per-session attendance sheet | ✅ |
| Bulk-mark (present/absent/late/excused) | ✅ |
| Idempotent (re-save بدون duplicates) | ✅ |
| Notes per student | ✅ |
| تحديث حالة الحصة تلقائياً (completed) | ✅ |

### 💰 Payments (`/finance/payments`)

| الميزة | الحالة |
|--------|-------|
| تسجيل دفعة (cash/bank/wallet) | ✅ |
| قائمة المتأخرين تلقائياً | ✅ |
| WhatsApp reminder بـ wa.me link | ✅ |
| Quota enforcement على رسائل WA | ✅ |
| Period range support | ✅ |

### 💸 Expenses (`/finance/expenses`)

| الميزة | الحالة |
|--------|-------|
| تسجيل مصروف بـ category | ✅ |
| تصنيفات مخصصة | ✅ |
| رفع صورة الإيصال (Supabase Storage) | ✅ |
| Monthly summary | ✅ |

### 🧾 Invoices (`/finance/invoices`)

| الميزة | الحالة |
|--------|-------|
| إصدار فاتورة جديدة بـ items | ✅ |
| ترقيم تلقائي per-teacher (INV-2026-0001) | ✅ |
| PDF generation عبر @react-pdf/renderer | ✅ |
| Status tracking (draft/issued/paid/cancelled) | ✅ |

### 📝 Exams (`/exams`)

| الميزة | الحالة |
|--------|-------|
| إنشاء اختبار (title, duration, marks) | ✅ |
| 4 أنواع أسئلة (MCQ, T/F, short, essay) | ✅ |
| نشر للمجموعات أو الصفوف | ✅ |
| عرض نتائج الطلاب | ✅ |
| Auto-grade للـ MCQ/T/F | ⏳ Phase 5 |
| Manual essay grading UI | ⏳ Phase 5 |
| Offline grades input | ✅ schema جاهز |

### 📊 Reports (`/reports`)

| الميزة | الحالة |
|--------|-------|
| Revenue/Expense line chart (6 months) | ✅ |
| Expenses pie chart by category | ✅ |
| Monthly revenue bar chart | ✅ |
| Attendance rate calculation | ✅ |

### 🌐 CMS (`/cms`)

| الميزة | الحالة |
|--------|-------|
| إدارة صفحات الـ subdomain | ✅ |
| Theme builder (3 colors + logo + social) | ✅ |
| Block-based editor (Tiptap) | ⏳ Phase 5 |
| Gallery / Sliders | ⏳ Phase 5 |

### 🔔 Notifications (`/notifications`)

| الميزة | الحالة |
|--------|-------|
| إرسال إشعار in-app | ✅ |
| Target: all/group/student | ✅ |
| WhatsApp broadcast (wa.me) | ✅ |
| Real-time bell في header | ✅ |
| Web Push notifications | ✅ |

### ⚙️ Settings (`/settings`)

| الصفحة | الميزات |
|-------|--------|
| `/settings/profile` | الاسم + الصورة + الهاتف |
| `/settings/security` | تغيير كلمة المرور + 2FA + Web Push |
| `/settings/assistants` | إضافة سكرتارية بصلاحيات granular |
| `/settings/domain` | ربط دومين مخصص |
| `/data-export` | تصدير ZIP بكل البيانات |

---

## 🦸 Super Admin Portal (`admin.ostazna.com`)

### 📊 Dashboard (`/admin/dashboard`)

| الميزة | الحالة |
|--------|-------|
| Hero card بـ gradient | ✅ |
| 8 stat cards (مدرسين، نشط، تجريبي، مجمّد، طلاب، إيرادات، WA) | ✅ |
| Quick Actions (6 cards) | ✅ |
| Charts (revenue line + signups bar + plan distribution pie) | ✅ |
| Recent activity feeds (teachers / subscriptions / audit) | ✅ |

### 👨‍🏫 Teachers Management (`/admin/teachers`)

| الميزة | الحالة |
|--------|-------|
| قائمة بـ search + filter بالحالة | ✅ |
| Status counts | ✅ |
| ملف المدرس الكامل | ✅ |
| تفعيل/تجديد اشتراك | ✅ |
| تغيير الحالة (trial/active/frozen/archived) | ✅ |
| **Impersonation** ("دخول كهذا المدرس") | ✅ |
| إعادة كلمة المرور | ✅ |
| حذف نهائي بتأكيد "DELETE" | ✅ |
| Add-ons grant/revoke | ✅ |
| Stats (طلاب، مجموعات، حصص، إيرادات، WA) | ✅ |

### 💳 Subscriptions (`/admin/subscriptions`)

| الميزة | الحالة |
|--------|-------|
| قائمة كل الاشتراكات | ✅ |
| Filters (status, date range) | ✅ |
| Summary cards (إيراد، الشهر، على وشك الانتهاء) | ✅ |
| Expiring-soon alert (14 يوم) | ✅ |

### 📦 Plans (`/admin/plans`)

| الميزة | الحالة |
|--------|-------|
| تحرير اسم وسعر كل خطة | ✅ |
| تحرير سقف الطلاب وWA | ✅ |
| تحرير bundled add-ons | ✅ |
| Toggle active/inactive | ✅ |

### 🧩 Add-ons (`/admin/addons`)

| الميزة | الحالة |
|--------|-------|
| CRUD كامل (key, name, price, icon) | ✅ |
| عرض عدد المستخدمين لكل add-on | ✅ |
| Grant/revoke لمدرس معيّن (من ملفه) | ✅ |

### 📝 CMS (`/admin/cms/*`)

كل ميزات CMS موضّحة في [`CMS.md`](CMS.md):
- Hero Sliders ✅
- Stats ✅
- Features (مع internal pages) ✅
- Testimonials ✅
- FAQs ✅
- Custom Pages ✅

### 📜 Audit Logs (`/admin/audit-logs`)

| الميزة | الحالة |
|--------|-------|
| قائمة كل العمليات | ✅ |
| Filters (action, entity, teacher, date) | ✅ |
| JSON viewer للـ old/new values | ✅ |
| Actor + teacher names (مش UUIDs فقط) | ✅ |

### 📞 WhatsApp Log (`/admin/wa-log`)

| الميزة | الحالة |
|--------|-------|
| سجل كل ضغطات WA | ✅ |
| Top senders هذا الشهر | ✅ |
| Filters (teacher, date) | ✅ |

### ⚙️ Platform Settings (`/admin/platform-settings`)

| الميزة | الحالة |
|--------|-------|
| طرق الدفع (cash/bank/wallet) + IBAN/wallet number | ✅ |
| تعليمات الدفع (تظهر للمدرس) | ✅ |
| بيانات الدعم (email, phone, WA) | ✅ |
| WA caps summary (يحررها من /admin/plans) | ✅ |

---

## 👨‍👩‍👧 Parent Portal (`/parent`)

| الميزة | الحالة |
|--------|-------|
| Login بنفس auth flow العادي | ✅ |
| Dashboard مع آخر مدفوعات وحضور الأبناء | ✅ |
| Layout مستقل عن teacher portal | ✅ |
| RLS منفصل (parent يرى أبناءه فقط) | ✅ |

---

## 🎓 Student Portal (`/student`)

| الميزة | الحالة |
|--------|-------|
| Login بنفس auth flow | ✅ |
| Dashboard مع stats شخصية | ✅ |
| Schedule (الحصص القادمة 30 يوم) | ✅ |
| Grades (online + offline + attendance log) | ✅ |
| Payments (سجل المدفوعات) | ✅ |
| RLS لقراءة بيانات نفسه فقط | ✅ |

---

## 🌍 Subdomain Sites (`<name>.ostazna.com`)

| الميزة | الحالة |
|--------|-------|
| Auto subdomain لكل مدرس | ✅ |
| Custom theme من Theme Builder | ✅ |
| نشر صفحات CMS | ✅ |
| Logo + social links في footer | ✅ |
| Custom domain support (Premium) | ✅ |
| SSL تلقائي عبر Caddy on-demand | ✅ |

---

## 🛡️ Security Features

| الميزة | الحالة |
|--------|-------|
| Row Level Security على كل الجداول | ✅ |
| Audit Log غير قابل للحذف | ✅ |
| 2FA TOTP اختياري | ✅ |
| Service Role isolated في server only | ✅ |
| Rate limiting (basic) | ⚙️ يحتاج Upstash |
| CSRF protection (Next.js Server Actions) | ✅ |
| HTTPS enforced (HSTS) | ✅ |
| Security headers (X-Content-Type-Options, etc.) | ✅ |

---

## 📱 PWA Features

| الميزة | الحالة |
|--------|-------|
| Web Manifest | ✅ |
| Service Worker | ✅ |
| Installable على الموبايل | ✅ |
| Offline shell للـ dashboard | ✅ |
| Web Push notifications | ✅ |

---

## 🎨 UI/UX Features

| الميزة | الحالة |
|--------|-------|
| Cool color palette (deep blues + cyan + violet) | ✅ |
| Glass morphism components | ✅ |
| Gradient buttons + animations | ✅ |
| Animated counters (IntersectionObserver) | ✅ |
| Scroll reveals (framer-motion) | ✅ |
| Hover lift on cards | ✅ |
| Mobile drawer nav | ✅ |
| Global search (Cmd+K) | ✅ |
| Loading skeletons | ✅ |
| Error boundaries (root + per-route-group) | ✅ |
| RTL/LTR seamless switching | ✅ |
| Dark mode | ⏳ Phase 5 |

---

## 🔧 DevOps Features

| الميزة | الحالة |
|--------|-------|
| Docker Compose stack | ✅ |
| Caddy reverse proxy + auto-SSL | ✅ |
| Backups (pg_dump → restic → B2) | ✅ |
| Edge Function cron (nightly tasks) | ✅ |
| Uptime Kuma monitoring | ✅ |
| Grafana + Loki + Promtail logging | ✅ |
| GitHub Actions CI/CD | ✅ |
| Health endpoint `/api/health` | ✅ |
| Diagnostic script (`npm run diagnose`) | ✅ |

</div>
