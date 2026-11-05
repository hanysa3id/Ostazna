<div dir="rtl">

# أستاذنا · Ostazna

**منصة SaaS متكاملة لإدارة أعمال المدرسين الخصوصيين في مصر** — طلاب، مجموعات، حصص، حضور، مالية، فواتير، اختبارات، وموقع شخصي خاص بكل مدرس على Subdomain تلقائي.

[![Stack](https://img.shields.io/badge/Stack-Next.js%2015%20·%20React%2019%20·%20Supabase-blue)]()
[![Status](https://img.shields.io/badge/Status-Beta%20·%20Phase%204%2B-success)]()
[![Lang](https://img.shields.io/badge/UI-Arabic%20RTL-violet)]()

---

## 🚀 البدء السريع

```powershell
# 1. تثبيت الـ dependencies
npm install

# 2. نسخ الـ env
cp .env.example .env.local        # ثم املأ قيم Supabase

# 3. ربط مشروع Supabase
npx supabase link --project-ref <ref>

# 4. تطبيق الـ migrations
npm run db:push

# 5. إنشاء أول Super Admin
npm run seed:admin -- --email you@example.com --password 'StrongP@ss1'

# 6. تشغيل dev server
npm run dev                       # → http://localhost:3000
```

> 📘 **للمرة الأولى؟** ابدأ بـ [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) للحصول على دليل الإعداد الكامل.

---

## 📚 الوثائق

| الملف | المحتوى |
|------|--------|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | تصميم النظام، الطبقات، تدفق البيانات |
| [`docs/DATABASE.md`](docs/DATABASE.md) | الـ schema الكامل، RLS policies، الـ migrations |
| [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) | إعداد بيئة التطوير، السكربتات، الأكواد |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | النشر على VPS مع Caddy و Docker |
| [`docs/AUTH.md`](docs/AUTH.md) | المصادقة، الأدوار، RLS |
| [`docs/CMS.md`](docs/CMS.md) | Super Admin CMS + CMS الخاص بالمدرس |
| [`docs/FEATURES.md`](docs/FEATURES.md) | كتالوج الميزات الكامل |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | المراحل المنجزة والقادمة |
| [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) | المشاكل الشائعة وحلولها |
| [`docs/SECURITY.md`](docs/SECURITY.md) | النموذج الأمني وأفضل الممارسات |
| [`docs/CHANGELOG.md`](docs/CHANGELOG.md) | سجل التحديثات |
| [`docs/AGENT.md`](docs/AGENT.md) | دليل المساعدين الذكيين العاملين على المشروع |

---

## 🏗️ التقنيات

```
Frontend       Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4
Animations     Framer Motion 11 · CSS animations
Icons          Lucide React
Charts         Recharts 2
Backend        Supabase Cloud (PostgreSQL · Auth · Storage · Realtime · Edge Functions)
i18n           next-intl 4 (Arabic RTL primary + English LTR)
PDF            @react-pdf/renderer
PWA            Service Worker + Web Push
Tests          Vitest · Playwright · pgTAP
Hosting        Self-hosted Docker on Hetzner VPS · Caddy reverse proxy + auto-SSL
```

---

## 📁 هيكل المشروع

```
ostazna/
├── app/
│   ├── (marketing)/          # ostazna.com — الصفحة العامة
│   ├── (auth)/               # login / register / forgot
│   ├── auth/callback/        # OAuth + email confirmation
│   ├── (teacher)/            # dashboard المدرس
│   ├── (admin)/              # admin.ostazna.com
│   ├── (parent)/             # بوابة ولي الأمر
│   ├── (student)/            # بوابة الطالب
│   ├── s/[subdomain]/        # موقع المدرس على subdomain شخصي
│   └── api/                  # health · exports · webhooks · TLS-check
│
├── components/
│   ├── ui/                   # GlassCard · GradientButton · AnimatedCounter
│   ├── shared/               # Header / Footer / LocaleSwitcher
│   ├── dashboard/            # Sidebar · StatCard · MobileNav · GlobalSearch
│   ├── marketing/            # HeroCarousel · StatsSection · Testimonials
│   └── admin/                # CMS form fields
│
├── lib/
│   ├── supabase/             # server / client / middleware clients
│   ├── dal/                  # Data Access Layer
│   ├── validations/          # Zod schemas
│   ├── i18n/                 # next-intl config + messages
│   ├── utils/                # numerals, dates, wa.me helpers
│   ├── auth/                 # auth server actions
│   └── pdf/                  # PDF templates
│
├── supabase/
│   ├── migrations/           # 0001-0014 numbered SQL
│   ├── functions/            # Edge Functions (Deno)
│   ├── seed.sql              # local dev seed
│   └── tests/                # pgTAP RLS tests
│
├── scripts/
│   ├── seed-admin.ts         # إنشاء أول super admin
│   ├── diagnose.ts           # فحص صحة DB
│   ├── apply-migration.ts    # تطبيق SQL مباشرة
│   └── backup.sh             # نسخ احتياطي يومي على B2
│
├── public/                   # static assets · manifest.json · sw.js
├── infra/                    # Caddy Dockerfile · promtail config
├── e2e/                      # Playwright tests
├── docs/                     # ملفات الوثائق التفصيلية
├── Dockerfile                # production build
├── docker-compose.yml        # full stack orchestration
├── Caddyfile                 # reverse proxy + auto-SSL
└── middleware.ts             # auth + subdomain routing
```

---

## 🎯 الأهداف الرئيسية

1. **نقل أعمال المدرس الخصوصي للأونلاين** بشكل احترافي بدون احتكاك تقني.
2. **توفير ساعات العمل اليدوي** (محاسبة، جدولة، تذكيرات، تقارير).
3. **رفع تحصيل المدرس** عبر تنبيهات تلقائية للمتأخرين في الدفع.
4. **منح المدرس حضوراً رقمياً احترافياً** (موقع شخصي + CMS + ثيم خاص).
5. **تجربة عربية أصيلة** — RTL أساسي، خط احترافي، عملة EGP، تواريخ Africa/Cairo.

---

## 👥 الـ Portals (4 بوابات)

| البوابة | الـ URL | الوصف |
|--------|--------|------|
| **Marketing** | `ostazna.com` | صفحة عامة + pricing + features + blog |
| **Teacher** | `ostazna.com/dashboard` | داشبورد المدرس الكامل |
| **Super Admin** | `admin.ostazna.com` | إدارة المنصة + CMS |
| **Parent** | `ostazna.com/parent` | متابعة ولي الأمر لأبنائه |
| **Student** | `ostazna.com/student` | حساب الطالب لمتابعة درجاته |
| **Subdomain** | `<name>.ostazna.com` | موقع المدرس الشخصي |

---

## 💡 السكربتات المتاحة

| الأمر | الوظيفة |
|------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build (standalone) |
| `npm run typecheck` | فحص TypeScript |
| `npm run test` | Vitest unit tests |
| `npm run e2e` | Playwright E2E tests |
| `npm run db:push` | تطبيق migrations |
| `npm run db:types` | توليد TypeScript types من DB |
| `npm run seed:admin` | إنشاء super admin |
| `npm run diagnose` | فحص شامل لحالة DB |

---

## 📞 التواصل

- 🌐 **Production**: [ostazna.com](https://ostazna.com)
- 📧 **الدعم**: support@ostazna.com

---

## 📜 الترخيص

ملكية خاصة — All rights reserved © 2026

</div>
