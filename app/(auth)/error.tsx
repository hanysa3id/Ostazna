'use client';

import { useEffect } from 'react';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[auth/error]', error);
  }, [error]);

  return (
    <div className="min-h-dvh grid place-items-center px-6 py-10 bg-bg">
      <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 p-6 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-red-100 text-red-700 grid place-items-center text-2xl mb-3">⚠</div>
        <h1 className="text-lg font-bold text-red-700">حدث خطأ أثناء المصادقة</h1>
        <p className="mt-2 text-sm text-neutral-600">{error?.message || 'يرجى إعادة المحاولة.'}</p>
        <div className="mt-6 flex items-center gap-2 justify-center flex-wrap">
          <button onClick={() => reset()} className="px-4 py-2 rounded-xl bg-primary-700 text-white text-sm font-medium">
            إعادة المحاولة
          </button>
          <a href="/login" className="px-4 py-2 rounded-xl border border-neutral-300 text-sm">تسجيل الدخول</a>
          <a href="/" className="px-4 py-2 rounded-xl border border-neutral-300 text-sm">الرئيسية</a>
        </div>
      </div>
    </div>
  );
}
