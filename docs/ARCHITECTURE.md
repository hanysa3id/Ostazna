<div dir="rtl">

# 🏛️ Architecture · معمارية النظام

## نظرة عامة

أستاذنا منصة **multi-tenant SaaS** مبنية على Next.js 15 (App Router) مع Supabase كـ backend-as-a-service. كل مدرس في المنصة يحصل على *namespace* معزول بالكامل عبر Row Level Security، وموقع خاص به على Subdomain تلقائي.

---

## 🗺️ خريطة النظام (System Map)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              المتصفح / Mobile                              │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │ HTTPS
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                       Cloudflare DNS (*.ostazna.com)                      │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │ proxy + DDoS shield
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  Hetzner VPS (Linux + Docker Compose)                                     │
│                                                                          │
│  ┌──────────────────┐   ┌──────────────────────────────────────────────┐ │
│  │  Caddy 2.x       │   │   Next.js 15 (Node 22 standalone)            │ │
│  │  • wildcard SSL  ├──►│   • Server Components (RSC)                  │ │
│  │  • HTTP/3        │   │   • Server Actions                           │ │
│  │  • on-demand TLS │   │   • Middleware (auth + subdomain rewrite)    │ │
│  └──────────────────┘   │   • next-intl (Arabic RTL)                   │ │
│                         └──────────────┬───────────────────────────────┘ │
│  ┌──────────────────┐                  │                                 │
│  │  Loki + Grafana  │   ┌──────────────▼───────────────────────────┐   │
│  │  Uptime Kuma     │   │  pg_dump + restic → Backblaze B2 (nightly)│   │
│  └──────────────────┘   └──────────────────────────────────────────┘   │
└─────────────────────────────────┬────────────────────────────────────────┘
                                  │ HTTPS
                                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  Supabase Cloud (eu-central-1 / Frankfurt)                                │
│                                                                          │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌────────────┐  ┌──────┐ │
│  │ PostgreSQL│  │   GoTrue  │  │  Storage  │  │  Realtime  │  │ Edge │ │
│  │  + RLS    │  │  (Auth)   │  │  (S3)     │  │  (Phoenix) │  │ Fns  │ │
│  └───────────┘  └───────────┘  └───────────┘  └────────────┘  └──────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🧱 الطبقات (Layers)

### 1. Presentation Layer (`app/`)

**Server Components** بشكل افتراضي — تحوّل لـ Client Components بـ `'use client'` فقط عند الحاجة (forms، interactivity، animations).

```
app/
├── (marketing)/      # public route group
├── (auth)/           # auth flows
├── (teacher)/        # teacher dashboard (RLS-gated)
├── (admin)/          # super admin (role-gated)
├── (parent)/         # parent portal
├── (student)/        # student portal
├── s/[subdomain]/    # rendered teacher subdomain sites
└── api/              # route handlers
```

**Route Groups** بأقواس `()` لا تظهر في الـ URL لكنها توفّر:
- Layout مخصص لكل مجموعة (header مختلف، sidebar مختلف)
- `error.tsx` boundary مستقل
- `loading.tsx` skeleton مستقل

### 2. Business Logic Layer (`lib/`)

```
lib/
├── auth/actions.ts          # server actions: login, register, logout, OAuth
├── dal/                     # Data Access Layer (one file per entity)
│   ├── teachers.ts          # getCurrentTeacher, isTeacherOnboarded, ...
│   ├── students.ts          # listStudents, getStudent, createStudent, ...
│   ├── groups.ts
│   ├── sessions.ts
│   ├── payments.ts          # listPayments, monthRevenueEGP, listOverdueStudents
│   └── site-cms.ts          # getHeroSlides, getStats, getFeatures, ...
├── validations/             # Zod schemas (shared form + action)
├── utils/                   # numerals, dates, wa.me builder, cn helper
├── i18n/                    # next-intl config + ar/en messages
├── supabase/                # 3 client variants (server, client, middleware)
├── pdf/                     # @react-pdf templates
├── quotas.ts                # per-tier enforcement (students cap, WA cap)
└── impersonation.ts         # super admin impersonation cookies
```

**القواعد الذهبية**:
- ❌ لا تستدعي Supabase مباشرة من الـ pages → استخدم DAL
- ❌ لا تمرّر `teacher_id` من الـ client → DAL يستخرجها من الـ session
- ✅ كل DAL function يأخذ user-scoped `createClient()` ويعتمد على RLS
- ✅ للأدوار الحساسة (admin) أو الـ onboarding، استخدم `createServiceRoleClient()` مع `ensureAdmin()` check

### 3. Data Layer (Supabase)

#### Postgres
- 30+ جدول، مقسّم حسب الـ tenant (`teacher_id`)
- RLS policies في كل جدول حساس
- Audit triggers على الكتابات
- 4 SECURITY DEFINER functions لـ helper queries بدون recursion

#### Auth (GoTrue)
- Email/password + Google OAuth
- 2FA TOTP اختياري
- Custom Access Token Hook (اختياري) لحقن `teacher_id` في JWT
- `app_metadata.role = 'super_admin'` للأدمن

#### Storage (S3-compatible)
- 4 buckets: `avatars`, `logos`, `receipts`, `cms`
- RLS بنمط `<teacher_id>/<entity>/<file>`
- Public buckets للـ CDN (avatars/logos/cms) — receipts خاص

#### Realtime
- Channels per teacher (`notifs:<teacher_id>`)
- Push events on `notifications` table changes

#### Edge Functions
- `nightly-tasks` (Deno) — توسيع الحصص + تجميد المنتهين

---

## 🌐 تدفق الطلب (Request Flow)

### مثال: مدرس يفتح `/dashboard`

```
1. Browser GET https://ostazna.com/dashboard
                    │
                    ▼ Cloudflare → VPS
2. Caddy             │ Terminate TLS, proxy to app:3000
                    │
                    ▼
3. Next middleware    │ updateSession() — refresh auth cookies
                    │ Check protected prefixes → /dashboard requires auth
                    │ host = "ostazna.com" → no subdomain rewrite
                    │
                    ▼
4. (teacher)/layout │ getCurrentTeacher() via user-scoped client
                    │ if super_admin → redirect /admin/dashboard
                    │ if no teacher row → render bare children
                    │ else → render TeacherHeader + Sidebar + children
                    │
                    ▼
5. dashboard/page    │ Parallel queries via DAL:
                    │   - listStudents (RLS scoped to teacher)
                    │   - listTodaySessions
                    │   - monthRevenueEGP
                    │   - listOverdueStudents (RPC)
                    │ Each wrapped in safe() — failures don't crash page
                    │
                    ▼
6. RSC payload      │ React renders to RSC stream
                    │ Server-rendered HTML + data sent to browser
                    │
                    ▼
7. Browser hydrates │ Client components attach event handlers
                    │ Realtime subscription opens for notifications
```

### مثال: زائر يفتح `ahmed.ostazna.com`

```
1. DNS → VPS IP (wildcard A record on Cloudflare)
2. Caddy terminates SSL using DNS-01 wildcard cert
3. Middleware sees host="ahmed.ostazna.com"
4. Splits subdomain="ahmed" → not in RESERVED set
5. Rewrites internally to /s/ahmed/...
6. app/s/[subdomain]/layout.tsx fetches teacher by subdomain
7. Renders teacher's CMS pages with their custom theme
```

---

## 🔑 القرارات المعمارية (Decision Records)

### ✅ Supabase Cloud vs Self-hosted Supabase
**اخترنا Cloud.** الـ ~30ms latency لأوروبا غير ملحوظ، والـ ops burden للـ self-hosted (PG upgrades، PITR، GoTrue، Realtime scaling) مكلف. نراجع القرار عند 5,000+ مدرس.

### ✅ App Router vs Pages Router
**App Router.** RSC + Server Actions تختصر boilerplate كثير، و streaming يحسّن TTFB.

### ✅ Tailwind v4 + custom @theme
**Tailwind v4.** الـ CSS-first config أبسط، و JIT compiler أسرع. لكن نحتاج تعريف الألوان الافتراضية بوضوح.

### ✅ wa.me links vs WhatsApp Business API
**wa.me للـ MVP.** مجاني، لا يحتاج Meta approval. عيوبه: يفتح تبويب لكل رسالة (لا bulk حقيقي). Phase 5 سيضيف API.

### ✅ Self-hosted VPS vs Vercel
**VPS.** Wildcard subdomains على Vercel تتطلب Pro ($20/شهر) ومحدودة. VPS بـ Caddy يدعم unlimited subdomains + custom domains مجاناً.

### ✅ Next-intl vs i18next
**Next-intl.** integration أعمق مع App Router، و SSR-ready، و TypeScript-first.

### ✅ Service Role في الكتابات الحساسة
**نعم، لكن بحذر.** الـ onboarding يحتاج إنشاء صف teachers قبل وجود JWT claim. استخدمنا service role بعد `ensureAdmin()` check للحماية.

---

## 🧠 نموذج الـ Tenancy

كل البيانات الحساسة عندها عمود `teacher_id`. الـ RLS تضمن عزل تام:

```sql
create policy %I_tenant_read on %I for select
  using (
    teacher_id = public.my_teacher_id()
    or public.is_super_admin()
  );
```

**`my_teacher_id()`** هي `SECURITY DEFINER` function:

```sql
create function public.my_teacher_id() returns uuid
language sql stable security definer set search_path = public, auth as $$
  select id from public.teachers where user_id = auth.uid() limit 1;
$$;
```

تعمل بصلاحيات owner (postgres) → تتجاوز RLS → لا recursion. تفاصيل أكثر في [`AUTH.md`](AUTH.md).

---

## 🎨 i18n + RTL

- Default locale: `ar` (Arabic)
- Storage: cookie `NEXT_LOCALE`
- Direction: `<html lang dir>` set per locale in root layout
- Tailwind logical properties: `ms-*`, `me-*`, `ps-*`, `pe-*` (لا `ml-*`/`mr-*`)
- Fonts: Noto Kufi Arabic (Arabic) + Plus Jakarta Sans (Latin)
- Numerals: Western في admin, Arabic-Indic في print/CMS

---

## 📊 Performance Strategy

| Layer | Strategy |
|-------|----------|
| Marketing pages | `force-dynamic` لإنعكاس CMS فوري + low TTFB |
| Teacher dashboard | `force-dynamic` + Promise.all للقراءات المتوازية |
| DAL queries | RLS via JWT claim عند توفّره (سرعة) + fallback للـ subquery |
| Static assets | Cached by Caddy + immutable hashes via Next.js |
| Images | Next.js Image with remotePatterns + lazy loading |
| Subdomain sites | Could be ISR with on-demand revalidation (currently dynamic) |

---

## 🔄 الـ Migrations Strategy

- **Numbered SQL** في `supabase/migrations/` (0001 → 0014)
- **Idempotent** — كل migration يستخدم `IF EXISTS` / `IF NOT EXISTS`
- **Forward-only** — لا rollback؛ نضيف migration جديد للتراجع
- **CI yaml** يطبّق على staging → production
- يدوياً عبر `npm run db:push` أو script `apply-migration.ts`

تفاصيل كل migration في [`DATABASE.md`](DATABASE.md).

</div>
