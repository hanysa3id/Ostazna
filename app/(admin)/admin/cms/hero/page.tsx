import Link from 'next/link';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { Plus, Edit, Eye, EyeOff } from 'lucide-react';
import { deleteHeroSlideAction } from '../actions';

export const metadata = { title: 'الـ Hero Sliders' };
export const dynamic = 'force-dynamic';

export default async function HeroAdminPage() {
  const sb = createServiceRoleClient();
  const { data: slides } = await sb.from('site_hero_slides').select('*').order('order_index');

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">الـ Hero / Sliders</h1>
          <p className="mt-1 text-sm text-primary-700/80">شرائح الـ Carousel في أعلى الصفحة الرئيسية. تظهر بترتيب الـ index.</p>
        </div>
        <Link href="/admin/cms/hero/new" className="text-sm px-4 py-2 rounded-card bg-primary-700 text-white inline-flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> شريحة جديدة
        </Link>
      </div>

      <div className="grid gap-3">
        {(slides ?? []).length === 0 ? (
          <div className="p-10 text-center bg-white rounded-card border border-dashed border-primary-200">
            <p className="text-primary-600">لا توجد شرائح بعد. أضف شريحة لتظهر للزوار.</p>
          </div>
        ) : (
          (slides ?? []).map((s: any, i: number) => (
            <div key={s.id} className="bg-white rounded-2xl border border-primary-100 p-5 flex items-start gap-4">
              <div className={`w-16 h-24 rounded-xl shrink-0 grid place-items-center text-white font-bold text-xl shadow-soft`}
                   style={{ backgroundImage: s.bg_gradient === 'cool' ? 'var(--gradient-cool)' : 'var(--gradient-aurora)' }}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                {s.badge && <div className="text-[10px] text-violet-700 bg-violet-50 inline-block px-2 py-0.5 rounded-full mb-1">{s.badge}</div>}
                <h3 className="font-semibold text-primary-900 truncate">{s.title}</h3>
                {s.subtitle && <p className="text-sm text-primary-600 line-clamp-1 mt-0.5">{s.subtitle}</p>}
                <div className="mt-2 flex items-center gap-3 text-xs">
                  <span className="text-primary-500">ترتيب: <strong className="text-primary-800">{s.order_index}</strong></span>
                  {s.cta_label && <span className="text-primary-500">CTA: <strong className="text-primary-800">{s.cta_label}</strong></span>}
                  <span className={`inline-flex items-center gap-1 ${s.is_active ? 'text-accent-600' : 'text-neutral-500'}`}>
                    {s.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {s.is_active ? 'نشط' : 'مخفي'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Link href={`/admin/cms/hero/${s.id}`} className="text-xs text-primary-700 hover:text-violet-600 inline-flex items-center gap-1">
                  <Edit className="w-3 h-3" /> تعديل
                </Link>
                <form action={deleteHeroSlideAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <button className="text-xs text-red-600">حذف</button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
