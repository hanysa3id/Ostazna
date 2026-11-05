import { createServiceRoleClient } from '@/lib/supabase/server';
import { Plus } from 'lucide-react';
import { saveFaqAction, deleteFaqAction } from '../actions';

export const metadata = { title: 'الأسئلة الشائعة' };
export const dynamic = 'force-dynamic';

export default async function FaqsAdminPage() {
  const sb = createServiceRoleClient();
  const { data: faqs } = await sb.from('site_faqs').select('*').order('order_index');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-900">الأسئلة الشائعة</h1>
        <p className="mt-1 text-sm text-primary-700/80">تظهر في قسم الـ FAQ في أسفل الصفحة الرئيسية.</p>
      </div>

      <div className="space-y-3">
        {(faqs ?? []).map((f: any) => (
          <form key={f.id} action={saveFaqAction} className="bg-white rounded-2xl border border-primary-100 p-5 space-y-3">
            <input type="hidden" name="id" value={f.id} />
            <input name="question" defaultValue={f.question} required placeholder="السؤال" className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm font-semibold" />
            <textarea name="answer" defaultValue={f.answer} required rows={2} placeholder="الجواب" className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm" />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_active" defaultChecked={f.is_active} /> نشط
              </label>
              <input name="order_index" type="number" defaultValue={f.order_index} className="w-20 px-3 py-1.5 rounded-card border border-primary-200 text-sm" />
              <button className="text-sm px-4 py-1.5 rounded-card bg-primary-700 text-white">حفظ</button>
              <button formAction={deleteFaqAction} className="text-xs text-red-600 ms-auto">حذف</button>
            </div>
          </form>
        ))}
      </div>

      <form action={saveFaqAction} className="bg-violet-50/50 border border-dashed border-violet-200 rounded-2xl p-5 space-y-3">
        <h3 className="font-semibold text-primary-900 inline-flex items-center gap-2"><Plus className="w-4 h-4" /> إضافة سؤال جديد</h3>
        <input name="question" required placeholder="السؤال" className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm" />
        <textarea name="answer" required rows={2} placeholder="الجواب" className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm" />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_active" defaultChecked /> نشط
          </label>
          <input name="order_index" type="number" defaultValue={99} className="w-20 px-3 py-1.5 rounded-card border border-primary-200 text-sm" />
          <button className="text-sm px-4 py-1.5 rounded-card bg-violet-600 text-white">إضافة</button>
        </div>
      </form>
    </div>
  );
}
