<div dir="rtl">

# 🗺️ Roadmap

## التقدم الحالي

```
Phase 0  ✅ Setup & Infrastructure
Phase 1  ✅ MVP (Auth, Students, Schedule, Attendance, Payments)
Phase 2  ✅ Expenses, Invoices, CMS, Notifications
Phase 3  ✅ Exams, Reports, Assistants, Parent Portal
Phase 4  ✅ PWA, Web Push, Storage, 2FA, Custom Domains
Phase 5  ✅ UI Overhaul + Super Admin CMS + Multi-portal polish
Phase 6  ⏳ Production Launch (تشغيل فعلي على VPS)
Phase 7  ⏳ Payment Integration (Paymob / Fawry)
Phase 8  ⏳ AI Features
Phase 9  ⏳ Mobile App
```

---

## ✅ Phase 0 — Setup (مكتمل)

- [x] Next.js 15 + React 19 + TypeScript + Tailwind v4
- [x] Supabase Cloud project (eu-central-1)
- [x] Docker + Caddy + docker-compose
- [x] CI workflows (typecheck + build)
- [x] `.env.example` + setup scripts
- [x] `seed-admin.ts` لإنشاء أول super admin

## ✅ Phase 1 — MVP (مكتمل)

- [x] Email + Google OAuth auth
- [x] 4-step onboarding wizard
- [x] Students CRUD + CSV import + bulk operations
- [x] Groups CRUD + weekly schedule editor
- [x] Auto-generated recurring sessions (90 days horizon)
- [x] Attendance sheet (per-session, idempotent)
- [x] Payments + late-payer alerts + WA reminders
- [x] Dashboard with 5 stat cards + today's sessions
- [x] Subdomain placeholder (rendered at <name>.ostazna.com)
- [x] Minimal Super Admin (teachers list, manual subscription confirmation)

## ✅ Phase 2 — Operations (مكتمل)

- [x] Expenses + categories + receipt uploads
- [x] Invoices + PDF generation
- [x] In-app notifications + WA broadcasts
- [x] Theme builder + subdomain CMS pages
- [x] Custom domain support (admin + Caddy on-demand TLS)

## ✅ Phase 3 — Engagement (مكتمل)

- [x] Exams (4 question types, publishing)
- [x] Reports with Recharts (revenue, expenses, attendance)
- [x] Assistants with granular permissions
- [x] Parent portal (separate route + RLS)
- [x] Student portal (separate route + RLS)

## ✅ Phase 4 — Polish (مكتمل)

- [x] PWA service worker + offline shell
- [x] Web Push notifications (VAPID)
- [x] Per-user notification read tracking
- [x] 2FA TOTP enrollment
- [x] Mobile drawer nav
- [x] Global search (Cmd+K)
- [x] Loading states (loading.tsx)
- [x] Print views (schedule)
- [x] Empty states with onboarding nudges

## ✅ Phase 5 — UI + Super Admin CMS (مكتمل)

- [x] Cool color palette redesign
- [x] Framer Motion animations
- [x] Glass morphism components
- [x] Hero carousel متعدد الشرائح
- [x] Stats with creative cards + LIVE badges
- [x] Feature internal pages (`/features/[slug]`)
- [x] Testimonials with avatar images
- [x] Super Admin CMS (hero/stats/features/testimonials/faqs/pages)
- [x] Custom marketing pages (`/p/[slug]`)
- [x] Add-ons management
- [x] Platform settings (payment methods, branding)
- [x] Audit logs filters + JSON viewer
- [x] WhatsApp send log viewer
- [x] Teacher detail with delete + reset password

---

## ⏳ Phase 6 — Production Launch (الأولوية القصوى)

**الهدف**: المنصة فعلياً online ومفتوحة للمستخدمين.

### الإجراءات

- [ ] توفير Hetzner VPS CX32
- [ ] تسجيل ostazna.com على Cloudflare DNS
- [ ] رفع الـ Docker stack وتشغيله
- [ ] نشر Edge Function `nightly-tasks` + جدولة cron
- [ ] إعداد Resend SMTP + التحقق من DNS
- [ ] توليد VAPID keys للـ Web Push
- [ ] إعداد Backblaze B2 + اختبار `restic backup`
- [ ] Quarterly restore drill (تأكد من الاستعادة)
- [ ] نشر `add_custom_claims` Hook في Supabase
- [ ] فحص شامل بـ `npm run diagnose` على prod
- [ ] Sentry / GlitchTip للـ error tracking
- [ ] دعوة 2-3 مدرسين للـ beta + جمع feedback

**المدة المقدرة**: 1-2 أسبوع

---

## ⏳ Phase 7 — Payment Integration

**الهدف**: المدرس يدفع ذاتياً بدون تدخل يدوي من Super Admin.

### الميزات

- [ ] **Paymob iframe integration**
  - دفع بـ بطاقة بنكية
  - Webhook handler لتأكيد الدفع
  - Auto-renewal monthly
- [ ] **Fawry**
  - رقم مرجعي للدفع في أي فرع
- [ ] **Vodafone Cash / InstaPay**
  - QR code + رقم محفظة
- [ ] **Failed payment handling**
  - Retries
  - Soft freeze + grace period
- [ ] **Receipt emails** تلقائياً عبر Resend
- [ ] **Refund flow**
  - Self-service refund (7 days)
  - Admin-initiated refund

**المدة المقدرة**: 3-4 أسابيع

---

## ⏳ Phase 8 — AI Features

**الهدف**: ميزات تنافسية فريدة في السوق.

### الميزات

- [ ] **توليد اختبارات من PDF**
  - مدرس يرفع PDF كتاب → AI يستخرج 10-20 سؤال
  - استخدام Claude API (Anthropic)
- [ ] **تصحيح المقالات بـ AI**
  - تصحيح + تعليقات + درجة مقترحة
  - المدرس يراجع ويعدّل
- [ ] **ملخصات أداء الطلاب**
  - report شهري بصياغة طبيعية لولي الأمر
  - مُولَّد تلقائياً + قابل للتعديل
- [ ] **مساعد كتابة محتوى CMS**
  - "اكتب لي صفحة About" → AI ينتج draft
- [ ] **Smart insights في Dashboard**
  - "نصف طلاب مجموعة الفيزياء غابوا الأسبوع الماضي"
  - "إيراداتك تتراجع 15% — ابعت تذكيرات"

**المدة المقدرة**: 4-6 أسابيع

---

## ⏳ Phase 9 — Mobile App

**الهدف**: تجربة موبايل أصيلة + push notifications.

### الميزات

- [ ] **React Native / Expo** project
- [ ] إعادة استخدام نفس Supabase backend
- [ ] **Native push** (FCM + APNs)
- [ ] **Camera access** (تصوير إيصالات، صور طلاب)
- [ ] **Offline-first** (sync queue)
- [ ] **Biometric auth** (Face ID / fingerprint)
- [ ] طرح على Google Play + App Store

**المدة المقدرة**: 6-8 أسابيع

---

## 🌟 Phase 10+ — Future Ideas

### Multi-tenant evolution
- [ ] **Organizations** (مدرسة كاملة فيها عدة مدرسين)
- [ ] Dashboard موحّد للأكاديمية
- [ ] Hierarchical permissions

### WhatsApp Business API
- [ ] Real bulk messaging (بدل wa.me links)
- [ ] Inbox للردود
- [ ] Template messages معتمدة من Meta

### Advanced CMS
- [ ] Tiptap visual editor
- [ ] Media library
- [ ] Blog system
- [ ] Image gallery / sliders

### Question Bank
- [ ] مكتبة أسئلة مشتركة بين المدرسين
- [ ] Auto-grading متقدّم (نمط الاختيارات الجزئية)
- [ ] Network effect — كل مدرس يُغني المنصة

### Internationalization
- [ ] English UI كامل (حالياً جزئي)
- [ ] More locales (French)

### Performance
- [ ] Redis caching layer
- [ ] Lighthouse 95+ على كل الصفحات
- [ ] k6 load test النتائج موثّقة

### Analytics & Marketing
- [ ] Plausible/Umami analytics
- [ ] A/B testing (Vercel-style)
- [ ] Affiliate / referral program
- [ ] Email marketing sequences

### Developer Experience
- [ ] OpenAPI spec للـ API endpoints
- [ ] Storybook للـ UI components
- [ ] Visual regression tests
- [ ] More E2E coverage

---

## 📅 الجدول الزمني المتوقّع

```
الآن              → ✅ Phase 5 مكتمل
أسبوعان (Week 1-2) → 🚀 Phase 6 (Production Launch)
الشهر 2-3         → 💳 Phase 7 (Payments)
الشهر 4-5         → 🤖 Phase 8 (AI Features)
الشهر 6-8         → 📱 Phase 9 (Mobile App)
بعدها             → 🚀 Phase 10+
```

---

## 🎯 KPIs (مؤشرات النجاح)

### Phase 6 (Launch)

- 10+ مدرسين تسجّلوا في الأسبوع الأول
- < 3 أخطاء production / يوم
- < 500ms TTFB على dashboard
- 99% uptime

### Phase 7 (Payments)

- 50% من الـ trial → paid conversion
- < 5% فشل في عمليات الدفع
- < 24 ساعة من الدفع لتفعيل الاشتراك

### Phase 8 (AI)

- 30% من المدرسين يستخدمون ميزة AI شهرياً
- زيادة 25% في retention
- زيادة 15% في الاشتراكات Premium

</div>
