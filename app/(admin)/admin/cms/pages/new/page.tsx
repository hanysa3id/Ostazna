import Link from 'next/link';
import { Field, TextArea, Toggle } from '@/components/admin/cms-form-fields';
import { savePageAction } from '../../actions';

export const metadata = { title: 'صفحة جديدة' };

export default function NewPage() {
  return (
    <div className="max-w-3xl space-y-5">
      <Link href="/admin/cms/pages" className="text-sm text-primary-700 hover:text-violet-600">← العودة</Link>
      <h1 className="text-2xl font-bold text-primary-900">إضافة صفحة جديدة</h1>

      <form action={savePageAction} className="bg-white rounded-2xl border border-primary-100 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field name="title" label="العنوان" required placeholder="من نحن" />
          <Field name="slug" label="الـ Slug" required placeholder="about" hint="حروف لاتينية صغيرة، أرقام، -" />
        </div>
        <Field name="hero_kicker" label="بادج صغير في الأعلى (اختياري)" placeholder="عن المنصة" />

        <TextArea
          name="body" label="المحتوى (HTML)" rows={14} mono
          placeholder='<p>أهلاً بكم في صفحتنا...</p>\n<h2>فقرة فرعية</h2>'
          hint="يدعم HTML الأساسي. سيتم استبداله بمحرر بصري في تحديث قادم."
        />

        <div className="grid grid-cols-2 gap-3">
          <Toggle name="is_published" label="نشر مباشر" />
          <Toggle name="show_in_nav" label="إظهار في القائمة العلوية" />
        </div>

        <details>
          <summary className="cursor-pointer text-sm text-primary-700">إعدادات SEO</summary>
          <div className="mt-3 space-y-3">
            <Field name="seo_title" label="SEO Title" />
            <TextArea name="seo_desc" label="SEO Description" rows={2} />
          </div>
        </details>

        <button className="w-full px-4 py-3 rounded-card bg-primary-700 text-white font-medium">إنشاء الصفحة</button>
      </form>
    </div>
  );
}
