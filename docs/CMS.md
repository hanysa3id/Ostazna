<div dir="rtl">

# 📝 Content Management Systems

في المنصة **نظامان منفصلان للـ CMS**:

1. **Super Admin CMS** — يدير محتوى الموقع التسويقي العام (`ostazna.com`)
2. **Teacher CMS** — يدير محتوى الـ subdomain الشخصي للمدرس (`<name>.ostazna.com`)

---

# 🦸 1. Super Admin CMS

## النظرة العامة

Super Admin يدير كل ما يظهر للزوار على الصفحة الرئيسية وصفحات المزايا والـ pricing من خلال لوحة تحكم احترافية في `/admin/cms/*`.

التغييرات تنعكس فوراً على الموقع العام بفضل `force-dynamic` على marketing pages.

## الجداول

| الجدول | الوصف | عدد الصفوف الافتراضي |
|--------|------|---------------------|
| `site_settings` | إعدادات JSON عامة (autoplay، نصوص footer) | 2 |
| `site_hero_slides` | شرائح الـ Hero Carousel | 3 |
| `site_stats` | الـ 4 إحصائيات (live من DB أو manual) | 4 |
| `site_features` | بطاقات المزايا (4 رئيسية + 8 ثانوية) | 12 |
| `site_testimonials` | آراء العملاء بصور | 6 |
| `site_faqs` | الأسئلة الشائعة | 5 |
| `site_pages` | صفحات تسويقية مخصصة | 0 |

## الواجهات

```
/admin/cms                       → نظرة عامة بـ 6 cards
/admin/cms/hero                  → إدارة الـ Hero Sliders
/admin/cms/hero/new              → شريحة جديدة
/admin/cms/hero/[id]             → تعديل شريحة
/admin/cms/stats                 → الإحصائيات (inline edit)
/admin/cms/features              → قائمة المزايا
/admin/cms/features/new          → ميزة جديدة
/admin/cms/features/[id]         → تعديل (مع dynamic lists)
/admin/cms/testimonials          → آراء العملاء (inline edit)
/admin/cms/faqs                  → أسئلة شائعة (inline edit)
/admin/cms/pages                 → صفحات مخصصة
/admin/cms/pages/new             → صفحة جديدة
/admin/cms/pages/[id]            → تعديل صفحة
```

## الـ Hero Carousel

```ts
interface HeroSlide {
  id: string;
  badge: string | null;          // "منصة المدرس الأولى في مصر"
  title: string;                 // "إدارة أعمالك التعليمية باحترافية"
  highlight: string | null;      // كلمة من العنوان تظهر بـ gradient
  subtitle: string | null;
  cta_label: string | null;      // "ابدأ مجاناً"
  cta_href: string | null;       // "/register"
  image_url: string | null;      // صورة خلفية اختيارية
  bg_gradient: 'aurora' | 'cool' | string;
  is_active: boolean;
  order_index: number;
}
```

عرض الـ carousel:
- **Autoplay**: كل 5.5 ثانية (قابل للتعديل من `site_settings.hero.autoplay_ms`)
- **Pause on hover**
- **Arrows + dot indicators**
- **Animated transitions** بـ framer-motion

## Live Stats

`site_stats` لها أربعة أنواع للمصدر:

| `source` | السلوك |
|---------|--------|
| `manual` | يستخدم `value` من DB كما هو |
| `live_teachers` | يأخذ MAX(value, COUNT(teachers)) |
| `live_students` | يأخذ MAX(value, COUNT(active students)) |
| `live_uptime` | يستخدم `value` كنسبة (مثلاً 99) |

هكذا الأدمن يضمن **حد أدنى عرضي** (مثلاً 500 مدرس)، والرقم الفعلي يعرض إذا كان أكبر.

## Features + Internal Pages

كل feature في `site_features`:

```ts
interface SiteFeature {
  slug: string;                  // "/features/[slug]"
  icon: string;                  // اسم Lucide icon
  tone: string;                  // tailwind gradient classes
  title: string;
  short_body: string;            // للبطاقة في homepage
  is_primary: boolean;           // primary 4 أو secondary 8
  
  // الصفحة الداخلية
  hero_subtitle: string;
  long_body: string;             // markdown
  highlights: { title, desc, icon }[];
  examples: { title, desc, image_url? }[];
  faq: { q, a }[];
  cta_label: string;
  cta_href: string;
  
  // SEO
  seo_title: string;
  seo_desc: string;
}
```

كل feature primary لها صفحة internal كاملة على `/features/<slug>` بالـ:
- Hero بـ icon كبير + badge + CTAs
- Long description
- Highlights grid (4 بطاقات)
- Examples (zigzag layout)
- Mini FAQ
- CTA النهائي
- Related features

## Testimonials بصور

```ts
interface Testimonial {
  name: string;
  role: string | null;           // "مدرس فيزياء — القاهرة"
  body: string;
  avatar_url: string | null;     // صورة الشخص
  rating: 1-5;
  is_active: boolean;
  order_index: number;
}
```

العرض:
- Card بـ glass-morphism
- خلفية tint ملونة (6 درجات)
- Avatar بـ ring ملوّن
- Quote icon decorative
- 5 stars
- Hover lift

## Custom Pages

أي صفحة جديدة على `/p/<slug>`:
- HTML content (محرر بصري قادم)
- `show_in_nav` → تظهر في الـ marketing header
- SEO title/description

## Cache Strategy

- Marketing pages: `export const dynamic = 'force-dynamic'` → تجلب من DB في كل request
- Admin actions: `revalidatePath('/', 'layout')` بعد كل save → يفرّغ أي ISR cache
- DAL: لا `unstable_cache` (تم حذفه لأنه كان يسبب stale data)

## نموذج الإضافة (Workflow)

1. أدمن يفتح `/admin/cms/hero/new`
2. يملأ النموذج (title، subtitle، CTA، gradient)
3. يضغط "إضافة الشريحة"
4. Server action يحفظ في DB عبر service role (يتجاوز RLS)
5. `bumpAll()` يستدعي `revalidatePath('/', 'layout')`
6. الزائر التالي يفتح `/` → يرى الشريحة الجديدة

---

# 🌐 2. Teacher Subdomain CMS

## النظرة العامة

كل مدرس عنده موقع شخصي على `<his-subdomain>.ostazna.com`. يقدر يعدّل المحتوى من `/cms/*` في dashboard المدرس.

## الـ URL Routing

```
ahmed.ostazna.com           → app/s/[subdomain]/page.tsx (subdomain="ahmed")
ahmed.ostazna.com/about     → app/s/[subdomain]/[slug]/page.tsx
example.com                 → app/s/[subdomain]/page.tsx (custom domain)
```

الـ middleware يقوم بالـ rewrite:

```ts
// middleware.ts
if (host.endsWith('.ostazna.com')) {
  const sub = host.replace('.ostazna.com', '');
  if (!RESERVED.has(sub)) {
    rewrite to /s/<sub>/...
  }
}
// Custom domain
else if (host !== 'ostazna.com' && isRealDomain(host)) {
  rewrite to /s/@host:<host>/...
}
```

## الجداول

| الجدول | الوصف |
|--------|------|
| `cms_pages` | صفحات الـ subdomain (block-based content jsonb) |
| `cms_settings` | الثيم + الشعار + الروابط الاجتماعية |

## الواجهات للمدرس

```
/cms                          → نظرة عامة
/cms/pages                    → قائمة صفحات الموقع
/cms/pages/[id]               → تحرير صفحة
/cms/theme                    → ألوان + شعار + سوشيال
```

## Theme Builder

```ts
interface CmsSettings {
  logo_url: string;
  theme_config: {
    primary: '#1E3A5F';        // hex color
    secondary: '#F5A623';
    accent: '#2ECC71';
    font_ar: 'Noto Kufi Arabic';
    font_en: 'Plus Jakarta Sans';
  };
  social_links: {
    facebook: string;
    youtube: string;
    instagram: string;
    whatsapp: string;          // E.164 number
  };
}
```

الثيم يُطبَّق على subdomain layout عبر CSS variables:

```tsx
<div style={{
  ['--theme-primary' as any]: settings.theme_config.primary,
  ['--theme-secondary' as any]: settings.theme_config.secondary,
}}>
```

ثم في الـ CSS:
```css
.btn-primary { background: var(--theme-primary); }
```

## Custom Domains

المدرس في خطة Premium يقدر يربط دومينه الخاص:

1. يضع CNAME في DNS الخاص به: `www.example.com → <his-sub>.ostazna.com`
2. يدخل الدومين في `/settings/domain` → يحفظ في `teachers.custom_domain`
3. Caddy يطلب `/api/tls/check?domain=<host>` للتحقق
4. الـ API يفحص: `select count(*) from teachers where custom_domain = ?`
5. لو موجود → 200 → Caddy يصدر شهادة SSL تلقائياً عبر `on_demand_tls`
6. الـ middleware يعمل rewrite لـ `/s/@host:<host>/...`
7. DAL يستعلم: `where custom_domain = host`

## Storage للصور

كل مدرس يرفع صور في:

```
storage/avatars/<teacher_id>/profile/<uuid>.png
storage/logos/<teacher_id>/brand/<uuid>.png
storage/cms/<teacher_id>/<entity>/<uuid>.png
```

RLS تضمن:
- الكتابة فقط من المدرس صاحب الـ folder
- القراءة عامة (avatars/logos/cms public buckets)
- receipts خاص (للمدرس فقط)

## نموذج إنشاء صفحة جديدة

1. مدرس يفتح `/cms/pages` → "صفحة جديدة"
2. يدخل title + slug → action ينشئ صف مع content فاضي
3. يفتح صفحة التحرير → يكتب HTML
4. يضغط "نشر" → `is_published = true`
5. الصفحة تظهر فوراً على `<sub>.ostazna.com/<slug>`

## Block-based Content (مستقبلي)

حالياً المحتوى HTML بسيط في textarea. Phase 5 سيضيف Tiptap محرر بصري:

```ts
content_ar: [
  { type: 'heading', level: 2, text: '...' },
  { type: 'paragraph', text: '...' },
  { type: 'image', url: '...', alt: '...' },
  { type: 'gallery', images: [...] },
]
```

---

# 🔄 الفروقات بين النظامين

| الميزة | Super Admin CMS | Teacher CMS |
|--------|----------------|-------------|
| **النطاق** | الموقع العام `ostazna.com` | subdomain شخصي |
| **الجداول** | `site_*` | `cms_*` |
| **الصلاحية** | super_admin only | المدرس صاحب الصف |
| **RLS** | public read + admin write | public read for published + owner write |
| **Cache** | force-dynamic | force-dynamic |
| **Routes** | `/admin/cms/*` | `/cms/*` |
| **يظهر على** | `/`, `/pricing`, `/features/*`, `/p/*` | `/s/<sub>/*` |

</div>
