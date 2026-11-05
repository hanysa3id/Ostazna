export const metadata = { title: 'سياسة الاسترجاع' };

export default function RefundPage() {
  return (
    <article className="prose prose-neutral mx-auto max-w-3xl px-6 py-16 leading-relaxed">
      <h1 className="text-3xl font-bold text-primary-900 mb-6">سياسة الاسترجاع</h1>
      <p className="text-sm text-neutral-500">آخر تحديث: 2026/05/15</p>

      <h2 className="mt-8 text-xl font-semibold">الاسترجاع الكامل خلال 7 أيام</h2>
      <p>إذا اشتركت لأول مرة في خطة مدفوعة ولم تكن راضياً، يمكنك طلب استرجاع كامل خلال أول <strong>7 أيام</strong> من تاريخ الدفع — بدون أسئلة.</p>

      <h2 className="mt-8 text-xl font-semibold">بعد 7 أيام</h2>
      <p>الاسترجاع يكون بنسبة الفترة غير المستهلكة من الشهر. مثال: لو ألغيت بعد 20 يوم من الدفع نُعيد قيمة 10 أيام.</p>

      <h2 className="mt-8 text-xl font-semibold">طريقة طلب الاسترجاع</h2>
      <p>أرسل بريداً إلى <a href="mailto:billing@ostazna.com" className="text-primary-700">billing@ostazna.com</a> من نفس البريد المسجل في الحساب، يُعالج الطلب خلال 5 أيام عمل ويُرد المبلغ بنفس وسيلة الدفع الأصلية.</p>

      <h2 className="mt-8 text-xl font-semibold">حالات لا ينطبق عليها الاسترجاع</h2>
      <ul className="list-disc ms-6 space-y-1">
        <li>اشتراكات تجاوزت 30 يوماً.</li>
        <li>حسابات أُوقفت بسبب مخالفة شروط الاستخدام.</li>
        <li>قيمة الـ Add-ons المُستهلَكة (مثل عدد رسائل واتساب المُرسَلة).</li>
      </ul>
    </article>
  );
}
