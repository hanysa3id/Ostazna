import Link from 'next/link';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { Plus, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { deletePageAction } from '../actions';

export const metadata = { title: 'الصفحات المخصصة' };
export const dynamic = 'force-dynamic';

export default async function PagesAdminPage() {
  const sb = createServiceRoleClient();
  const { data: pages } = await sb.from('site_pages').select('*').order('updated_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">الصفحات المخصصة</h1>
          <p className="mt-1 text-sm text-primary-700/80">أضف صفحات تسويقية إضافية بأي محتوى. تظهر على رابط <code>/p/[slug]</code>.</p>
        </div>
        <Link href="/admin/cms/pages/new" className="text-sm px-4 py-2 rounded-card bg-primary-700 text-white inline-flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> صفحة جديدة
        </Link>
      </div>

      {(pages ?? []).length === 0 ? (
        <div className="p-10 text-center bg-white rounded-card border border-dashed border-primary-200">
          <p className="text-primary-600">لا توجد صفحات بعد.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-primary-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-primary-50/40 text-primary-700">
              <tr>
                <th className="text-start px-5 py-3 font-medium">العنوان</th>
                <th className="text-start px-5 py-3 font-medium">الرابط</th>
                <th className="text-start px-5 py-3 font-medium">القائمة</th>
                <th className="text-start px-5 py-3 font-medium">الحالة</th>
                <th className="text-end   px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50">
              {(pages ?? []).map(p => (
                <tr key={p.id} className="hover:bg-primary-50/30 transition">
                  <td className="px-5 py-3 font-medium text-primary-900">{p.title}</td>
                  <td className="px-5 py-3"><code className="text-xs bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded">/p/{p.slug}</code></td>
                  <td className="px-5 py-3 text-xs">{p.show_in_nav ? '✓ في القائمة' : '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs ${p.is_published ? 'text-accent-600' : 'text-neutral-500'}`}>
                      {p.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {p.is_published ? 'منشورة' : 'مسودة'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-end">
                    <div className="inline-flex items-center gap-3 text-xs">
                      {p.is_published && (
                        <a href={`/p/${p.slug}`} target="_blank" rel="noopener" className="text-primary-600 hover:text-violet-600 inline-flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> عرض
                        </a>
                      )}
                      <Link href={`/admin/cms/pages/${p.id}`} className="text-primary-700 hover:text-violet-600">تعديل</Link>
                      <form action={deletePageAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="text-red-600">حذف</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
