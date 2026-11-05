import Link from 'next/link';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { Plus } from 'lucide-react';
import { saveStatAction, deleteStatAction } from '../actions';

export const metadata = { title: 'الإحصائيات' };
export const dynamic = 'force-dynamic';

const SOURCES: Record<string, string> = {
  manual:         'يدوي',
  live_teachers:  'حقيقي — عدد المدرسين',
  live_students:  'حقيقي — عدد الطلاب',
  live_uptime:    'وقت التشغيل',
};

export default async function StatsAdminPage() {
  const sb = createServiceRoleClient();
  const { data: stats } = await sb.from('site_stats').select('*').order('order_index');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-900">الإحصائيات</h1>
        <p className="mt-1 text-sm text-primary-700/80">
          الأرقام التي تظهر في قسم "ثقة المئات من المدرسين". الأرقام بمصدر "حقيقي" تُحدّث تلقائياً من قاعدة البيانات (الرقم اليدوي يُستخدم كحد أدنى).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(stats ?? []).map((s: any) => (
          <form key={s.id} action={saveStatAction} className="bg-white rounded-2xl border border-primary-100 p-5 space-y-3">
            <input type="hidden" name="id" value={s.id} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-primary-700 mb-1">التسمية</label>
                <input name="label" defaultValue={s.label} required className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-primary-700 mb-1">الترتيب</label>
                <input name="order_index" type="number" defaultValue={s.order_index} className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-primary-700 mb-1">القيمة (الحد الأدنى)</label>
                <input name="value" type="number" defaultValue={s.value} required className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-primary-700 mb-1">اللاحقة</label>
                <input name="suffix" defaultValue={s.suffix ?? ''} placeholder="+ / % / k+" className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-primary-700 mb-1">المصدر</label>
              <select name="source" defaultValue={s.source} className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm">
                {Object.entries(SOURCES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-primary-800">
              <input type="checkbox" name="is_active" defaultChecked={s.is_active} className="w-4 h-4 rounded border-primary-300" /> نشط
            </label>
            <div className="flex items-center justify-between pt-2">
              <button className="text-sm px-4 py-2 rounded-card bg-primary-700 text-white">حفظ</button>
              <button formAction={deleteStatAction} className="text-xs text-red-600">حذف</button>
            </div>
          </form>
        ))}
      </div>

      <form action={saveStatAction} className="bg-violet-50/50 border border-dashed border-violet-200 rounded-2xl p-5 space-y-3">
        <h3 className="font-semibold text-primary-900 inline-flex items-center gap-2"><Plus className="w-4 h-4" /> إضافة إحصائية جديدة</h3>
        <div className="grid grid-cols-2 gap-3">
          <input name="label" placeholder="التسمية" required className="px-3 py-2 rounded-card border border-primary-200 text-sm" />
          <input name="value" type="number" placeholder="القيمة" required className="px-3 py-2 rounded-card border border-primary-200 text-sm" />
          <input name="suffix" placeholder="اللاحقة (+ / %)" className="px-3 py-2 rounded-card border border-primary-200 text-sm" />
          <input name="order_index" type="number" defaultValue={99} className="px-3 py-2 rounded-card border border-primary-200 text-sm" />
        </div>
        <select name="source" defaultValue="manual" className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm">
          {Object.entries(SOURCES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked /> نشط
        </label>
        <button className="text-sm px-4 py-2 rounded-card bg-violet-600 text-white">إضافة</button>
      </form>
    </div>
  );
}
