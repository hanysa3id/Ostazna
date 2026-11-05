export const metadata = { title: 'تأكيد البريد' };

export default function VerifyPage() {
  return (
    <div className="text-center">
      <div className="mx-auto w-14 h-14 rounded-full bg-primary-100 text-primary-700 grid place-items-center text-2xl mb-4">✉</div>
      <h1 className="text-xl font-bold text-primary-900">تأكيد البريد الإلكتروني</h1>
      <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
        أرسلنا رابط التأكيد على بريدك. افتح الرسالة واضغط الرابط لإكمال التسجيل.
      </p>
      <p className="mt-6 text-xs text-neutral-500">
        لم تصل الرسالة؟ تحقق من مجلد <strong>غير المرغوب فيه</strong> أو اطلب إعادة الإرسال بعد دقيقة.
      </p>
    </div>
  );
}
