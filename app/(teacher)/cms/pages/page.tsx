import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createPageAction } from './actions';

export const metadata = { title: 'إدارة الصفحات' };
export const dynamic = 'force-dynamic';

export default async function CmsPagesPage() {
  const supabase = await createClient();
  const { data: pages } = await supabase
    .from('cms_pages')
    .select('*')
    .order('order_index');

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-primary-900">صفحات الموقع</h1>

      <form action={createPageAction} className="bg-white rounded-card border border-neutral-200 p-4 grid sm:grid-cols-3 gap-2">
        <input name="title_ar" required placeholder="عنوان الصفحة" className="px-3 py-2 rounded-card border border-neutral-300" />
        <input name="slug" required placeholder="slug (about / contact)" className="px-3 py-2 rounded-card border border-neutral-300" />
        <button className="px-4 py-2 rounded-card bg-primary-700 text-white text-sm">إنشاء</button>
      </form>

      {(pages ?? []).length === 0 ? (
        <div className="p-10 text-center bg-white rounded-card border border-dashed border-neutral-300">
          <p className="text-neutral-600">لا توجد صفحات بعد.</p>
        </div>
      ) : (
        <ul className="bg-white rounded-card border border-neutral-200 divide-y divide-neutral-100">
          {(pages ?? []).map(p => (
            <li key={p.id} className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-neutral-900">{p.title_ar}</h3>
                <p className="text-xs text-neutral-500">/{p.slug} · {p.is_published ? 'منشورة' : 'مسودة'}</p>
              </div>
              <Link href={`/cms/pages/${p.id}`} className="text-primary-700 text-sm">تحرير</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
