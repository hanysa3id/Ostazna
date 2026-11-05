<div dir="rtl">

# 🤖 Guide for AI Assistants

دليل المساعد الذكي للعمل على هذا المشروع. اقرأ هذا الملف **قبل** أي عمل لتفهم السياق + القرارات + المحاذير.

---

## 🎯 سياق المشروع في 30 ثانية

- **الاسم**: أستاذنا (Ostazna)
- **النوع**: SaaS multi-tenant للمدرسين الخصوصيين
- **اللغة**: عربي RTL أساسي + English LTR
- **السوق**: مصر
- **الـ Stack**: Next.js 15 (App Router) + React 19 + Supabase Cloud + Tailwind v4
- **الحالة**: Phase 5 مكتمل، Phase 6 (Production Launch) قادم

---

## 📚 ابدأ بقراءة هذه الملفات

بالترتيب:

1. [`README.md`](../README.md) — نظرة عامة
2. [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) — تصميم النظام
3. [`docs/DATABASE.md`](DATABASE.md) — الـ schema + RLS
4. [`docs/AUTH.md`](AUTH.md) — نموذج الأمان
5. [`docs/DEVELOPMENT.md`](DEVELOPMENT.md) — conventions
6. [`docs/TROUBLESHOOTING.md`](TROUBLESHOOTING.md) — المشاكل الشائعة

---

## ⚖️ القرارات المعمارية الأهم (لا تغيّرها بدون نقاش)

### 1. RLS عبر `SECURITY DEFINER` functions

```sql
-- ✅ هكذا
using (teacher_id = public.my_teacher_id())

-- ❌ ليس هكذا (يسبب recursion)
using (teacher_id in (select id from teachers where user_id = auth.uid()))
```

**السبب**: subqueries في RLS policies تسبب infinite recursion عند وجود policies متبادلة على جداول مرتبطة. SECURITY DEFINER يتجاوز RLS بأمان.

### 2. Service role في server only

```ts
// ❌ ليس في client components
'use client';
import { createServiceRoleClient } from '@/lib/supabase/server'; // فشل!

// ✅ في server actions / route handlers / server components فقط
'use server';
async function adminOp() {
  await ensureAdmin();  // المطلوب قبل service role
  const sb = createServiceRoleClient();
}
```

### 3. App Router + Server Components افتراضياً

```tsx
// ✅ Server Component (default)
export default async function Page() {
  const data = await fetchFromDB();
  return <div>{data}</div>;
}

// 'use client' فقط عند الحاجة لـ hooks/events/animations
```

### 4. Tailwind v4 logical properties

```tsx
// ✅ RTL-aware
<div className="ms-2 me-4 ps-3 pe-3 text-start" />

// ❌ Direction-specific (يكسر RTL)
<div className="ml-2 mr-4 pl-3 pr-3 text-left" />
```

### 5. force-dynamic على الصفحات اللي تستخدم cookies

```tsx
// ضروري للصفحات اللي تعتمد على auth أو يجب أن تعكس DB changes فوراً
export const dynamic = 'force-dynamic';
```

---

## 🚫 محاذير (لا تفعل)

### ❌ لا تستخدم `unstable_cache` للـ CMS

اختبرناها وكانت تسبب stale data بعد admin edits رغم `revalidateTag`. استخدم `force-dynamic` بدلاً.

### ❌ لا تمرّر `teacher_id` من الـ client

```ts
// ❌ خطر: client يقدر يمرّر أي teacher_id
async function createStudent(formData) {
  const teacherId = formData.get('teacher_id');  // BAD
  await sb.from('students').insert({ teacher_id: teacherId, ... });
}

// ✅ آمن: استخرج من الـ session
async function createStudent(formData) {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { error: 'unauthorized' };
  await sb.from('students').insert({ teacher_id: teacher.id, ... });
}
```

### ❌ لا تنشر secrets في commits

```bash
# قبل أي commit
git diff --cached | grep -i "supabase_service\|password\|secret\|api_key"
```

### ❌ لا تضف INSERT/UPDATE/DELETE policy على audit_logs بدون فحص

audit_logs يجب أن يكون append-only تقريباً. الـ trigger هو الكاتب الوحيد.

### ❌ لا تعدّل migration applied

أنشئ migration جديد دائماً. حتى لو الـ migration السابق فيه bug، ضع `drop if exists` ثم `create` في migration جديد.

### ❌ لا تستخدم `Date()` على قيم nullable مباشرة

```ts
// ❌ يكسر لو null
new Date(student.date_of_birth).toLocaleString()

// ✅ استخدم formatDate helper
formatDate(student.date_of_birth)  // يرجع '—' لو null
```

---

## ✅ ما يجب فعله

### 1. اقرأ DAL قبل كتابة queries مباشرة

```ts
// ✅
import { listStudents } from '@/lib/dal/students';
const students = await listStudents();

// ❌ تكرار + bypass للـ filtering logic
const sb = await createClient();
const { data } = await sb.from('students').select('*');
```

### 2. استخدم safe() wrapper للـ parallel queries

```ts
async function safe<T>(p: Promise<T>, fallback: T, label: string): Promise<T> {
  try { return await p; }
  catch (err) { console.error(`[xxx] ${label} failed:`, err); return fallback; }
}

const [a, b, c] = await Promise.all([
  safe(queryA(), [], 'a'),
  safe(queryB(), null, 'b'),
  safe(queryC(), 0, 'c'),
]);
// إذا فشل query واحد، الـ page تكمل بدلاً من 500
```

### 3. استخدم Zod للـ validation

```ts
import { z } from 'zod';

const schema = z.object({
  name_ar: z.string().trim().min(2),
  email: z.string().email(),
});

// في server action
const parsed = schema.safeParse({ name_ar: ..., email: ... });
if (!parsed.success) return { error: parsed.error.issues[0].message };
```

### 4. اطبع errors بـ context واضح

```ts
console.error('[students/add] createStudent failed:', JSON.stringify({
  code: error.code,
  message: error.message,
  hint: error.hint,
  details: error.details,
}, null, 2));
```

### 5. استخدم `revalidatePath` بعد كل mutation

```ts
await sb.from('students').insert({...});
revalidatePath('/students');
revalidatePath('/dashboard');
```

---

## 🛠️ أدوات Debugging

### الفحص الشامل
```bash
npm run diagnose
```

### اختبار queries بـ session حقيقي
```bash
npx tsx --env-file=.env.local scripts/test-dashboard.ts
npx tsx --env-file=.env.local scripts/test-student-detail.ts
npx tsx --env-file=.env.local scripts/test-register.ts
```

### اختبار signup
```bash
npx tsx --env-file=.env.local scripts/test-register.ts
```

### تطبيق migration واحد
```bash
echo "Y" | npx supabase db push --linked
# أو
npx tsx --env-file=.env.local scripts/apply-migration.ts supabase/migrations/00XX_xxx.sql
```

---

## 🗂️ هيكل الملفات (cheat sheet)

```
ميزة جديدة "X" تحتاج:
  1. supabase/migrations/00XX_x.sql       — جدول + RLS + index + trigger
  2. lib/validations/x.ts                  — Zod schema
  3. lib/dal/x.ts                          — DAL functions
  4. app/.../actions.ts                    — server actions
  5. app/.../page.tsx + form.tsx           — UI

نوع جديد من المستخدمين:
  - app/(NEW)/layout.tsx                   — auth check
  - app/(NEW)/error.tsx                    — error boundary
  - middleware.ts → PROTECTED_PREFIXES     — أضف الـ prefix

migration debugging:
  - scripts/diagnose.ts                    — حالة الجداول
  - scripts/check-state.ts                 — تفاصيل
  - scripts/test-*.ts                      — اختبار محدد

إصلاح RLS:
  - راجع docs/AUTH.md
  - استخدم helper functions (my_teacher_id, is_super_admin, ...)
  - لا تستخدم subqueries مباشرة في policies
```

---

## 🔑 الجداول المهمة

| الجدول | الـ key للـ tenant | ملاحظات |
|--------|-------------------|--------|
| `teachers` | `user_id` (من auth.users) | onboarded_at + subdomain + current_plan_id |
| `students` | `teacher_id` | + optional `user_id` للـ student portal |
| `groups` | `teacher_id` | `schedule` jsonb بـ slots |
| `sessions` | `teacher_id` (+ `group_id` or `student_id`) | check constraint |
| `attendance` | `teacher_id` (+ unique session+student) | idempotent saves |
| `payments` | `teacher_id` | + `period_from/to` للشهري |
| `subscriptions` | `teacher_id` | تاريخ الاشتراكات (الحالي في `teachers.current_*`) |
| `audit_logs` | `teacher_id` | append-only (trigger-driven) |
| `site_*` | لا (محتوى عام) | super_admin فقط للكتابة |

---

## 🎨 الـ Design System

### الألوان (في `globals.css` تحت `@theme`)

```
primary-{50-950}     # ocean blue
cyan-{50,100,300,500,600,700}
violet-{400-700}
secondary-500        # amber
accent-500           # green
danger-500           # red
```

### Gradients

```css
var(--gradient-cool)    /* primary-800 → primary-600 → cyan-700 */
var(--gradient-aurora)  /* primary-600 → violet-600 → cyan-500 */
```

### Components

```
GradientButton  — variants: primary | aurora | outline | glass
GlassCard       — backdrop-blur + transparency
AnimatedCounter — IntersectionObserver based
Reveal          — framer-motion scroll reveals
HeroIllustration — illustration للـ hero
```

---

## 🧪 اختبار التغييرات

قبل ما تقول "خلصت":

```bash
# 1. TypeScript
npm run typecheck

# 2. Build
npm run build

# 3. Tests
npm run test
npm run e2e

# 4. Manual smoke
npm run dev
# جرّب الـ feature يدوياً
```

---

## 💬 تواصل واضح مع المستخدم

عندما تشتغل على المشروع:

### ✅ افعل

- اشرح **ماذا** فعلت + **لماذا** بإيجاز
- اطبع نتائج فحوصات (`npm run diagnose` etc.)
- وضّح أي **migration جديدة** ولماذا
- اذكر ما يجب على المستخدم فعله بعدك (refresh? db:push?)

### ❌ لا

- لا تكتب paragraphs طويلة بلا داعٍ
- لا تخفي مشاكل بـ "should work"
- لا تفترض أن كل شيء يعمل بدون اختبار

### نمط الرد المفضّل

```
✅ تم [العمل]

| التغيير | الموقع |
|--------|------|
| ... | ... |

### للتطبيق
\```bash
[command]
\```

ابعتلي [نتيجة الفحص] لو فيه مشكلة.
```

---

## 🆘 لو علقت

1. اقرأ [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md)
2. شغّل `npm run diagnose`
3. شوف الـ migrations: `ls supabase/migrations/`
4. شوف الـ scripts: `ls scripts/`
5. اقرأ الـ DAL ذو الصلة: `lib/dal/`

لو المشكلة جذرية وغير موثقة، **أنشئ migration** للإصلاح ووثّقه في `CHANGELOG.md`.

---

## 📋 Checklist قبل التسليم

- [ ] الكود يعمل (`npm run dev` نظيف)
- [ ] TypeScript يعمل (`npm run typecheck`)
- [ ] Build يعمل (`npm run build`)
- [ ] لا secrets في commits
- [ ] migration جديد فيه `drop if exists` للـ idempotency
- [ ] DAL functions جديدة عندها error handling
- [ ] صفحات جديدة عندها `error.tsx` و `loading.tsx` (لو needed)
- [ ] CHANGELOG محدّث
- [ ] الوثائق محدّثة (لو فيه تغيير في architecture)

</div>
