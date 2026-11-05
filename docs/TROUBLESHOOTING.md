<div dir="rtl">

# 🐛 Troubleshooting

دليل المشاكل الشائعة وحلولها — مرتبة حسب نوع الخطأ.

---

## 🔥 Quick Diagnostics

أول خطوة قبل أي debugging:

```powershell
npm run diagnose
```

سيُظهر:
- ✅/❌ كل الجداول
- Service role key role
- Super admin existence
- Recent audit logs

---

## 🚨 الأخطاء الشائعة

### 1. "Could not find the table 'public.X' in the schema cache"

**السبب**: الـ migration لم يُطبَّق.

**الحل**:
```powershell
npm run db:push
# أو يدوياً عبر Supabase Dashboard → SQL Editor
```

---

### 2. "infinite recursion detected in policy for relation 'X'"

**السبب**: RLS policies تستعلم من جداول لها policies تستعلم من نفس الجدول.

**الحل**: تأكد من تطبيق migration `0012_fix_rls_recursion.sql` و `0014_fix_is_super_admin.sql`. كلا الإصلاحين يستخدمون `SECURITY DEFINER` functions.

---

### 3. "permission denied for table users" (42501)

**السبب**: دالة `is_super_admin()` كانت `SECURITY INVOKER` وتحاول قراءة `auth.users` التي لا يملك authenticated role صلاحية SELECT عليها.

**الحل**: migration `0014_fix_is_super_admin.sql` يحوّلها لـ `SECURITY DEFINER`.

---

### 4. "missing required error components, refreshing..."

**السبب**: chunks قديمة في المتصفح بعد deletion `.next/`.

**الحل**:
```powershell
# في dev server terminal
Ctrl+C
Remove-Item -Recurse -Force .next
npm run dev

# في المتصفح
Ctrl + Shift + R   # hard refresh
```

---

### 5. "email rate limit exceeded" (429)

**السبب**: Supabase Free tier محدود بـ ~4 رسائل تأكيد/ساعة.

**الحل** (للـ dev):
1. Supabase Dashboard → Authentication → Providers → Email
2. اطفي **Confirm email**

**الحل** (للـ production):
- اربط SMTP خارجي (Resend، SendGrid، Postmark)
- Dashboard → Settings → Auth → SMTP Settings

---

### 6. الـ Wizard يظهر كل مرة بعد تسجيل الدخول

**السبب**: عمود `onboarded_at` فاضي للمدرس رغم اكتمال الإعداد.

**الحل**: migration `0011_backfill_onboarded_at.sql` يحدث الصفوف القديمة. أيضاً `isTeacherOnboarded()` helper في DAL يستخدم structural proof (subdomain + plan) كـ fallback.

تحقق:
```sql
select id, email, onboarded_at, subdomain, current_plan_id
from teachers;
```

لو `onboarded_at IS NULL` لكن `subdomain` و `current_plan_id` موجودين، الـ migration يصلحه.

---

### 7. Internal Server Error على dev server

**السبب**: ملفات الـ build مفقودة (بعد `rm -rf .next` بدون restart).

**الحل**:
```powershell
Ctrl+C
Remove-Item -Recurse -Force .next
npm run dev
```

---

### 8. "Cannot find module for page: /admin/cms/X"

**السبب**: webpack cache فاسد.

**الحل**:
```powershell
Remove-Item -Recurse -Force .next
npm run build
# أو
npm run dev
```

---

### 9. CSS لا يطبّق (الواجهة بدون ألوان)

**السبب**: ملف `globals.css` لم يُحمّل، أو Tailwind v4 cache.

**الحل**:
1. تحقق من `app/layout.tsx` فيه `import './globals.css'`
2. تحقق من `postcss.config.mjs` فيه `@tailwindcss/postcss`
3. Hard refresh (`Ctrl+Shift+R`)
4. إذا استمرت: `Remove-Item -Recurse -Force .next` ثم `npm run dev`

---

### 10. "Cannot read properties of null (reading 'X')"

عادة في Server Component يصل لخاصية على object null.

**الأمثلة الشائعة + حلول**:

| الخطأ | الحل |
|------|------|
| `student.date_of_birth.toString()` | استخدم `formatDate()` helper اللي يتعامل مع null |
| `row.group.id` (في student_groups join) | filter `(r) => r?.group` قبل الـ map |
| `teacher.name_ar.charAt(0)` | استخدم `?.` و fallback: `teacher.name_ar?.[0] ?? '?'` |

---

### 11. `wizard` يحفظ لكن الـ dashboard يعيد توجيهه

**السبب**: نفس السبب (8) — `onboarded_at` لم يُحفَظ.

**الحل**: تأكد من تطبيق migrations 0011 + 0012 + 0014. الـ wizard action يحفظ `onboarded_at: new Date().toISOString()` في الـ payload.

---

### 12. Port 3000 already in use

**السبب**: dev server آخر يشغّل نفس الـ port.

**الحل**:
```powershell
# Windows
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# أو شغّل على port مختلف
$env:PORT=3001; npm run dev
```

---

### 13. "Failed to compile" بعد تعديل ملف

**السبب**: TypeScript أو import error.

**الحل**:
```powershell
npm run typecheck
# اقرأ الخطأ بعناية، أصلحه
```

أو احذف الـ cache:
```powershell
Remove-Item -Recurse -Force .next
```

---

### 14. webpack warnings عن `next-intl/dist`

```
Parsing of next-intl/.../format/index.js for build dependencies failed at 'import(t)'
```

**السبب**: dynamic import في next-intl لا يستطيع webpack تحليله.

**الحل**: ⚠️ **تحذير غير مؤذٍ** — مش خطأ. إذا أزعجك بصرياً، تم إضافة filter في `next.config.mjs`:

```js
config.ignoreWarnings = [
  { module: /next-intl\/dist/, message: /Parsing of/ },
];
```

---

### 15. Migration 0013/0014 يفشل: "policy already exists"

**السبب**: Migrations idempotent لكن الـ policies القديمة مازالت موجودة.

**الحل**: الـ migrations لها `drop policy if exists` قبل الـ create. لو مازال يفشل:

```sql
-- يدوياً في Supabase SQL Editor:
drop policy if exists audit_logs_authenticated_insert on audit_logs;
-- ثم أعد تشغيل npm run db:push
```

---

### 16. "Failed to start server: EADDRINUSE :::3000"

**السبب**: dev server سابق ما اتقفلش.

**الحل**:
```powershell
# Windows PowerShell
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess
Stop-Process -Id <PID> -Force

# أو شغّل على port مختلف
$env:PORT=3001; npm run dev
```

---

## 🔍 Debugging Strategies

### Server Component logs

تظهر في **terminal الـ dev server**:

```ts
console.log('[my-page] data:', JSON.stringify(data));
```

### Client Component logs

تظهر في **DevTools → Console (F12)**:

```ts
'use client';
useEffect(() => { console.log('mounted'); }, []);
```

### Database queries

استخدم سكربتات `scripts/`:
- `npm run diagnose` — فحص شامل
- `tsx scripts/test-dashboard.ts` — تجريب RLS بـ session حقيقي
- `tsx scripts/check-state.ts` — فحص schema + teachers data
- `tsx scripts/test-register.ts` — تجربة signup
- `tsx scripts/test-student-detail.ts` — تجربة student page queries

### Network requests

DevTools → Network → فلتر `Doc` لرؤية:
- RSC payloads
- Server Actions (POST لنفس الـ URL)
- API routes

### Supabase queries

افتح SQL Editor:
```
https://supabase.com/dashboard/project/<ref>/sql/new
```

شغّل استعلامات يدوياً للتحقق:
```sql
-- check RLS policies on a table
select * from pg_policies where tablename = 'students';

-- check what your role sees
set role authenticated;
set "request.jwt.claims" to '{"sub": "<user-id>"}';
select * from students;
reset role;
```

---

## 💡 نصائح عامة

### قبل أي debugging:

1. **اقرأ الخطأ بالكامل** — مش بس السطر الأول
2. **انظر للـ stack trace** — تعرف الملف والسطر
3. **أعد إنتاج المشكلة** خطوة بخطوة
4. **شغّل `npm run diagnose`** للتأكد من DB

### قواعد ذهبية:

- 🔴 **حذف `.next`** = لازم restart الـ dev server بعدها
- 🟡 **تعديل migration**: لا تعدل migration applied، أنشئ migration جديد
- 🟢 **Server Actions** errors تظهر في Server logs (terminal)، مش browser
- 🔵 **RLS errors** عادة 42501 (insufficient_privilege) — تحقق من السياسة

### للأخطاء الجديدة:

1. شغّل: `npm run diagnose`
2. ابحث في الـ migrations: `grep -r "<error-keyword>" supabase/migrations/`
3. شوف الـ logs: `tail -f /var/log/ostazna.log` (production)
4. شوف الـ audit_logs في DB: `select * from audit_logs order by created_at desc limit 20;`

---

## 📞 طلب المساعدة

إذا الحل غير موجود هنا:

1. اجمع المعلومات:
   - رسالة الخطأ الكاملة
   - ملف `.tsx`/`.ts` المسؤول
   - مخرج `npm run diagnose`
   - مخرج dev server من terminal
   - browser console errors (F12)

2. ابحث في GitHub Issues
3. افتح Issue جديد بكل المعلومات

</div>
