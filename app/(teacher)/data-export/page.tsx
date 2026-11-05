export const metadata = { title: 'تصدير البيانات' };

export default function DataExportPage() {
  return (
    <div className="max-w-xl space-y-5">
      <h1 className="text-2xl font-bold text-primary-900">تصدير البيانات</h1>
      <div className="bg-white rounded-card border border-neutral-200 p-6 space-y-4">
        <p className="text-sm text-neutral-700">
          يمكنك تنزيل نسخة كاملة من كل بياناتك (طلاب، مجموعات، حصص، حضور، مدفوعات، تقارير) بصيغة قياسية.
          هذا حقّك الكامل ولا يتأثر بنوع الاشتراك.
        </p>
        <a href="/api/exports/teacher-data" download
          className="inline-block px-5 py-2.5 rounded-card bg-primary-700 text-white text-sm">
          تحميل البيانات (TXT يحوي CSV لكل جدول)
        </a>
        <p className="text-xs text-neutral-500">
          نسخة الـ ZIP الفعلية والصور ستُضاف في تحديث قادم.
        </p>
      </div>
    </div>
  );
}
