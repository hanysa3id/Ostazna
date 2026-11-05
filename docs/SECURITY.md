<div dir="rtl">

# 🔒 Security Model

## فلسفة الأمان

> **"كل بايت يخص مدرس واحد، يبقى معزول عنه عن غيره — سواء وقت القراءة أو الكتابة."**

نطبّق نموذج **defense-in-depth** بطبقات متعددة:

1. **Network**: Cloudflare proxy + UFW firewall
2. **Transport**: HTTPS مع HSTS، wildcard SSL تلقائي
3. **Application**: Middleware auth check + role enforcement في layouts
4. **Database**: Row Level Security على كل الجداول
5. **Audit**: كل عملية تُسجّل في audit_logs (append-only)
6. **Backup**: نسخ يومية مشفّرة على B2

---

## 🛡️ Multi-tenancy Isolation

### النموذج

كل بيانات حساسة عندها عمود `teacher_id`. RLS يضمن:

```sql
-- مدرس A لا يقدر يقرأ بيانات مدرس B (حتى لو حاول مباشرة)
create policy <table>_tenant_read on <table> for select
  using (
    teacher_id = public.my_teacher_id()
    or public.is_super_admin()
  );
```

`my_teacher_id()` و `is_super_admin()` هما `SECURITY DEFINER` functions تعمل بصلاحيات owner — لا تستطيع تجاوزها من client code.

### اختبار الـ Isolation

نختبر بـ pgTAP:

```sql
-- supabase/tests/rls.spec.sql
-- Setup: 2 teachers, 1 student each
-- Login as teacher A
set local request.jwt.claims to (json_build_object('sub', user_a_id))::text;

-- ✅ يرى طلابه
select count(*) from students;
-- expected: 1

-- ❌ لا يرى طلاب الآخرين
select count(*) from students where teacher_id = teacher_b_id;
-- expected: 0

-- ❌ لا يقدر يكتب لطالب آخر
insert into students (teacher_id, name_ar) values (teacher_b_id, 'sneaky');
-- expected: throws 42501
```

---

## 🎫 Authentication Layers

### 1. Supabase Auth (GoTrue)

- Email/password بـ bcrypt hashing
- Google OAuth 2.0
- JWT tokens (1 hour expiry, auto-refresh)
- httpOnly cookies (لا يمكن قراءتها بـ JavaScript)
- Same-site cookies

### 2. Middleware Enforcement

```ts
// middleware.ts
const PROTECTED_PREFIXES = ['/dashboard', '/students', ..., '/admin'];
if (PROTECTED_PREFIXES.some(p => path.startsWith(p))) {
  if (!user) return NextResponse.redirect('/login?next=' + path);
}
```

### 3. Layout-level Authorization

```tsx
// app/(admin)/layout.tsx
const isAdmin = (user.app_metadata as any)?.role === 'super_admin';
if (!isAdmin) redirect('/dashboard');
```

### 4. RLS on every database operation

```sql
-- Even if app code is bypassed, RLS protects data
-- Example: someone tries `curl https://api.supabase.co/rest/v1/students` with stolen token
-- → RLS sees their teacher_id from JWT and only returns their own rows
```

---

## 🚨 Threat Model

### Top Threats + Mitigations

| التهديد | المخاطر | الحل |
|---------|--------|------|
| **مدرس يحاول قراءة بيانات مدرس آخر** | تسريب بيانات tenant cross | RLS على كل جدول |
| **هجوم XSS** | سرقة JWT tokens | httpOnly cookies + CSP headers + sanitization |
| **SQL Injection** | تنفيذ SQL ضار | Supabase JS uses parametrized queries always |
| **CSRF** | تنفيذ عمليات نيابة عن المستخدم | Server Actions + same-site cookies |
| **Brute force على كلمة المرور** | تخمين كلمات مرور | Supabase rate limiting + (مستقبل: Upstash custom) |
| **سرقة Service Role Key** | كل DB exposed | لا تظهر في client bundle، secrets في .env فقط |
| **DDoS** | downtime | Cloudflare proxy |
| **Lost backups** | فقدان بيانات | Encrypted restic backups + quarterly drill |
| **Insider threat (admin مارق)** | تعديل/حذف كثيف | كل عمليات admin مسجلة في audit_logs (immutable) |

---

## 🔑 Secrets Management

### القواعد

- ❌ **لا** تضع secrets في الكود
- ❌ **لا** تكوميت `.env.local` أو `.env.production`
- ❌ **لا** تستخدم service role في client-side code
- ✅ كل secrets في `.env.local` (dev) أو `.env.production` (VPS)
- ✅ `.gitignore` يستبعد كل `.env*` ما عدا `.env.example`
- ✅ في production، `.env.production` بصلاحيات `600 deploy:deploy`

### الـ Secrets المطلوبة

| المتغير | الاستخدام | السرّية |
|--------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | API endpoint | منخفضة (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side queries | منخفضة (محدود بـ RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only (يتجاوز RLS) | **🔴 CRITICAL** |
| `SUPABASE_DB_URL` | Direct DB access | **🔴 CRITICAL** |
| `RESEND_API_KEY` | إرسال إيميلات | عالية |
| `CF_API_TOKEN` | Caddy DNS challenge | عالية |
| `B2_ACCOUNT_KEY` | Backups | **🔴 CRITICAL** |
| `RESTIC_PASSWORD` | تشفير backups | **🔴 CRITICAL** |
| `VAPID_PRIVATE_KEY` | Web Push signing | متوسطة |
| `CRON_SECRET` | حماية Edge Function | عالية |

### تدوير المفاتيح (Key Rotation)

ربع سنوياً أو عند الشك في تسريب:

1. أنشئ key جديد في الخدمة (Supabase / B2 / etc.)
2. حدّث `.env.production` على VPS
3. `docker compose restart app`
4. عطّل الـ key القديم
5. سجّل التدوير في audit log داخلي

---

## 🛡️ RLS Best Practices

### النمط المعتمد

```sql
-- ✅ READ: استخدم helper function (لا recursion)
create policy X_read on X for select
  using (teacher_id = public.my_teacher_id() or public.is_super_admin());

-- ✅ WRITE: with check للـ INSERT/UPDATE
create policy X_write on X for all
  using (teacher_id = public.my_teacher_id())
  with check (teacher_id = public.my_teacher_id());
```

### ❌ ما يجب تجنّبه

```sql
-- ❌ subquery على جدول له policy تستعلم من X → recursion
using (teacher_id in (select id from teachers where user_id = auth.uid()))

-- ❌ السماح للـ user role بالكتابة على جداول حساسة
create policy X_write on X for all using (true);

-- ❌ الاعتماد على JWT claim بدون fallback
using (teacher_id = (auth.jwt() ->> 'teacher_id')::uuid)
-- لو الـ Custom Token Hook غير مسجّل → claim missing → policy fails silently
```

### اختبار RLS

دائماً اختبر RLS بـ session حقيقي:

```ts
// scripts/test-dashboard.ts
const { data: link } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
const userClient = createClient(URL, ANON_KEY);
await userClient.auth.verifyOtp({ type: 'magiclink', token_hash: link.properties.hashed_token });
// الآن userClient عنده session حقيقي للمستخدم
const { data, error } = await userClient.from('X').select('*');
```

---

## 📜 Audit Logging

### ماذا نسجّل

كل عملية WRITE على الجداول الحساسة:
- `teacher_id` (محدد الـ tenant)
- `actor_id` (auth.uid() الذي نفّذ)
- `action` (INSERT / UPDATE / DELETE)
- `entity_type` (اسم الجدول)
- `entity_id` (UUID للصف)
- `old_values` (jsonb للـ UPDATE/DELETE)
- `new_values` (jsonb للـ INSERT/UPDATE)
- `ip_address` (مستقبل)
- `user_agent` (مستقبل)
- `created_at`

### Trigger function

```sql
create function audit_trigger() returns trigger
language plpgsql security definer set search_path = public, auth as $$
begin
  perform set_config('row_security', 'off', true);  -- bypass RLS for the audit insert
  insert into audit_logs(...) values (...);
  return coalesce(NEW, OLD);
end; $$;
```

مرفوع كـ AFTER trigger على: `teachers`, `students`, `groups`, `sessions`, `attendance`, `payments`, `subscriptions`, `expenses`, `invoices`, `exams`, `parents`, `assistants`, `notifications`, `cms_pages`.

### ضمان الـ append-only

```sql
-- audit_logs: only INSERT allowed for authenticated users
-- UPDATE/DELETE only for super_admin (rare)
create policy audit_logs_authenticated_insert on audit_logs for insert
  to authenticated with check (true);
create policy audit_logs_admin_modify on audit_logs for update
  using (public.is_super_admin()) with check (public.is_super_admin());
create policy audit_logs_admin_delete on audit_logs for delete
  using (public.is_super_admin());
```

### Impersonation Logging

عمليات Super Admin's impersonation تُسجَّل بوضوح:

```ts
await sb.from('audit_logs').insert({
  teacher_id: targetTeacherId,
  actor_id: adminUserId,           // ← الأدمن، ليس المدرس
  actor_role: 'super_admin',
  action: 'IMPERSONATE_START',
  entity_type: 'teachers',
  entity_id: targetTeacherId,
});
```

---

## 🔐 Storage Security

### Bucket Strategy

```
public buckets (CDN-friendly):
  • avatars/   — صور المدرسين
  • logos/     — شعارات المدرسين
  • cms/       — صور CMS

private buckets (signed URLs only):
  • receipts/  — إيصالات المصروفات (مالية حساسة)
```

### RLS على Storage

```sql
-- الكتابة: فقط المدرس صاحب الـ folder
-- Path convention: <teacher_id>/<entity>/<filename>
create policy <bucket>_owner_write on storage.objects for insert
  with check (
    bucket_id = '<bucket>'
    and storage.path_teacher_id(name) in (select id from teachers where user_id = auth.uid())
  );
```

### Validation عند الرفع

```tsx
// components/shared/image-uploader.tsx
const path = `${teacherId}/${entity}/${crypto.randomUUID()}.${ext}`;
await supabase.storage.from(bucket).upload(path, file, {
  upsert: true,
  contentType: file.type,
});
```

- File size limit: 5-10 MB حسب الـ bucket
- MIME type whitelist: `image/png`, `image/jpeg`, `image/webp`, `application/pdf`
- Path يبدأ بـ `<teacher_id>/` → RLS يفرض الصاحب

---

## 🛂 OAuth Security

### Google OAuth

- Authorized redirect URIs: `<origin>/auth/callback` فقط
- Client secret لا يظهر في client bundle
- `state` parameter يحمي من CSRF (Supabase يدير هذا)

---

## 📧 Email Security

### Resend Setup

- SPF + DKIM + DMARC في Cloudflare DNS
- API key بصلاحيات إرسال فقط (لا قراءة)
- لا تضع HTML من user input بدون sanitize

---

## 🔥 Incident Response

### عند اكتشاف اختراق محتمل

1. **عزل**: 
   - `docker compose stop app` (يوقف الواجهة لكن DB مفتوح)
   - أو في Supabase Dashboard → Pause API
2. **حقّق**:
   - `select * from audit_logs where created_at > now() - interval '7 days'`
   - راجع access logs (Cloudflare + Caddy)
3. **حدّد التأثير**:
   - أي بيانات تأثرت؟
   - كم مستخدم؟
4. **استعد**:
   - إن لزم: استعادة backup قبل الاختراق
   - أنشئ migration للإصلاح
5. **اتصل**:
   - Notify المتأثرين خلال 72 ساعة (GDPR)
   - audit log داخلي للحادث
6. **منع**:
   - أصلح الثغرة
   - أضف monitoring جديد

---

## 📋 Security Checklist للـ Production

قبل الإطلاق:

- [ ] كل secrets في `.env.production` بـ permissions `600`
- [ ] SSL مفعّل (HSTS + HTTP/3)
- [ ] Email confirmation مفعّل في Supabase
- [ ] SMTP خارجي (Resend) مضبوط
- [ ] Custom Access Token Hook مسجّل
- [ ] Backups تعمل + اختبار restore ناجح
- [ ] Rate limiting على /auth/* (Supabase + Upstash)
- [ ] Sentry / GlitchTip للـ error tracking
- [ ] Cloudflare WAF rules
- [ ] فحص جميع pgTAP RLS tests passing
- [ ] لا secrets في client bundle (`grep -r SUPABASE_SERVICE_ROLE_KEY .next/`)
- [ ] privacy.md + terms.md مراجعة قانونياً

</div>
