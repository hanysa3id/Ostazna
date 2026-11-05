import { createServiceRoleClient } from '@/lib/supabase/server';
import { updatePlanAction } from './actions';
import { Layers, Sparkles } from 'lucide-react';

export const metadata = { title: 'الخطط والأسعار' };
export const dynamic = 'force-dynamic';

const TIER_TONES: Record<string, string> = {
  free:    'from-neutral-400 to-neutral-500',
  basic:   'from-cyan-500 to-primary-500',
  pro:     'from-violet-500 to-primary-700',
  premium: 'from-secondary-500 to-violet-600',
};

export default async function AdminPlansPage() {
  const sb = createServiceRoleClient();
  const [{ data: plans }, { data: addons }] = await Promise.all([
    sb.from('plans').select('*').order('price_egp'),
    sb.from('addons').select('key, name_ar').eq('is_active', true).order('name_ar'),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-900 flex items-center gap-2">
          <Layers className="w-6 h-6 text-violet-600" /> الخطط والأسعار
        </h1>
        <p className="mt-1 text-sm text-primary-700/80">
          عدّل أسعار الخطط، سقوف الطلاب والواتساب، والـ Add-ons المضمّنة في كل خطة.
          التغييرات تنعكس فوراً على صفحة <code>/pricing</code>.
        </p>
      </div>

      {addons && addons.length > 0 && (
        <div className="bg-violet-50 border border-violet-100 rounded-card p-4 text-xs text-violet-800">
          <strong>Add-ons المتاحة (استخدم المفاتيح):</strong>{' '}
          <code className="bg-white px-1.5 py-0.5 rounded text-[10px]">{addons.map(a => a.key).join(', ')}</code>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {(plans ?? []).map(plan => (
          <form key={plan.id} action={updatePlanAction} className="bg-white rounded-2xl border border-primary-100 overflow-hidden">
            <input type="hidden" name="id" value={plan.id} />
            <div className={`relative h-2 bg-gradient-to-r ${TIER_TONES[plan.tier] ?? 'from-primary-500 to-violet-500'}`} />

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${TIER_TONES[plan.tier]} text-white grid place-items-center font-bold text-sm uppercase shadow-soft`}>
                    {plan.tier.slice(0, 2)}
                  </span>
                  <code className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded">{plan.tier}</code>
                </div>
                {plan.tier === 'pro' && (
                  <span className="text-[10px] font-bold text-violet-700 bg-violet-100 px-2 py-1 rounded-full inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> الأكثر شعبية
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-primary-700 mb-1">الاسم العربي</label>
                  <input name="name_ar" defaultValue={plan.name_ar} required className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-primary-700 mb-1">الاسم الإنجليزي</label>
                  <input name="name_en" defaultValue={plan.name_en} className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-primary-700 mb-1">السعر (جنيه/شهر)</label>
                <input name="price_egp" type="number" min="0" defaultValue={plan.price_egp} required
                  className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-primary-700 mb-1">سقف الطلاب</label>
                  <input name="student_cap" type="number" min="0" defaultValue={plan.student_cap ?? ''}
                    placeholder="فارغ = بدون حد"
                    className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-primary-700 mb-1">سقف واتساب/شهر</label>
                  <input name="wa_cap_monthly" type="number" min="0" defaultValue={plan.wa_cap_monthly ?? ''}
                    placeholder="فارغ = بدون حد"
                    className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-primary-700 mb-1">Add-ons المضمّنة (مفصولة بفاصلة)</label>
                <input name="bundled_addons" defaultValue={(plan.bundled_addons ?? []).join(', ')}
                  placeholder="invoices, advanced_reports, theme_builder"
                  className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm font-mono text-xs" />
              </div>

              <label className="flex items-center gap-2 text-sm text-primary-800">
                <input type="checkbox" name="is_active" defaultChecked={plan.is_active} className="w-4 h-4 rounded border-primary-300" />
                نشطة (ظاهرة للمستخدمين)
              </label>

              <button className="w-full px-4 py-2.5 rounded-card bg-primary-700 text-white font-medium">حفظ</button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
