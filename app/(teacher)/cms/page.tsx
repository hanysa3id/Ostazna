import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentTeacher } from '@/lib/dal/teachers';

export const metadata = { title: 'موقعك الشخصي' };
export const dynamic = 'force-dynamic';

export default async function CmsHomePage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) return null;
  const supabase = await createClient();
  const { data: pages } = await supabase
    .from('cms_pages')
    .select('id, slug, title_ar, page_type, is_published, order_index')
    .order('order_index');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-900">موقعك الشخصي</h1>
        <p className="text-sm text-neutral-500 mt-1">
          عنوانك العام: <a href={`http://${teacher.subdomain}.ostazna.com`} target="_blank" rel="noopener" className="text-primary-700 underline">{teacher.subdomain}.ostazna.com</a>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/cms/pages" className="p-5 bg-white rounded-card border border-neutral-200 hover:border-primary-300">
          <h3 className="font-semibold text-primary-900">الصفحات</h3>
          <p className="text-sm text-neutral-600 mt-1">{(pages ?? []).length} صفحة</p>
        </Link>
        <Link href="/cms/theme" className="p-5 bg-white rounded-card border border-neutral-200 hover:border-primary-300">
          <h3 className="font-semibold text-primary-900">الثيم والألوان</h3>
          <p className="text-sm text-neutral-600 mt-1">شعار، ألوان، خطوط، وروابط السوشيال.</p>
        </Link>
      </div>
    </div>
  );
}
