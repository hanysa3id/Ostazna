# 🎓 أستاذنا (Ostazna) — منصة إدارة أعمال المدرسين
## Claude Code Implementation Prompt — النسخة الشاملة

---

## 📌 نظرة عامة على المشروع

**اسم المنصة:** أستاذنا / Ostazna  
**الدومين:** ostazna.com  
**النوع:** SaaS Platform — منصة خدمات كـ اشتراك شهري  
**الجمهور المستهدف:** المدرسون الخصوصيون الأفراد في مصر  
**الهدف الجوهري:** نقل أعمال المدرس الخصوصي من الأوف لاين إلى الأون لاين بشكل متكامل — إدارة الطلاب والجدول والمالية بلمسة تكنولوجية عصرية.  
**السوق:** مصر (مرحلة أولى) — ابتدائي، إعدادي، ثانوي  
**اللغة:** ثنائية اللغة من البداية (العربية RTL أساسية + الإنجليزية LTR)  
**المنصة:** ويب أولاً (PWA) ثم تطبيق موبايل لاحقاً  

---

## 🏗️ الـ Tech Stack المطلوب

```
Frontend:     Next.js 14+ (App Router) — TypeScript
Styling:      Tailwind CSS + shadcn/ui
Backend:      Supabase (PostgreSQL + Auth + Storage + Realtime + Edge Functions)
Deployment:   Vercel (Frontend) + Supabase Cloud (Backend)
Auth:         Supabase Auth (Email/Password + Google OAuth + Facebook OAuth)
Notifications: Supabase Realtime + Web Push (PWA) + WhatsApp Business API
Charts:       Recharts أو Chart.js
Export:       jsPDF + xlsx + react-to-print
i18n:         next-intl (Arabic RTL + English LTR)
2FA:          TOTP عبر Supabase Auth (معطل بشكل افتراضي)
DNS/Subdomain: Wildcard DNS على ostazna.com → *.ostazna.com
```

---

## 👥 أدوار المستخدمين (User Roles)

### 1. Super Admin (مدير المنصة)
- وصول كامل لكل شيء في المنصة
- إدارة حسابات المدرسين (إنشاء، تعديل، تعليق، أرشفة)
- تسجيل الدخول كأي مدرس لأغراض الدعم الفني (Impersonation)
- إدارة الخطط والأسعار والـ Add-ons
- إدارة الـ Domains والـ Subdomains
- Audit Log شامل لكل عملية
- لوحة تحليلية (Analytics) للمنصة بالكامل
- إدارة بوابات الدفع المقبولة

### 2. Teacher (المدرس)
- الحساب الرئيسي المشترك
- وصول كامل لجميع وظائف الخطة المشترك فيها
- إدارة صلاحيات المساعد/السكرتير
- إعداد Subdomain + CMS الخاص به

### 3. Assistant / Secretary (المساعد / السكرتير)
- Add-on مدفوع منفصل
- الصلاحيات يحددها المدرس بالكامل (Granular Permissions)
- يمكن تفعيل/تعطيل: تسجيل الحضور، استلام المدفوعات، إضافة طلاب، إرسال إشعارات، عرض التقارير

### 4. Student (الطالب)
- حساب منفصل بمنح المدرس له صلاحية الوصول
- يرى: جدول حصصه، درجاته، حضوره وغيابه، فواتيره، اختباراته القادمة، تقاريره
- طريقة إنشاء الحساب: إما المدرس يضيفه مباشرة، أو الطالب يسجل عبر رابط دعوة خاص بالمدرس

### 5. Parent / Guardian (ولي الأمر)
- Add-on مدفوع (بوابة ولي الأمر)
- حساب مرتبط بحساب الطالب
- يرى ما يحدده المدرس فقط

---

## 💳 نموذج الاشتراك والإيراد

### الخطة الأساسية — 1000 جنيه/شهر
تشمل بشكل إلزامي:
- إدارة الطلاب (حتى 500 طالب)
- إدارة الجدول الأسبوعي + الحصص المخصصة
- تسجيل الحضور والغياب (يدوي)
- الإدارة المالية (إيرادات + مصروفات)
- التقارير الأساسية
- إدارة المجموعات
- إشعارات داخل المنصة
- Subdomain تلقائي
- CMS أساسي للصفحة الشخصية
- حساب المدرس الواحد

### الـ Add-ons (كل واحد مستقل تماماً)
| الـ Add-on | الوصف |
|-----------|-------|
| **الاختبارات الإلكترونية** | إنشاء ونشر اختبارات أونلاين |
| **تكامل واتساب** | إشعارات عبر WhatsApp Business API |
| **الفواتير الرسمية** | إصدار وطباعة فواتير رسمية PDF |
| **حساب المساعد/السكرتير** | إضافة مستخدم ثانٍ بصلاحيات مخصصة |
| **التقارير المتقدمة** | Charts + تحليلات متعمقة |
| **بوابة ولي الأمر** | حساب منفصل لولي الأمر |
| **Theme Builder المتقدم** | بناء ثيمات مخصصة كاملة |
| **المدونة + الصفحات المخصصة** | CMS متقدم لصفحات إضافية |

> ⚠️ كل Add-on يعمل بشكل مستقل تماماً، ويمكن تفعيله/تعطيله دون التأثير على الخصائص الأساسية. كل Add-on عبارة عن وحدة برمجية مستقلة Modular.

### منطق الاشتراك والتجديد
- دفع المدرس: نقداً أو تحويل بنكي أو محفظة إلكترونية (يحددها Super Admin)
- Super Admin يؤكد الدفع يدوياً ويفعّل الاشتراك
- عند انتهاء الاشتراك: تجميد الحساب (عرض البيانات فقط بدون تعديل)
- بعد 30 يوماً من التجميد: حجب البيانات + أرشفة الحساب تلقائياً
- يمكن استعادة الحساب المؤرشف عند التجديد

---

## 🗂️ قاعدة البيانات — Supabase Schema

### الجداول الأساسية

```sql
-- المدرسون
teachers (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  name_ar text,
  name_en text,
  email text UNIQUE,
  phone text,
  avatar_url text,
  subdomain text UNIQUE,
  custom_domain text,
  subscription_status enum('trial','active','frozen','archived'),
  subscription_start date,
  subscription_end date,
  plan_id uuid,
  settings jsonb,  -- إعدادات المدرس الكاملة
  created_at timestamptz,
  updated_at timestamptz
)

-- الخطط والـ Add-ons
plans (id, name, price_egp, features jsonb)
addons (id, name, price_egp, description, module_key text UNIQUE)
teacher_addons (id, teacher_id, addon_id, active_from, active_until)

-- السنوات الدراسية
academic_years (
  id uuid,
  teacher_id uuid,
  name text,  -- "2024-2025"
  start_date date,
  end_date date,
  is_current boolean,
  created_at timestamptz
)

-- المراحل الدراسية
grades (
  id uuid,
  teacher_id uuid,
  academic_year_id uuid,
  name text,  -- "الصف الأول الثانوي"
  level enum('primary','preparatory','secondary'),
  created_at timestamptz
)

-- المجموعات
groups (
  id uuid,
  teacher_id uuid,
  academic_year_id uuid,
  grade_id uuid,
  name text,
  subject text,
  max_students int,
  price_per_session decimal,
  price_monthly decimal,
  pricing_type enum('per_session','monthly'),
  schedule jsonb,  -- الجدول الأسبوعي المتكرر
  created_at timestamptz
)

-- الطلاب
students (
  id uuid,
  teacher_id uuid,
  user_id uuid REFERENCES auth.users NULL,
  name_ar text,
  name_en text,
  photo_url text,
  date_of_birth date,
  phone text,
  parent_name text,
  parent_phone text,
  notes text,
  custom_fields jsonb,  -- حقول مخصصة
  created_at timestamptz
)

-- ربط الطلاب بالمجموعات والسنوات
student_groups (
  id uuid,
  student_id uuid,
  group_id uuid,
  academic_year_id uuid,
  joined_at timestamptz,
  is_active boolean
)

-- جدول الحصص
sessions (
  id uuid,
  teacher_id uuid,
  group_id uuid NULL,
  student_id uuid NULL,  -- للحصص الفردية
  title text,
  scheduled_at timestamptz,
  duration_minutes int,
  type enum('recurring','custom','makeup'),
  status enum('scheduled','completed','cancelled'),
  notes text,
  created_at timestamptz
)

-- الحضور والغياب
attendance (
  id uuid,
  session_id uuid,
  student_id uuid,
  status enum('present','absent','late','excused'),
  notes text,
  recorded_by uuid,  -- teacher or assistant
  recorded_at timestamptz
)

-- المدفوعات
payments (
  id uuid,
  teacher_id uuid,
  student_id uuid,
  amount decimal,
  currency text DEFAULT 'EGP',
  payment_date date,
  payment_method enum('cash','bank_transfer','wallet','other'),
  period_from date,
  period_to date,
  notes text,
  invoice_id uuid NULL,
  created_by uuid,
  created_at timestamptz
)

-- الفواتير الرسمية (Add-on)
invoices (
  id uuid,
  teacher_id uuid,
  student_id uuid,
  invoice_number text UNIQUE,
  amount decimal,
  issued_at timestamptz,
  due_date date,
  status enum('draft','issued','paid','cancelled'),
  items jsonb,
  pdf_url text
)

-- المصروفات
expenses (
  id uuid,
  teacher_id uuid,
  category_id uuid,
  amount decimal,
  description text,
  expense_date date,
  receipt_url text,
  created_at timestamptz
)

-- تصنيفات المصروفات
expense_categories (
  id uuid,
  teacher_id uuid,
  name text,  -- "إيجار", "مستلزمات", "إعلانات"
  color text,
  icon text
)

-- الاختبارات (Add-on)
exams (
  id uuid,
  teacher_id uuid,
  title text,
  description text,
  duration_minutes int,
  total_marks int,
  pass_marks int,
  starts_at timestamptz,
  ends_at timestamptz,
  visibility enum('groups','grades','all'),
  target_ids uuid[],  -- IDs of groups or grades
  status enum('draft','published','closed'),
  settings jsonb,
  created_at timestamptz
)

questions (
  id uuid,
  exam_id uuid,
  type enum('mcq','true_false','fill_blank','short_answer','essay','image_upload'),
  question_text text,
  question_image_url text,
  options jsonb,  -- للـ MCQ
  correct_answer jsonb,
  marks int,
  order_index int
)

exam_submissions (
  id uuid,
  exam_id uuid,
  student_id uuid,
  answers jsonb,
  score decimal,
  submitted_at timestamptz,
  graded_at timestamptz,
  graded_by uuid
)

-- درجات الاختبارات الورقية
offline_grades (
  id uuid,
  teacher_id uuid,
  student_id uuid,
  exam_title text,
  score decimal,
  total_marks decimal,
  exam_date date,
  notes text,
  created_at timestamptz
)

-- الإشعارات
notifications (
  id uuid,
  teacher_id uuid,
  target_type enum('student','group','grade','parent','all'),
  target_ids uuid[],
  title text,
  body text,
  channel enum('in_app','push','whatsapp','email'),
  status enum('pending','sent','failed'),
  scheduled_at timestamptz NULL,
  sent_at timestamptz NULL,
  created_at timestamptz
)

-- CMS المدرس
cms_pages (
  id uuid,
  teacher_id uuid,
  slug text,
  title_ar text,
  title_en text,
  content_ar jsonb,  -- Block-based content
  content_en jsonb,
  page_type enum('home','about','contact','gallery','blog','custom'),
  is_published boolean,
  seo_meta jsonb,
  order_index int,
  created_at timestamptz
)

cms_settings (
  id uuid,
  teacher_id uuid,
  logo_url text,
  favicon_url text,
  theme_config jsonb,  -- الثيم الكامل
  sliders jsonb,
  social_links jsonb,
  contact_info jsonb,
  custom_css text,
  updated_at timestamptz
)

-- Audit Log
audit_logs (
  id uuid,
  actor_id uuid,
  actor_role text,
  action text,
  entity_type text,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz
)

-- إعدادات المساعد
assistants (
  id uuid,
  teacher_id uuid,
  user_id uuid,
  name text,
  email text,
  permissions jsonb,  -- Granular permissions
  is_active boolean,
  created_at timestamptz
)

-- إعدادات Super Admin للمنصة
platform_settings (
  id uuid,
  key text UNIQUE,
  value jsonb,
  updated_by uuid,
  updated_at timestamptz
)
```

---

## 🧩 هيكل المشروع — Next.js App Router

```
ostazna/
├── app/
│   ├── (marketing)/              # الصفحة الرئيسية للمنصة
│   │   ├── page.tsx              # Landing Page
│   │   ├── pricing/page.tsx
│   │   └── contact/page.tsx
│   │
│   ├── (auth)/                   # المصادقة
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── verify/page.tsx
│   │
│   ├── (teacher)/                # لوحة المدرس الرئيسية
│   │   ├── layout.tsx            # Teacher Dashboard Layout
│   │   ├── dashboard/page.tsx    # الصفحة الرئيسية للداشبورد
│   │   ├── onboarding/           # Wizard الإعداد الأول
│   │   │   └── page.tsx
│   │   ├── students/             # إدارة الطلاب
│   │   │   ├── page.tsx          # قائمة الطلاب
│   │   │   ├── [id]/page.tsx     # ملف الطالب الكامل
│   │   │   └── add/page.tsx
│   │   ├── groups/               # إدارة المجموعات
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── schedule/             # جدول الحصص
│   │   │   └── page.tsx
│   │   ├── attendance/           # الحضور والغياب
│   │   │   └── page.tsx
│   │   ├── finance/              # الإدارة المالية
│   │   │   ├── page.tsx          # Overview
│   │   │   ├── payments/page.tsx # المدفوعات
│   │   │   ├── expenses/page.tsx # المصروفات
│   │   │   └── invoices/page.tsx # الفواتير (Add-on)
│   │   ├── exams/                # الاختبارات (Add-on)
│   │   │   ├── page.tsx
│   │   │   ├── create/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── reports/              # التقارير
│   │   │   └── page.tsx
│   │   ├── notifications/        # الإشعارات
│   │   │   └── page.tsx
│   │   ├── cms/                  # إدارة الموقع الشخصي
│   │   │   ├── pages/page.tsx
│   │   │   ├── theme/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── academic-years/       # إدارة السنوات الدراسية
│   │   │   └── page.tsx
│   │   └── settings/             # إعدادات الحساب
│   │       └── page.tsx
│   │
│   ├── (student)/                # بوابة الطالب
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── schedule/page.tsx
│   │   ├── grades/page.tsx
│   │   ├── attendance/page.tsx
│   │   ├── payments/page.tsx
│   │   └── exams/
│   │       ├── page.tsx
│   │       └── [id]/take/page.tsx  # حل الاختبار
│   │
│   ├── (admin)/                  # Super Admin Panel
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── teachers/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── subscriptions/page.tsx
│   │   ├── addons/page.tsx
│   │   ├── plans/page.tsx
│   │   ├── domains/page.tsx
│   │   ├── audit-logs/page.tsx
│   │   ├── platform-settings/page.tsx
│   │   └── analytics/page.tsx
│   │
│   └── [subdomain]/              # موقع المدرس الشخصي (Subdomain)
│       ├── layout.tsx
│       ├── page.tsx              # الصفحة الرئيسية
│       ├── about/page.tsx
│       ├── contact/page.tsx
│       ├── gallery/page.tsx
│       ├── blog/
│       │   ├── page.tsx
│       │   └── [slug]/page.tsx
│       └── [slug]/page.tsx       # صفحات مخصصة
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── dashboard/                # مكونات الداشبورد
│   ├── charts/                   # مكونات الـ Charts
│   ├── forms/                    # النماذج
│   ├── cms/                      # مكونات الـ CMS
│   ├── theme-builder/            # Theme Builder
│   ├── print/                    # مكونات الطباعة
│   └── shared/                   # مكونات مشتركة
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── hooks/                    # Custom React Hooks
│   ├── utils/                    # Helper Functions
│   └── validations/              # Zod Schemas
│
├── middleware.ts                  # Subdomain Routing
└── public/
    └── manifest.json             # PWA Manifest
```

---

## 🔑 الميزات التفصيلية

### 1. Onboarding Wizard (أول دخول للمدرس)
خطوات متسلسلة:
1. معلومات المدرس الأساسية (الاسم، الصورة، التخصص، رقم الهاتف)
2. إعداد السنة الدراسية الحالية
3. إضافة المراحل الدراسية التي يدرّسها
4. إنشاء أول مجموعة
5. تأكيد الـ Subdomain (يُقترح تلقائياً من اسم المدرس)
6. الانتقال للـ Dashboard

---

### 2. Teacher Dashboard (الصفحة الرئيسية)
بطاقات إحصائية فورية:
- إجمالي الطلاب النشطين
- إيرادات الشهر الحالي
- المصروفات الشهرية
- صافي الربح الشهري
- حصص اليوم (مع التوقيت)
- الطلاب المتأخرون في الدفع (قائمة سريعة)
- آخر الإشعارات
- معدل الحضور هذا الأسبوع

---

### 3. إدارة الطلاب
**ملف الطالب يشمل:**
- الاسم (عربي + إنجليزي)، الصورة، تاريخ الميلاد
- السنة الدراسية، المرحلة الدراسية
- رقم هاتف الطالب، اسم ولي الأمر، رقم هاتفه
- المادة الدراسية، المجموعة/المجموعات المنتسب إليها
- ملاحظات عامة
- **حقول مخصصة:** يمكن للمدرس إضافة حقول بأسماء وقيم مخصصة
- سجل المدفوعات الكامل
- سجل الحضور والغياب
- درجات الاختبارات
- حالة الاشتراك المالي (مدفوع/متأخر)

**عمليات على الطلاب:**
- إضافة يدوية أو عبر رابط دعوة
- تصدير قائمة الطلاب (Excel/CSV/PDF)
- فلترة متقدمة (حسب المجموعة، الصف، حالة الدفع، الحضور)
- نقل الطالب بين السنوات الدراسية
- أرشفة الطالب (بدون حذف)

---

### 4. إدارة الجدول
- **الجدول الأسبوعي المتكرر:** يُنشئ المدرس الحصص المتكررة لكل مجموعة (مثل: الثلاثاء والخميس الساعة 4 عصراً)
- **الحصص المخصصة:** إضافة حصص استثنائية لمجموعة/صف/مجموعة طلاب محددة
- **عرض الجدول:** أسبوعي، يومي، شهري
- **الحصص الفردية:** حصص خاصة لطالب واحد
- **حالة الحصة:** مجدولة، منتهية، ملغاة

---

### 5. الحضور والغياب
- تسجيل يدوي بواسطة المدرس أو المساعد
- حالات: حاضر، غائب، متأخر، معذور
- تسجيل بالـ Session (حصة بحصة)
- ملاحظات اختيارية لكل طالب
- تقرير الحضور: نسبة حضور كل طالب، أكثر الطلاب غياباً
- إشعار تلقائي لولي الأمر عند تسجيل الغياب (إذا كان Add-on ولي الأمر مفعلاً)

---

### 6. الإدارة المالية

#### الإيرادات (المدفوعات)
- تسجيل دفع نقدي مع: المبلغ، التاريخ، الفترة (من/إلى)، ملاحظات
- نوع التسعير: بالحصة أو شهري (يُحدد على مستوى المجموعة)
- عرض سريع: الطلاب الذين دفعوا / لم يدفعوا
- تنبيهات تلقائية للطلاب المتأخرين في الدفع
- إصدار فاتورة رسمية (Add-on)

#### المصروفات
- تصنيفات مخصصة (يُنشئها المدرس): إيجار، مستلزمات، إعلانات، رواتب، إلخ
- تسجيل كل مصروف مع: المبلغ، التاريخ، الوصف، التصنيف، إرفاق صورة إيصال
- ملخص المصروفات حسب التصنيف

#### الفواتير الرسمية (Add-on)
- إصدار فاتورة PDF احترافية بلوغو المدرس
- ترقيم تلقائي للفواتير
- حالات: مسودة، مُصدرة، مدفوعة، ملغاة
- إرسال الفاتورة للطالب عبر الإشعارات

---

### 7. التقارير
#### التقارير الأساسية:
- ملخص الإيرادات الشهري
- ملخص المصروفات الشهري
- صافي الربح (شهري/سنوي)
- قائمة الطلاب المتأخرين في الدفع

#### التقارير المتقدمة (Add-on) — مع Charts:
- منحنى الإيرادات والمصروفات (Line Chart)
- توزيع الإيرادات حسب المجموعات (Pie Chart)
- معدل الحضور أسبوعياً/شهرياً (Bar Chart)
- أداء الطلاب في الاختبارات (مقارنة)
- تقرير شامل لكل طالب (أداء + حضور + مالية)
- أكثر الطلاب غياباً
- تحليل المصروفات حسب التصنيف

#### خيارات التصدير والطباعة:
- تصدير: CSV، Excel، PDF
- طباعة احترافية مع إمكانية إظهار/إخفاء أقسام محددة
- لوغو المدرس في التقارير المطبوعة

---

### 8. الاختبارات (Add-on مستقل)

#### إنشاء الاختبار:
- العنوان، الوصف، المدة (بالدقائق)، الدرجة الكلية، درجة النجاح
- تحديد تاريخ الفتح والإغلاق التلقائي
- النشر لـ: مجموعات محددة، صفوف محددة، أو الجميع

#### أنواع الأسئلة:
- اختيار من متعدد (MCQ)
- صح أو خطأ
- أكمل الفراغ
- إجابة قصيرة
- مقال (يصححه المدرس يدوياً)
- رفع صورة إجابة
- يمكن إرفاق صورة مع أي سؤال

#### إدارة الاختبار:
- مراجعة إجابات الطلاب
- تصحيح يدوي للمقالات
- عرض نتائج الاختبار مع الإحصائيات
- إخطار الطلاب بالنتيجة تلقائياً

#### درجات الاختبارات الورقية:
- إدخال درجات الاختبارات التقليدية يدوياً
- ربطها بسجل الطالب

---

### 9. نظام الإشعارات والتنبيهات

#### القنوات:
- **داخل المنصة:** Supabase Realtime
- **Push Notification:** Web Push عبر PWA
- **واتساب:** WhatsApp Business API (Add-on)

#### الإشعارات التلقائية (يُعدّها المدرس):
- تذكير بموعد الحصة (قبل X ساعات — يحددها المدرس)
- تنبيه الدفع المتأخر (بعد X أيام من الاستحقاق)
- إشعار نتيجة الاختبار (تلقائي عند النشر)
- تنبيه الغياب لولي الأمر

#### الإشعارات اليدوية:
- المدرس يرسل رسالة مخصصة لـ:
  - مجموعة بعينها
  - صف بعينه
  - مجموعة طلاب مختارة يدوياً
  - طالب واحد
  - ولي أمر محدد
  - جميع أولياء الأمور

---

### 10. السنة الدراسية

- المدرس ينشئ سنة دراسية جديدة في بداية كل عام
- تحديد: الاسم (2024-2025)، تاريخ البداية والنهاية
- عند إنشاء سنة جديدة: المدرس يختار يدوياً الطلاب والمجموعات التي يرفعها
- السجلات القديمة تبقى محفوظة ومرتبطة بالسنة الدراسية السابقة
- يمكن التنقل بين السنوات الدراسية لعرض السجلات التاريخية

---

### 11. المصادقة والأمان

#### تسجيل الدخول:
- إيميل + باسورد
- Google OAuth
- Facebook OAuth

#### الأمان:
- 2FA عبر TOTP (معطل افتراضياً، يفعّله المدرس أو Super Admin)
- Row Level Security في Supabase لكل الجداول
- كل مدرس يرى بياناته فقط
- Audit Log لكل عملية تغيير/دخول

#### Super Admin Impersonation:
- Super Admin يمكنه تسجيل الدخول كأي مدرس
- يُسجَّل في الـ Audit Log مع تمييز أن العملية من Super Admin

---

### 12. Subdomain + CMS

#### الـ Subdomain:
- يُنشأ تلقائياً عند الاشتراك: `{اسم-المدرس}.ostazna.com`
- يمكن للمدرس تغييره من الإعدادات (مرة واحدة)
- يمكن للمدرس إضافة دومين خاص به (يُدير الـ DNS يدوياً)
- Super Admin يدير الـ Wildcard DNS للمنصة

#### صفحات CMS المدرس:
1. **الصفحة الرئيسية** — Hero, About, Services, Testimonials, CTA
2. **صفحة تعريفية** — سيرة المدرس الكاملة
3. **صفحة التواصل** — نموذج تواصل + خريطة + بيانات
4. **معرض الصور** — جاليري صور
5. **المدونة** — مقالات مع نظام تصنيف
6. **صفحات مخصصة** — يُضيف المدرس صفحات بمحتوى حر

#### إدارة المحتوى:
- محرر Block-based (مثل Notion/Gutenberg) لكل صفحة
- إدارة الـ Sliders
- إدارة قوائم التنقل (Navigation)
- إعدادات الـ SEO لكل صفحة

#### Theme Builder:
- اختيار ألوان الثيم (Primary, Secondary, Accent, Background, Text)
- اختيار الخطوط (Arabic Font + Latin Font)
- رفع اللوغو والفافيكون
- روابط السوشيال ميديا
- حفظ الثيمات وتطبيقها
- استعراض مباشر (Live Preview)

---

### 13. User Profile المتكامل

للمدرس:
- الصورة الشخصية، الاسم (عربي + إنجليزي)
- البريد الإلكتروني، رقم الهاتف
- التخصص والمؤهل
- نبذة تعريفية
- **حقول مخصصة:** المدرس يضيف حقولاً بأسماء وقيم بنفسه (مثل: عدد سنوات الخبرة، الشهادات، إلخ)
- إعدادات الإشعارات
- إعدادات الأمان (2FA، تغيير الباسورد)
- إعدادات اللغة والمنطقة الزمنية

---

### 14. Super Admin Panel

#### لوحة Analytics الرئيسية:
- إجمالي المدرسين المشتركين (نشط/مجمد/مؤرشف)
- الإيرادات الشهرية للمنصة
- المدرسون الجدد هذا الشهر
- معدل التجديد
- الـ Add-ons الأكثر شراء

#### إدارة المدرسين:
- عرض كل حسابات المدرسين بالتفصيل
- تفعيل/تعطيل/تجميد/أرشفة أي حساب
- تسجيل الدخول كمدرس (Impersonation) لأغراض الدعم
- إضافة/تعديل/حذف حساب مدرس
- إدارة الاشتراكات (تجديد يدوي، تغيير الخطة)
- إدارة الـ Add-ons المفعلة لكل مدرس

#### إدارة الخطط والأسعار:
- إنشاء خطط اشتراك جديدة
- تعديل أسعار الـ Add-ons
- إدارة العروض والكوبونات (مستقبلاً)

#### إدارة بوابات الدفع:
- تحديد طرق الدفع المقبولة للاشتراك (نقد، تحويل، محافظ)
- بيانات الحساب البنكي والمحافظ

#### إدارة الدومين:
- قائمة Subdomains المستخدمة
- ربط الدومينات المخصصة
- إدارة شهادات SSL

#### Audit Log الشامل:
- كل عملية في المنصة مُسجّلة بالتفصيل
- فلترة: حسب المدرس، نوع العملية، التاريخ
- تصدير الـ Audit Log

#### إعدادات المنصة:
- تعديل كل إعدادات المنصة من لوحة واحدة
- إعدادات الـ WhatsApp Business API
- إعدادات الإيميل (SMTP)
- إعدادات Landing Page للمنصة

---

### 15. نظام التصدير والطباعة

#### تصدير البيانات:
- قوائم الطلاب: Excel/CSV/PDF
- كشف الحضور: Excel/PDF
- كشف المدفوعات: Excel/PDF
- تقارير المصروفات: Excel/PDF
- كشف الدرجات: Excel/PDF
- تقرير الطالب الكامل: PDF

#### الطباعة:
- واجهة طباعة مخصصة مع إمكانية إظهار/إخفاء الأقسام
- لوغو المدرس في كل مطبوع
- تاريخ الطباعة تلقائياً

---

## 🎨 الهوية البصرية — Design System

```
اسم المنصة:   أستاذنا / Ostazna
الطابع:       احترافي، حديث، موثوق، عربي الهوية
الألوان الأساسية:
  - Primary:    #1E3A5F  (أزرق ملكي داكن — الثقة والمهنية)
  - Secondary:  #F5A623  (ذهبي — التميز والتقدير)
  - Accent:     #2ECC71  (أخضر — النجاح والنمو)
  - Background: #F8F9FA  (رمادي فاتح جداً)
  - Text:       #1A1A2E

الخطوط:
  - العربية:   Noto Kufi Arabic أو IBM Plex Arabic
  - الإنجليزية: Plus Jakarta Sans أو DM Sans
  
الاتجاه: RTL افتراضياً (العربية) مع دعم LTR للإنجليزية
```

---

## 🔄 Business Logic — القواعد الجوهرية

```
1. كل مدرس له Subdomain فريد لا يتكرر
2. الـ Add-ons مستقلة تماماً — كل وحدة تعمل منفردة
3. الطالب يمكن أن ينتسب لأكثر من مجموعة
4. عند تجميد الحساب: قراءة فقط، لا حذف للبيانات
5. بعد 30 يوم من التجميد: أرشفة تلقائية
6. Super Admin فقط يحذف الحسابات المؤرشفة نهائياً
7. الـ Audit Log لا يُحذف أبداً
8. كل SaaS مدرس معزول تماماً عن الآخرين (Multi-tenancy)
9. السنة الدراسية الجديدة لا تؤثر على سجلات القديمة
10. الإشعارات التلقائية للحصص: تُرسل قبل الموعد بالوقت الذي يحدده المدرس
11. 2FA معطل افتراضياً لكل الحسابات
12. تسجيل الدخول كمدرس من Super Admin يُسجَّل في Audit Log
```

---

## 🚀 MVP — الحد الأدنى القابل للإطلاق

### المرحلة الأولى (MVP):
1. ✅ نظام المصادقة الكامل (Email + Google + Facebook)
2. ✅ Onboarding Wizard
3. ✅ إدارة الطلاب (CRUD كامل + ملف الطالب)
4. ✅ إدارة المجموعات والصفوف
5. ✅ جدول الحصص الأسبوعي
6. ✅ تسجيل الحضور والغياب
7. ✅ تسجيل المدفوعات (نقدي)
8. ✅ تسجيل المصروفات
9. ✅ التقارير الأساسية
10. ✅ Teacher Dashboard
11. ✅ Super Admin Panel (أساسي)
12. ✅ Subdomain تلقائي

### المرحلة الثانية:
- CMS + Theme Builder
- الإشعارات (Push + WhatsApp)
- الفواتير الرسمية
- التقارير المتقدمة مع Charts
- بوابة الطالب
- حساب المساعد

### المرحلة الثالثة:
- الاختبارات الإلكترونية
- بوابة ولي الأمر
- تطبيق الموبايل

---

## 📋 ملاحظات تقنية إضافية

```
- استخدم Supabase RLS (Row Level Security) على كل الجداول
- Middleware في Next.js لـ Subdomain Routing
- Supabase Realtime للإشعارات اللحظية داخل المنصة
- Web Push API + Service Worker للـ PWA Notifications
- jsPDF + html2canvas لتوليد ملفات PDF
- SheetJS (xlsx) لتصدير Excel
- react-to-print للطباعة
- Zod للتحقق من البيانات (Frontend + Backend)
- next-intl لدعم العربية (RTL) والإنجليزية (LTR)
- Recharts للرسوم البيانية
- Uploadthing أو Supabase Storage لرفع الملفات والصور
- قاعدة البيانات مُقسَّمة بـ teacher_id في كل جدول لضمان العزل التام
- كل عملية write تُسجَّل في audit_logs
- استخدم Supabase Edge Functions للعمليات المعقدة والـ Webhooks
```

---

## 🔒 ملاحظات الأمان

```
- Supabase RLS: كل مدرس يصل لبياناته فقط عبر teacher_id
- Super Admin Role: RBAC منفصل في Supabase
- البيانات الحساسة للطلاب مشفرة
- HTTPS إلزامي على كل الـ Subdomains (Wildcard SSL)
- Rate Limiting على الـ API Routes
- Input Validation بـ Zod على كل النماذج
- 2FA TOTP معطل افتراضياً قابل للتفعيل
- Session Management عبر Supabase Auth
- Impersonation مُقيَّد بـ Super Admin فقط ومُسجَّل
```

---

*تم إعداد هذا الملف بناءً على جلسة عصف ذهني شاملة — 60 سؤالاً وإجابة*
*المنصة: أستاذنا / Ostazna.com*
*إعداد: Claude Sonnet — مايو 2026*
