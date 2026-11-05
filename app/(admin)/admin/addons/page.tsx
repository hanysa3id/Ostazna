import { createServiceRoleClient } from '@/lib/supabase/server';
import { Plus, Package, Eye, EyeOff } from 'lucide-react';
import { saveAddonAction, deleteAddonAction } from './actions';
import { formatCurrencyEGP } from '@/lib/utils/numerals';

export const metadata = { title: 'الـ Add-ons' };
export const dynamic = 'force-dynamic';

export default async function AddonsPage() {
  const sb = createServiceRoleClient();
  const { data: addons } = await sb.from('addons').select('*').order('price_egp');

  // Usage count per addon
  const { data: counts } = await sb
    .from('teacher_addons')
    .select('addon_id');
  const usage = (counts ?? []).reduce<Record<string, number>>((acc, r: any) => {
    acc[r.addon_id] = (acc[r.addon_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-900 flex items-center gap-2">
          <Package className="w-6 h-6 text-violet-600" /> Add-ons
        </h1>
        <p className="mt-1 text-sm text-primary-700/80">
          الوحدات الإضافية المنفصلة. كل add-on يمكن تفعيله لمدرس بشكل مستقل، أو ضمّه لخطة.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {(addons ?? []).map((a: any) => (
          <form key={a.id} action={saveAddonAction} className="bg-white rounded-2xl border border-primary-100 p-5 space-y-3">
            <input type="hidden" name="id" value={a.id} />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-primary-700 text-white grid place-items-center text-xs font-bold">
                  {a.icon ? '✦' : a.key.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-primary-900">{a.name_ar}</h3>
                  <code className="text-[10px] text-primary-500">{a.key}</code>
                </div>
              </div>
              <span className="text-xs text-primary-500">{usage[a.id] ?? 0} مدرس</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-primary-700 mb-1">الاسم العربي</label>
                <input name="name_ar" defaultValue={a.name_ar} required className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-primary-700 mb-1">السعر (جنيه)</label>
                <input name="price_egp" type="number" min="0" defaultValue={a.price_egp} required className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-primary-700 mb-1">الوصف</label>
              <textarea name="description_ar" defaultValue={a.description_ar ?? ''} rows={2} className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-primary-700 mb-1">المفتاح (key)</label>
                <input name="key" defaultValue={a.key} required className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm font-mono text-xs" />
              </div>
              <div>
                <label className="block text-xs text-primary-700 mb-1">الأيقونة (lucide)</label>
                <input name="icon" defaultValue={a.icon ?? ''} placeholder="FileText" className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-sm text-primary-800">
                <input type="checkbox" name="is_active" defaultChecked={a.is_active} className="w-4 h-4" />
                <span className={`inline-flex items-center gap-1 ${a.is_active ? 'text-accent-600' : 'text-neutral-500'}`}>
                  {a.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  نشط
                </span>
              </label>
              <div className="flex items-center gap-3">
                <button formAction={deleteAddonAction} className="text-xs text-red-600">حذف</button>
                <button className="text-sm px-4 py-1.5 rounded-card bg-primary-700 text-white">حفظ</button>
              </div>
            </div>
          </form>
        ))}

        <form action={saveAddonAction} className="bg-violet-50/50 border border-dashed border-violet-200 rounded-2xl p-5 space-y-3">
          <h3 className="font-semibold text-primary-900 flex items-center gap-2"><Plus className="w-4 h-4" /> Add-on جديد</h3>
          <div className="grid grid-cols-2 gap-3">
            <input name="key" required placeholder="key (snake_case)" className="px-3 py-2 rounded-card border border-primary-200 text-sm font-mono text-xs" />
            <input name="price_egp" type="number" min="0" defaultValue={0} required className="px-3 py-2 rounded-card border border-primary-200 text-sm" />
            <input name="name_ar" required placeholder="الاسم بالعربية" className="col-span-2 px-3 py-2 rounded-card border border-primary-200 text-sm" />
          </div>
          <textarea name="description_ar" rows={2} placeholder="الوصف" className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm" />
          <input name="icon" placeholder="Icon name (lucide)" className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_active" defaultChecked /> نشط
          </label>
          <button className="text-sm px-4 py-2 rounded-card bg-violet-600 text-white">إضافة</button>
        </form>
      </div>

      {/* Live counter at bottom */}
      <div className="bg-white border border-primary-100 rounded-card p-4 text-sm text-primary-700">
        <strong>{(addons ?? []).length}</strong> Add-on معرّف ·{' '}
        <strong>{(counts ?? []).length}</strong> تفعيل نشط حالياً
      </div>
    </div>
  );
}
