import { ImportForm } from './form';

export const metadata = { title: 'استيراد طلاب' };

export default function ImportStudentsPage() {
  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold text-primary-900">استيراد طلاب من CSV</h1>
      <div className="bg-white rounded-card border border-neutral-200 p-6">
        <p className="text-sm text-neutral-700 mb-3">
          صيغة الملف: عمود واحد على الأقل باسم <code>name_ar</code>. الأعمدة الاختيارية:
          <code> name_en, phone, parent_name, parent_phone, date_of_birth, notes</code>.
        </p>
        <p className="text-xs text-neutral-500 mb-5">
          يجب أن يحوي السطر الأول أسماء الأعمدة. الترميز UTF-8.
          <a href="/students/import/sample.csv" download className="text-primary-700 ms-2">تنزيل ملف نموذجي</a>
        </p>
        <ImportForm />
      </div>
    </div>
  );
}
