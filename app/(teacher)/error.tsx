'use client';

import { useEffect } from 'react';

export default function TeacherError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[teacher/error]', error);
  }, [error]);

  const e = error as any;
  const meta = [
    e?.code    ? `code: ${e.code}`     : null,
    e?.hint    ? `hint: ${e.hint}`     : null,
    e?.details ? `details: ${e.details}`: null,
  ].filter(Boolean);

  return (
    <div className="min-h-dvh grid place-items-center px-6 py-10 bg-bg">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-red-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 grid place-items-center text-xl">⚠</div>
          <h1 className="text-xl font-bold text-red-700">تعذّر تحميل الصفحة</h1>
        </div>
        <p className="text-sm text-neutral-700">{error?.message || 'خطأ غير متوقع.'}</p>
        {meta.length > 0 && (
          <ul className="mt-3 text-xs text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-xl p-3 font-mono space-y-1">
            {meta.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        )}
        <div className="mt-6 flex items-center gap-2 flex-wrap">
          <button onClick={() => reset()} className="px-4 py-2 rounded-xl bg-primary-700 text-white text-sm font-medium">
            إعادة المحاولة
          </button>
          <a href="/dashboard" className="px-4 py-2 rounded-xl border border-neutral-300 text-sm">لوحة التحكم</a>
          <a href="/" className="px-4 py-2 rounded-xl border border-neutral-300 text-sm">الرئيسية</a>
        </div>
      </div>
    </div>
  );
}
