import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { savePageAction, deletePageAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function EditCmsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: page } = await supabase.from('cms_pages').select('*').eq('id', id).maybeSingle();
  if (!page) notFound();

  const html = (page.content_ar as any[])?.[0]?.html ?? '';

  return (
    <div className="space-y-5 max-w-3xl">
      <h1 className="text-2xl font-bold text-primary-900">تحرير: {page.title_ar}</h1>

      <form action={savePageAction} className="bg-white rounded-card border border-neutral-200 p-6 space-y-4">
        <input type="hidden" name="id" value={page.id} />

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">العنوان (عربي)</label>
          <input name="title_ar" defaultValue={page.title_ar} required className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">العنوان (إنجليزي)</label>
          <input name="title_en" defaultValue={page.title_en ?? ''} className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">المحتوى (HTML)</label>
          <textarea name="content_ar" defaultValue={html} rows={14}
            className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300 font-mono text-sm"
            placeholder="<p>أهلاً بكم في موقعي...</p>" />
          <p className="text-xs text-neutral-500 mt-1">في المرحلة القادمة سيُستبدل بمحرر بصري (Tiptap).</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_published" defaultChecked={page.is_published} />
          منشورة (تظهر للزوار)
        </label>

        <div className="flex items-center justify-between gap-3">
          <button className="px-5 py-2.5 rounded-card bg-primary-700 text-white">حفظ</button>
        </div>
      </form>

      <form action={deletePageAction} className="text-end">
        <input type="hidden" name="id" value={page.id} />
        <button className="text-xs text-red-600">حذف الصفحة</button>
      </form>
    </div>
  );
}
