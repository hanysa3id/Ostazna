import { createServiceRoleClient } from '@/lib/supabase/server';
import { Star } from 'lucide-react';
import { saveTestimonialAction, deleteTestimonialAction } from '../actions';

export const metadata = { title: 'آراء العملاء' };
export const dynamic = 'force-dynamic';

export default async function TestimonialsAdminPage() {
  const sb = createServiceRoleClient();
  const { data: items } = await sb.from('site_testimonials').select('*').order('order_index');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-900">آراء العملاء</h1>
        <p className="mt-1 text-sm text-primary-700/80">تعليقات المدرسين الظاهرة في الصفحة الرئيسية. أضف رابط صورة (Avatar URL) لكل تعليق.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {(items ?? []).map((t: any) => (
          <form key={t.id} action={saveTestimonialAction} className="bg-white rounded-2xl border border-primary-100 p-5 space-y-3">
            <input type="hidden" name="id" value={t.id} />
            <div className="flex items-center gap-3">
              {t.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-violet-200" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-100 grid place-items-center font-bold text-primary-700">{t.name?.[0]}</div>
              )}
              <div className="flex-1">
                <input name="name" defaultValue={t.name} required placeholder="الاسم" className="w-full px-3 py-1.5 rounded-card border border-primary-200 text-sm font-semibold" />
              </div>
            </div>
            <input name="role" defaultValue={t.role ?? ''} placeholder="الوظيفة / المدينة" className="w-full px-3 py-1.5 rounded-card border border-primary-200 text-sm" />
            <input name="avatar_url" defaultValue={t.avatar_url ?? ''} placeholder="رابط الصورة" className="w-full px-3 py-1.5 rounded-card border border-primary-200 text-sm font-mono text-xs" />
            <textarea name="body" defaultValue={t.body} required rows={3} placeholder="نص التعليق" className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm" />
            <div className="grid grid-cols-3 gap-2">
              <select name="rating" defaultValue={t.rating} className="px-3 py-1.5 rounded-card border border-primary-200 text-sm">
                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} نجوم</option>)}
              </select>
              <input name="order_index" type="number" defaultValue={t.order_index} className="px-3 py-1.5 rounded-card border border-primary-200 text-sm" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_active" defaultChecked={t.is_active} /> نشط
              </label>
            </div>
            <div className="flex items-center justify-between pt-1">
              <button className="text-sm px-4 py-1.5 rounded-card bg-primary-700 text-white">حفظ</button>
              <button formAction={deleteTestimonialAction} className="text-xs text-red-600">حذف</button>
            </div>
          </form>
        ))}

        <form action={saveTestimonialAction} className="bg-violet-50/50 border border-dashed border-violet-200 rounded-2xl p-5 space-y-3">
          <h3 className="font-semibold text-primary-900 flex items-center gap-2">
            <Star className="w-4 h-4" /> إضافة تعليق جديد
          </h3>
          <input name="name" required placeholder="الاسم" className="w-full px-3 py-1.5 rounded-card border border-primary-200 text-sm" />
          <input name="role" placeholder="الوظيفة / المدينة" className="w-full px-3 py-1.5 rounded-card border border-primary-200 text-sm" />
          <input name="avatar_url" placeholder="رابط الصورة (https://...)" className="w-full px-3 py-1.5 rounded-card border border-primary-200 text-sm font-mono text-xs" />
          <textarea name="body" required rows={3} placeholder="نص التعليق" className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm" />
          <div className="grid grid-cols-3 gap-2">
            <select name="rating" defaultValue="5" className="px-3 py-1.5 rounded-card border border-primary-200 text-sm">
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} نجوم</option>)}
            </select>
            <input name="order_index" type="number" defaultValue={99} className="px-3 py-1.5 rounded-card border border-primary-200 text-sm" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_active" defaultChecked /> نشط
            </label>
          </div>
          <button className="text-sm px-4 py-1.5 rounded-card bg-violet-600 text-white">إضافة</button>
        </form>
      </div>
    </div>
  );
}
