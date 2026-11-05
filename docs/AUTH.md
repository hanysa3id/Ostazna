<div dir="rtl">

# 🔐 Authentication & Authorization

## نموذج الأدوار

```
┌──────────────────────────────────────────────────────────────────┐
│  Anonymous     → يرى الـ marketing فقط                           │
├──────────────────────────────────────────────────────────────────┤
│  Authenticated → 1 من 4 أدوار:                                   │
│                                                                  │
│   1. Super Admin     → app_metadata.role = 'super_admin'         │
│      • وصول كامل لكل البيانات                                    │
│      • يدير المنصة + CMS + المدرسين + الاشتراكات                  │
│      • يقدر impersonate أي مدرس                                  │
│                                                                  │
│   2. Teacher         → له صف في `teachers` (user_id matches)     │
│      • يرى بياناته فقط (RLS scoped)                              │
│      • subdomain خاص + onboarding                                │
│                                                                  │
│   3. Student         → له صف في `students` (user_id matches)     │
│      • يرى درجاته/حضوره/مدفوعاته فقط                              │
│      • portal منفصل /student                                     │
│                                                                  │
│   4. Parent          → له صف في `parents` (user_id matches)      │
│      • يرى بيانات أبنائه فقط                                     │
│      • portal منفصل /parent                                      │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔑 طرق المصادقة

| الطريقة | حالتها | الإعداد |
|---------|--------|---------|
| Email + Password | ✅ مفعّل | افتراضي في Supabase |
| Google OAuth | ✅ مفعّل | يتطلب Client ID/Secret في Supabase Dashboard |
| Facebook OAuth | ❌ معطّل عمداً | غير محبذ في السوق المصري |
| Magic Link | ⚙️ متاح للـ admin impersonation فقط | |
| 2FA TOTP | ✅ متاح اختياري | يفعّله المدرس من Settings → Security |

---

## 🌊 تدفق التسجيل

```
Browser                    Server                     Supabase
   │                         │                            │
   │  POST /register         │                            │
   │  email + password ────► │                            │
   │                         │  signUp() ────────────────►│
   │                         │                            │
   │                         │       (creates auth.users) │
   │                         │ ◄───────── { user, session } │
   │                         │                            │
   │ ◄──── redirect ─────────│                            │
   │                         │                            │
   │  GET /onboarding        │                            │
   │  (teacher row missing)  │                            │
   │                         │                            │
   │  POST onboarding wizard │                            │
   │  ────────────────────►  │  service_role.upsert ──────►│
   │                         │  • teachers row             │
   │                         │  • academic_year            │
   │                         │  • grade + subject + group  │
   │                         │  refreshSession() ─────────►│
   │                         │ ◄─── new JWT (with claims)  │
   │ ◄──── redirect /dashboard
```

### نقاط مهمة

- **بعد `signUp`**: لو email confirmation مفعّل → redirect لـ `/verify`. لو معطّل → session فوري + redirect لـ `/onboarding`.
- **في الـ wizard**: نستخدم `service_role` لأن الصف لسه ما اتعملش، فالـ JWT بدون `teacher_id` claim → RLS هترفض الـ insert.
- **بعد الـ wizard**: نستدعي `auth.refreshSession()` لتحديث الـ JWT بـ teacher_id claim جديد (إن كان الـ Custom Token Hook مسجّل).

---

## 🌊 تدفق تسجيل الدخول

```
1. POST /login (email + password)
2. supabase.auth.signInWithPassword()
3. تأكد من أن session كوكي اتحفظ
4. revalidatePath('/', 'layout')
5. توجيه ذكي:
   - إذا app_metadata.role === 'super_admin' → /admin/dashboard
   - إذا فيه next param → ذلك المسار
   - وإلا → /dashboard
```

```ts
// lib/auth/actions.ts
export async function loginAction(_prev, formData) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: 'invalid_credentials' };

  revalidatePath('/', 'layout');
  const isAdmin = (data.user?.app_metadata as any)?.role === 'super_admin';
  redirect(isAdmin ? '/admin/dashboard' : '/dashboard');
}
```

---

## 🛡️ Row Level Security (RLS) Model

### Tenant Read Pattern

```sql
create policy <table>_tenant_read on <table> for select
  using (
    teacher_id = public.my_teacher_id()
    or public.is_super_admin()
  );
```

**`my_teacher_id()`** هي SECURITY DEFINER function:

```sql
create function public.my_teacher_id() returns uuid
language sql stable security definer set search_path = public, auth as $$
  select id from public.teachers where user_id = auth.uid() limit 1;
$$;
```

### لماذا SECURITY DEFINER؟

لو استخدمنا subquery مباشرة في الـ policy:

```sql
-- ❌ هذا يسبب recursion
create policy students_read on students for select
  using (teacher_id in (select id from teachers where user_id = auth.uid()));
```

والـ `teachers` نفسها فيها policy تستعلم من `students` (للـ student portal):

```sql
create policy teachers_student_read on teachers for select
  using (id in (select teacher_id from students where user_id = auth.uid()));
```

→ **infinite recursion** → "42P17 infinite recursion detected".

الـ SECURITY DEFINER function تعمل بصلاحيات الـ owner (postgres) → تتجاوز RLS تماماً → الـ subquery لا تطلق RLS check تاني → لا recursion.

### Write Pattern

```sql
create policy <table>_tenant_write on <table> for all
  using (teacher_id = public.my_teacher_id())              -- لـ UPDATE/DELETE
  with check (teacher_id = public.my_teacher_id());        -- لـ INSERT/UPDATE
```

---

## 🎫 Custom Access Token Hook (اختياري لكن موصى به)

ينقل عبء `my_teacher_id()` من query → JWT claim:

```sql
create function public.add_custom_claims(event jsonb) returns jsonb
language plpgsql stable security definer set search_path = public, auth as $$
declare
  uid uuid := (event->>'user_id')::uuid;
  tid uuid;
  is_admin boolean;
  claims jsonb := coalesce(event->'claims', '{}'::jsonb);
begin
  select id into tid from teachers where user_id = uid;
  if tid is not null then
    claims := jsonb_set(claims, '{teacher_id}', to_jsonb(tid::text));
  end if;

  select coalesce((raw_app_meta_data ->> 'role') = 'super_admin', false)
    into is_admin from auth.users where id = uid;
  if is_admin then
    claims := jsonb_set(claims, '{role}', '"super_admin"');
  end if;

  return jsonb_set(event, '{claims}', claims);
end; $$;
```

**كيفية تسجيله**:
1. Supabase Dashboard → Auth → Hooks
2. Add new hook → Custom Access Token
3. Schema: `public`, Function: `add_custom_claims`
4. Enable

**لاحظ**: حتى بدون الـ Hook، الـ RLS تعمل صح بسبب fallback functions. الـ Hook يحسّن الأداء فقط.

---

## 🦸 Super Admin

### الإنشاء

```bash
npm run seed:admin -- --email you@example.com --password 'StrongP@ss1'
```

السكربت يستدعي `auth.admin.createUser` بـ `app_metadata: { role: 'super_admin' }`.

### الفحص

في الكود:
```ts
const isAdmin = (user.app_metadata as any)?.role === 'super_admin';
```

في الـ policies:
```sql
public.is_super_admin()
```

دالة `is_super_admin()` تتحقق من:
1. `auth.jwt() ->> 'role'` (إذا الـ Hook مسجّل)
2. fallback لـ `auth.users.raw_app_meta_data ->> 'role'` مباشرة

### الصفحات المحمية

`(admin)/layout.tsx` يفرض الفحص:

```ts
if (!user) redirect('/login');
const isAdmin = (user.app_metadata as any)?.role === 'super_admin';
if (!isAdmin) redirect('/dashboard');
```

---

## 🎭 Impersonation

Super Admin يقدر يدخل كأي مدرس لأغراض الدعم:

```ts
// app/(admin)/admin/teachers/[id]/actions.ts
export async function impersonateAction(formData: FormData) {
  await ensureAdmin();
  const teacherId = String(formData.get('teacher_id'));
  const sb = createServiceRoleClient();
  const { data: teacher } = await sb.from('teachers').select('email').eq('id', teacherId).single();

  // 1. Generate magic link
  const { data: link } = await sb.auth.admin.generateLink({
    type: 'magiclink', email: teacher.email,
  });

  // 2. Use it on the user-scoped client to set cookies
  const userClient = await createClient();
  await userClient.auth.verifyOtp({
    type: 'magiclink', token_hash: link.properties.hashed_token,
  });

  // 3. Mark in cookie + audit log
  await markImpersonating(admin.id, teacherId);
  await sb.from('audit_logs').insert({ action: 'IMPERSONATE_START', ... });

  redirect('/dashboard');
}
```

**الحماية**:
- المدرس يرى banner أصفر في الـ dashboard ("أنت تستخدم وضع المنتحل")
- كل عملية تُسجَّل في `audit_logs` مع `actor_id` = admin's user_id
- الجلسة الحالية للأدمن **تُستبدل** بجلسة المدرس → الأدمن يحتاج تسجيل دخول جديد بعد الانتهاء

**إنهاء الجلسة**:
```ts
export async function endImpersonationAction() {
  // logout + clear impersonation cookie
}
```

---

## 🔒 2FA TOTP

كل مدرس يقدر يفعّل 2FA من `/settings/security`:

```ts
// 1. Enroll
const { data } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
// data.totp.qr_code = SVG QR
// data.totp.secret = manual entry key

// 2. Challenge + Verify (يدخل المستخدم الـ 6 أرقام)
const { data: c } = await supabase.auth.mfa.challenge({ factorId });
await supabase.auth.mfa.verify({ factorId, challengeId: c.id, code });
```

بعد التفعيل، الـ AAL (Authenticator Assurance Level) ينتقل لـ `aal2`. يمكنك حماية صفحات معينة بهذا المستوى:

```ts
const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
if (aal.data.currentLevel !== 'aal2') redirect('/auth/mfa-challenge');
```

---

## 👨‍👩‍👧 Parent & Student Linking

### Student → User Account

1. الطالب يسجّل حساب عبر `/register` العادي
2. المدرس يفتح ملف الطالب → "ربط حساب" → يدخل بريد الطالب
3. السكربت يجد الـ auth user بالبريد ويحدّث `students.user_id = auth_user.id`
4. الطالب يدخل ويرى `/student` portal

```ts
// app/(teacher)/students/[id]/link-account/actions.ts
const { data: list } = await admin.auth.admin.listUsers();
const user = list.users.find(u => u.email === email);
await sb.from('students').update({ user_id: user.id }).eq('id', studentId);
```

### Parent → Student(s)

نفس المبدأ لكن جدول `parents` + `parent_students` join.

---

## 🛣️ Middleware

`middleware.ts` يعمل على كل request:

```ts
1. updateSession(request)      // يجدد كوكيز الـ auth
2. host detection              // ostazna.com / admin.ostazna.com / *.ostazna.com / custom domain
3. path detection              // /admin/* / /dashboard / /login
4. enforce rules:
   - protected routes تتطلب user → otherwise redirect /login
   - auth routes للمسجّل دخوله → redirect /dashboard
   - subdomain → rewrite /s/<sub>/...
   - custom domain → rewrite /s/@host:<host>/...
```

---

## 🚧 Service Role Usage

استخدام **حذر** للـ service role (يتجاوز RLS):

```ts
// lib/supabase/server.ts
export function createServiceRoleClient() {
  // ⚠️ يبدّل JWT لـ service_role → كل RLS يتجاوز
  return createClient<Database>(URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, detectSessionInUrl: false },
  });
}
```

**القاعدة الذهبية**: قبل أي استدعاء، تحقّق من المستخدم بالـ user-scoped client:

```ts
async function ensureAdmin() {
  const sb = await createClient();          // user-scoped
  const { data: { user } } = await sb.auth.getUser();
  if (!user || (user.app_metadata as any)?.role !== 'super_admin') {
    throw new Error('forbidden');
  }
  return { user };
}
```

ثم استخدم service role للعملية الفعلية:

```ts
await ensureAdmin();
const sb = createServiceRoleClient();
await sb.from('teachers').update({ ... }).eq('id', teacherId);
```

**حالات الاستخدام المشروعة**:
- ✅ Super Admin pages (الـ layout يفرض role)
- ✅ Onboarding (الصف لسه ما اتعملش)
- ✅ Webhook handlers (لا يوجد user session)
- ✅ Cron jobs / Edge Functions

**حالات يجب تجنبها**:
- ❌ القراءات العادية للمدرس (استخدم RLS)
- ❌ تجاوز RLS بدون authentication check واضح
- ❌ نقل البيانات بين tenants

</div>
