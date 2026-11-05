export const metadata = { title: 'شروط الاستخدام' };

export default function TermsPage() {
  return (
    <article className="prose prose-neutral mx-auto max-w-3xl px-6 py-16 leading-relaxed">
      <h1 className="text-3xl font-bold text-primary-900 mb-6">شروط الاستخدام</h1>
      <p className="text-sm text-neutral-500">آخر تحديث: 2026/05/15</p>

      <h2 className="mt-8 text-xl font-semibold">1. الخدمة</h2>
      <p>توفر منصة <strong>أستاذنا</strong> أدوات سحابية لإدارة أعمال المدرس الخصوصي. الاشتراك شهري وقابل للإلغاء في أي وقت.</p>

      <h2 className="mt-8 text-xl font-semibold">2. الحساب</h2>
      <ul className="list-disc ms-6 space-y-1">
        <li>أنت مسؤول عن سرية بيانات الدخول.</li>
        <li>يُحظر مشاركة الحساب بين أكثر من مدرس — لكل مدرس حساب مستقل.</li>
        <li>يُحظر استخدام المنصة لأي غرض غير قانوني.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">3. الدفع والتجديد</h2>
      <p>تُدفع رسوم الاشتراك مقدماً شهرياً. عند انتهاء الفترة بدون تجديد يدخل الحساب وضع <em>التجميد</em> (قراءة فقط) لمدة 30 يوم، ثم يُؤرشف. يمكن استعادة الحساب المؤرشف بدفع الاشتراك المستحق.</p>

      <h2 className="mt-8 text-xl font-semibold">4. المحتوى</h2>
      <p>محتوى الـ Subdomain الخاص بكل مدرس مسؤولية المدرس وحده. يحق لإدارة المنصة إيقاف أي محتوى مخالف للقوانين المصرية.</p>

      <h2 className="mt-8 text-xl font-semibold">5. حدود المسؤولية</h2>
      <p>المنصة تُقدَّم "كما هي". لا نتحمل مسؤولية أي خسائر غير مباشرة. أقصى مسؤولية في أي حال هي قيمة الاشتراك المدفوع خلال آخر 12 شهراً.</p>

      <h2 className="mt-8 text-xl font-semibold">6. التعديل</h2>
      <p>يحق لنا تعديل هذه الشروط بإشعار مسبق 14 يوماً عبر البريد الإلكتروني المسجل.</p>
    </article>
  );
}
