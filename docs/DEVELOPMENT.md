<div dir="rtl">

# 💻 Development · دليل التطوير

## المتطلبات

- **Node.js** ≥ 20 (موصى به: 22)
- **npm** ≥ 10
- **Git**
- حساب على [Supabase](https://supabase.com) (الـ Free tier كافٍ للتطوير)
- **اختياري**: Supabase CLI لتطبيق migrations

---

## 🛠️ الإعداد الأول

### 1. استنساخ المشروع

```powershell
git clone <repo-url> ostazna
cd ostazna
npm install
```

### 2. إعداد Supabase

1. اذهب لـ https://supabase.com/dashboard وأنشئ مشروعاً جديداً (اختر **eu-central-1 / Frankfurt**)
2. من **Project Settings → API**، انسخ:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ لا تنشره علنياً)

### 3. ملف الـ env

```powershell
cp .env.example .env.local
# ثم افتح .env.local واملأ القيم
```

محتوى `.env.local` المطلوب على الأقل:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...   # anon public
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ROOT_DOMAIN=ostazna.com

SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...        # service_role (مختلف عن anon!)
SUPABASE_DB_URL=postgresql://postgres:<pwd>@db.xxxxx.supabase.co:5432/postgres
```

### 4. تطبيق الـ migrations

```powershell
npx supabase link --project-ref xxxxx
npm run db:push
```

### 5. تعطيل Email Confirmation (للـ dev فقط)

في Supabase Dashboard → **Authentication → Providers → Email**:
- اطفي **Confirm email**
- (في production فعّلها مع SMTP خارجي مثل Resend)

### 6. إعداد Google OAuth (اختياري)

في Dashboard → **Authentication → Providers → Google**:
- فعّل
- ضع `Client ID` و `Client Secret` من Google Cloud Console
- أضف `http://localhost:3000/auth/callback` في Redirect URLs

### 7. إنشاء أول Super Admin

```powershell
npm run seed:admin -- --email you@example.com --password 'StrongP@ssw0rd!'
```

### 8. تشغيل dev server

```powershell
npm run dev
# → http://localhost:3000
```

### 9. فحص صحة الإعداد

```powershell
npm run diagnose
```

يجب أن يطبع:
```
✅ Service role key role: service_role
✅ teachers — 0 rows
✅ site_hero_slides — 3 rows
✅ Super admin: you@example.com
```

---

## 📜 السكربتات المتاحة

| الأمر | الوظيفة |
|------|---------|
| `npm run dev` | Next.js dev server (HMR + Fast Refresh) |
| `npm run build` | Production build (standalone output) |
| `npm run start` | تشغيل الـ production build |
| `npm run typecheck` | فحص TypeScript بدون emit |
| `npm run lint` | ESLint |
| `npm run test` | Vitest unit tests (watch: `npm run test:watch`) |
| `npm run e2e` | Playwright E2E tests (يبدأ dev server تلقائياً) |
| `npm run db:push` | تطبيق migrations جديدة |
| `npm run db:reset` | حذف DB + إعادة كل migrations + seed |
| `npm run db:types` | توليد TypeScript types من DB live |
| `npm run seed:admin` | إنشاء super admin |
| `npm run diagnose` | فحص شامل لحالة DB والإعدادات |

---

## 📐 الكود Conventions

### Components

```tsx
// ✅ Server component (default)
export default async function MyPage() {
  const data = await getDataFromDB();
  return <div>{data.name}</div>;
}

// ✅ Client component (interactivity)
'use client';
export function InteractiveForm() {
  const [state, action] = useActionState(...);
  return <form action={action}>...</form>;
}
```

**القاعدة**: لا تستخدم `'use client'` إلا عند الحاجة لـ:
- `useState` / `useEffect` / hooks
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`window`, `localStorage`)
- Animations interactions

### Server Actions

```ts
'use server';

export async function someAction(formData: FormData) {
  // 1. Auth check
  const teacher = await getCurrentTeacher();
  if (!teacher) return { error: 'unauthorized' };

  // 2. Validate
  const parsed = schema.safeParse({ /* ... */ });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // 3. Quota check (if applicable)
  try { await assertCanAddStudent(teacher.id); }
  catch (err) { return { error: err.message }; }

  // 4. Do the action via DAL
  try { await createStudent(teacher.id, parsed.data); }
  catch (err) { return { error: err.message }; }

  // 5. Revalidate + redirect
  revalidatePath('/students');
  redirect('/students');
}
```

### DAL (Data Access Layer)

```ts
// lib/dal/students.ts
import { createClient } from '@/lib/supabase/server';

export async function listStudents() {
  const supabase = await createClient();   // user-scoped
  const { data, error } = await supabase
    .from('students').select('*').is('archived_at', null);
  if (error) throw error;                  // let caller handle
  return data ?? [];
}
```

**القواعد**:
- ❌ لا تمرّر `teacher_id` من الـ caller — RLS يستخرجه من الـ session
- ✅ استخدم `createClient()` للقراءات العادية
- ✅ استخدم `createServiceRoleClient()` للـ admin/onboarding (مع `ensureAdmin()`)
- ✅ ارمِ الأخطاء (throw) — السياسات تحدد كيف تتعامل معها

### Validations

```ts
// lib/validations/student.ts
import { z } from 'zod';

export const studentSchema = z.object({
  name_ar: z.string().trim().min(2).max(120),
  phone: z.string().trim().optional().or(z.literal('')),
});

export type StudentInput = z.infer<typeof studentSchema>;
```

استخدمها في:
- Forms (`@hookform/resolvers/zod`)
- Server actions (`schema.safeParse(formData)`)

### Styling

```tsx
// ✅ Use logical properties for RTL/LTR
<div className="ms-2 me-4 ps-3 pe-3" />

// ❌ Avoid directional properties
<div className="ml-2 mr-4 pl-3 pr-3" />

// ✅ Use design tokens from globals.css
<button className="bg-primary-700 text-white rounded-card" />

// ✅ Use Tailwind v4 @theme variables in inline styles
<div style={{ backgroundImage: 'var(--gradient-aurora)' }} />
```

### Date Handling

```ts
import { formatDate, formatDateTime } from '@/lib/utils/dates';

// ✅ Always use these helpers — they handle null/undefined safely
formatDate(student.date_of_birth)         // → '15 مايو 2026' or '—'
formatDateTime(session.scheduled_at)      // → 'الجمعة 15 مايو, 4:00 م'

// ❌ Never use directly
new Date(maybe_null_value).toLocaleString()  // crashes on null
```

### Numerals & Currency

```ts
import { formatCurrencyEGP, toArabicDigits } from '@/lib/utils/numerals';

formatCurrencyEGP(1234.5)              // → '1,234.50 ج.م.‏'
toArabicDigits(2026)                   // → '٢٠٢٦' (للـ print/CMS فقط)
```

---

## 🧩 إنشاء ميزة جديدة (Walkthrough)

### مثال: إضافة ميزة "ملاحظات الطالب"

#### 1. Migration

```sql
-- supabase/migrations/0015_student_notes.sql
create table student_notes (
  id          uuid primary key default uuid_generate_v4(),
  teacher_id  uuid not null references teachers on delete cascade,
  student_id  uuid not null references students on delete cascade,
  body        text not null,
  created_at  timestamptz default now()
);

create index student_notes_student_idx on student_notes (student_id);

alter table student_notes enable row level security;

create policy student_notes_tenant_read on student_notes for select
  using (teacher_id = public.my_teacher_id() or public.is_super_admin());

create policy student_notes_tenant_write on student_notes for all
  using (teacher_id = public.my_teacher_id())
  with check (teacher_id = public.my_teacher_id());

create trigger _audit after insert or update or delete on student_notes
  for each row execute function audit_trigger();
```

#### 2. Validation

```ts
// lib/validations/student-note.ts
import { z } from 'zod';
export const studentNoteSchema = z.object({
  student_id: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
});
```

#### 3. DAL

```ts
// lib/dal/student-notes.ts
import { createClient } from '@/lib/supabase/server';

export async function listStudentNotes(studentId: string) {
  const sb = await createClient();
  const { data, error } = await sb
    .from('student_notes').select('*')
    .eq('student_id', studentId).order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createStudentNote(teacherId: string, input: { student_id: string; body: string }) {
  const sb = await createClient();
  const { error } = await sb.from('student_notes').insert({
    teacher_id: teacherId, ...input,
  });
  if (error) throw error;
}
```

#### 4. Server Action

```ts
// app/(teacher)/students/[id]/notes/actions.ts
'use server';
import { revalidatePath } from 'next/cache';
import { studentNoteSchema } from '@/lib/validations/student-note';
import { createStudentNote } from '@/lib/dal/student-notes';
import { getCurrentTeacher } from '@/lib/dal/teachers';

export async function addNoteAction(_prev: any, formData: FormData) {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { error: 'unauthorized' };
  const parsed = studentNoteSchema.safeParse({
    student_id: formData.get('student_id'),
    body: formData.get('body'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await createStudentNote(teacher.id, parsed.data);
  revalidatePath(`/students/${parsed.data.student_id}`);
  return { ok: true };
}
```

#### 5. UI

أضف form في `app/(teacher)/students/[id]/page.tsx` يستدعي الـ action.

#### 6. Test

```ts
// e2e/student-notes.spec.ts
test('teacher adds note to student', async ({ page }) => {
  await login(page, 'teacher@test.com');
  await page.goto('/students/<id>');
  await page.fill('textarea[name="body"]', 'ملاحظة تجريبية');
  await page.click('button:has-text("إضافة")');
  await expect(page.getByText('ملاحظة تجريبية')).toBeVisible();
});
```

---

## 🐛 Debug Tips

### Server Component logs
- تظهر في **terminal الـ dev server** (وليس browser console)
- استخدم `console.log` بحرية في server components

### Client Component logs
- تظهر في **browser DevTools console** (F12)

### Database queries
- `npm run diagnose` — فحص شامل
- `scripts/test-dashboard.ts` — تجريب RLS بـ session حقيقي
- Supabase Dashboard → SQL Editor — لتجربة استعلامات يدوياً

### Network requests
- DevTools → Network — راقب الـ Server Actions و RSC payloads

### Hydration errors
- عادة بسبب server/client mismatch (مثل `Date.now()` يختلف)
- استخدم `useEffect` للقيم اللي تختلف بين server و client

---

## 📦 Adding a Dependency

```powershell
npm install <package>           # runtime
npm install -D <package>        # dev only
```

ثم تأكد من:
- Bundle size: لا تضف packages كبيرة بدون داعي
- Tree-shaking: استورد named exports فقط
- Server-only: ضع `'server-only'` import في الملفات الحساسة

---

## 🔄 Workflow اليومي

```powershell
# 1. اسحب آخر التحديثات
git pull origin main

# 2. ثبّت الـ deps الجديدة (لو فيه)
npm install

# 3. شغّل dev server
npm run dev

# 4. اشتغل على الـ feature
# ... edit files ...

# 5. تحقق من TypeScript
npm run typecheck

# 6. شغّل tests
npm run test

# 7. commit + push
git add .
git commit -m "feat: add student notes"
git push
```

</div>
