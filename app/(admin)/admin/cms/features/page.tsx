import Link from 'next/link';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { Plus, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { deleteFeatureAction } from '../actions';

export const metadata = { title: 'المزايا' };
export const dynamic = 'force-dynamic';

export default async function FeaturesAdminPage() {
  const sb = createServiceRoleClient();
  const { data: features } = await sb.from('site_features').select('*').order('order_index');

  const primary = (features ?? []).filter(f => f.is_primary);
  const secondary = (features ?? []).filter(f => !f.is_primary);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">المزايا</h1>
          <p className="mt-1 text-sm text-primary-700/80">المزايا الأساسية لها صفحات داخلية بالشرح الكامل (/features/[slug]).</p>
        </div>
        <Link href="/admin/cms/features/new" className="text-sm px-4 py-2 rounded-card bg-primary-700 text-white inline-flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> ميزة جديدة
        </Link>
      </div>

      <Section title="المزايا الأساسية (4 بطاقات + صفحات داخلية)" features={primary} />
      <Section title="المزايا الثانوية (شبكة 8 بطاقات)" features={secondary} />
    </div>
  );
}

function Section({ title, features }: { title: string; features: any[] }) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">{title}</h2>
      <div className="grid gap-3">
        {features.length === 0 ? (
          <p className="text-sm text-primary-500 italic">لا يوجد عناصر.</p>
        ) : features.map(f => (
          <div key={f.id} className="bg-white rounded-2xl border border-primary-100 p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.tone} text-white grid place-items-center font-bold text-xs shrink-0`}>
              {f.icon.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-primary-900 truncate">{f.title}</h3>
                <code className="text-[10px] bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded">/{f.slug}</code>
                <span className={`text-[10px] inline-flex items-center gap-0.5 ${f.is_active ? 'text-accent-600' : 'text-neutral-500'}`}>
                  {f.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />} {f.is_active ? 'نشط' : 'مخفي'}
                </span>
              </div>
              <p className="text-xs text-primary-500 line-clamp-1 mt-0.5">{f.short_body}</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              {f.is_primary && (
                <a href={`/features/${f.slug}`} target="_blank" rel="noopener" className="text-primary-600 hover:text-violet-600 inline-flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> الصفحة
                </a>
              )}
              <Link href={`/admin/cms/features/${f.id}`} className="text-primary-700 hover:text-violet-600">تعديل</Link>
              <form action={deleteFeatureAction}>
                <input type="hidden" name="id" value={f.id} />
                <button className="text-red-600">حذف</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
