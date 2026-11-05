import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { Field, TextArea, Toggle, Select } from '@/components/admin/cms-form-fields';
import { saveHeroSlideAction, deleteHeroSlideAction } from '../../actions';

export const metadata = { title: 'تعديل شريحة' };
export const dynamic = 'force-dynamic';

export default async function EditHeroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = createServiceRoleClient();
  const { data: s } = await sb.from('site_hero_slides').select('*').eq('id', id).maybeSingle();
  if (!s) notFound();

  return (
    <div className="max-w-2xl space-y-5">
      <Link href="/admin/cms/hero" className="text-sm text-primary-700 hover:text-violet-600">← العودة</Link>
      <h1 className="text-2xl font-bold text-primary-900">تعديل: {s.title}</h1>

      <form action={saveHeroSlideAction} className="bg-white rounded-2xl border border-primary-100 p-6 space-y-4">
        <input type="hidden" name="id" value={s.id} />

        <Field name="badge" label="البادج" defaultValue={s.badge ?? ''} />
        <Field name="title" label="العنوان" required defaultValue={s.title} />
        <Field name="highlight" label="الكلمة المميزة" defaultValue={s.highlight ?? ''} />
        <TextArea name="subtitle" label="الوصف" rows={2} defaultValue={s.subtitle ?? ''} />

        <div className="grid grid-cols-2 gap-3">
          <Field name="cta_label" label="نص الزر" defaultValue={s.cta_label ?? ''} />
          <Field name="cta_href"  label="رابط الزر" defaultValue={s.cta_href ?? ''} />
        </div>

        <Field name="image_url" label="صورة الخلفية" defaultValue={s.image_url ?? ''} />

        <div className="grid grid-cols-2 gap-3">
          <Select name="bg_gradient" label="الـ Gradient" defaultValue={s.bg_gradient} options={[
            { value: 'aurora', label: 'Aurora' },
            { value: 'cool',   label: 'Cool' },
          ]} />
          <Field name="order_index" label="الترتيب" type="number" defaultValue={String(s.order_index)} />
        </div>

        <Toggle name="is_active" label="منشور" defaultChecked={s.is_active} />

        <div className="flex items-center justify-between">
          <button className="px-5 py-2.5 rounded-card bg-primary-700 text-white">حفظ</button>
        </div>
      </form>

      <form action={deleteHeroSlideAction} className="text-end">
        <input type="hidden" name="id" value={s.id} />
        <button className="text-xs text-red-600">حذف الشريحة</button>
      </form>
    </div>
  );
}
