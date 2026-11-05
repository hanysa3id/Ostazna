import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { Field, TextArea, Toggle } from '@/components/admin/cms-form-fields';
import { savePageAction, deletePageAction } from '../../actions';

export const metadata = { title: 'تعديل صفحة' };
export const dynamic = 'force-dynamic';

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = createServiceRoleClient();
  const { data: p } = await sb.from('site_pages').select('*').eq('id', id).maybeSingle();
  if (!p) notFound();

  return (
    <div className="max-w-3xl space-y-5">
      <Link href="/admin/cms/pages" className="text-sm text-primary-700 hover:text-violet-600">← العودة</Link>
      <h1 className="text-2xl font-bold text-primary-900">تعديل: {p.title}</h1>

      <form action={savePageAction} className="bg-white rounded-2xl border border-primary-100 p-6 space-y-4">
        <input type="hidden" name="id" value={p.id} />

        <div className="grid grid-cols-2 gap-3">
          <Field name="title" label="العنوان" required defaultValue={p.title} />
          <Field name="slug" label="الـ Slug" required defaultValue={p.slug} />
        </div>
        <Field name="hero_kicker" label="البادج" defaultValue={p.hero_kicker ?? ''} />
        <TextArea name="body" label="المحتوى (HTML)" rows={14} mono defaultValue={p.body ?? ''} />

        <div className="grid grid-cols-2 gap-3">
          <Toggle name="is_published" label="نشر" defaultChecked={p.is_published} />
          <Toggle name="show_in_nav" label="إظهار في القائمة" defaultChecked={p.show_in_nav} />
        </div>

        <details>
          <summary className="cursor-pointer text-sm text-primary-700">SEO</summary>
          <div className="mt-3 space-y-3">
            <Field name="seo_title" label="SEO Title" defaultValue={p.seo_title ?? ''} />
            <TextArea name="seo_desc" label="SEO Description" rows={2} defaultValue={p.seo_desc ?? ''} />
          </div>
        </details>

        <button className="w-full px-4 py-3 rounded-card bg-primary-700 text-white font-medium">حفظ</button>
      </form>

      <form action={deletePageAction} className="text-end">
        <input type="hidden" name="id" value={p.id} />
        <button className="text-xs text-red-600">حذف الصفحة</button>
      </form>
    </div>
  );
}
