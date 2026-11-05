export const metadata = { title: 'سياسة الخصوصية' };

export default function PrivacyPage() {
  return (
    <article className="prose prose-neutral mx-auto max-w-3xl px-6 py-16 leading-relaxed">
      <h1 className="text-3xl font-bold text-primary-900 mb-6">سياسة الخصوصية</h1>
      <p className="text-sm text-neutral-500">آخر تحديث: 2026/05/15</p>

      <h2 className="mt-8 text-xl font-semibold text-neutral-900">1. مَن نحن</h2>
      <p>منصة <strong>أستاذنا (Ostazna)</strong> تقدم خدمة سحابية لإدارة أعمال المدرسين الخصوصيين في مصر. تشغيل المنصة يتم عبر بنية تحتية مستضافة في الاتحاد الأوروبي مع التزام كامل بمعايير حماية البيانات.</p>

      <h2 className="mt-8 text-xl font-semibold text-neutral-900">2. البيانات التي نجمعها</h2>
      <ul className="list-disc ms-6 space-y-1">
        <li>بيانات حساب المدرس: الاسم، البريد، رقم الهاتف، الصورة.</li>
        <li>بيانات الطلاب التي يدخلها المدرس: الاسم، الصورة، الميلاد، رقم ولي الأمر، الحضور، الدرجات، المدفوعات.</li>
        <li>سجلات الاستخدام التقنية: عنوان IP، نوع المتصفح، أحداث الدخول.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold text-neutral-900">3. بيانات القاصرين</h2>
      <p>كثير من الطلاب قاصرون. المدرس مسؤول قانونياً عن الحصول على إذن ولي الأمر قبل إدخال أي بيانات تخص قاصراً. تُحفظ بيانات القاصرين بمعزل تقني داخل قواعد بيانات معزولة بحسب المدرس (RLS)، ولا يصل لها أي طرف ثالث.</p>

      <h2 className="mt-8 text-xl font-semibold text-neutral-900">4. الاحتفاظ والحذف</h2>
      <p>عند أرشفة الطالب من قبل المدرس، تُحذف بياناته نهائياً بعد <strong>90 يوماً</strong> ما لم يكن هناك التزام قانوني بالاحتفاظ بها. يمكن للمدرس طلب حذف حسابه بالكامل في أي وقت — البيانات تُحذف خلال 30 يوماً.</p>

      <h2 className="mt-8 text-xl font-semibold text-neutral-900">5. حقوق المستخدم</h2>
      <p>للمدرس الحق في تصدير كل بياناته بصيغة قياسية (CSV/JSON) في أي وقت من خلال صفحة <em>تصدير البيانات</em>. كذلك له حق التصحيح والحذف.</p>

      <h2 className="mt-8 text-xl font-semibold text-neutral-900">6. التواصل</h2>
      <p>لأي استفسار يتعلق بالخصوصية: <a href="mailto:privacy@ostazna.com" className="text-primary-700">privacy@ostazna.com</a></p>
    </article>
  );
}
