import Link from 'next/link';
import { Field, TextArea, Toggle, Select } from '@/components/admin/cms-form-fields';
import { saveHeroSlideAction } from '../../actions';

export const metadata = { title: 'شريحة جديدة' };

export default function NewHeroPage() {
  return (
    <div className="max-w-2xl space-y-5">
      <Link href="/admin/cms/hero" className="text-sm text-primary-700 hover:text-violet-600">← العودة</Link>
      <h1 className="text-2xl font-bold text-primary-900">إضافة شريحة جديدة</h1>

      <form action={saveHeroSlideAction} className="bg-white rounded-2xl border border-primary-100 p-6 space-y-4">
        <Field name="badge" label="البادج (اختياري)" placeholder="مثال: جديد · موقعك الشخصي مع كل خطة" />
        <Field name="title" label="العنوان الرئيسي" required placeholder="عنوان جذاب يصف الميزة الأساسية" />
        <Field name="highlight" label="الكلمة المميزة (gradient)" placeholder="كلمة من العنوان ستظهر بالـ gradient" hint="يجب أن تكون موجودة بالضبط داخل العنوان." />
        <TextArea name="subtitle" label="الوصف" rows={2} />

        <div className="grid grid-cols-2 gap-3">
          <Field name="cta_label" label="نص الزر" defaultValue="ابدأ مجاناً" />
          <Field name="cta_href" label="رابط الزر" defaultValue="/register" />
        </div>

        <Field name="image_url" label="صورة الخلفية (URL — اختياري)" placeholder="https://..." />

        <div className="grid grid-cols-2 gap-3">
          <Select name="bg_gradient" label="الـ Gradient" defaultValue="aurora" options={[
            { value: 'aurora', label: 'Aurora (متعدد)' },
            { value: 'cool',   label: 'Cool (أزرق)' },
          ]} />
          <Field name="order_index" label="ترتيب العرض" type="number" defaultValue="1" />
        </div>

        <Toggle name="is_active" label="منشور" defaultChecked />

        <button className="w-full px-4 py-2.5 rounded-card bg-primary-700 text-white font-medium">إضافة الشريحة</button>
      </form>
    </div>
  );
}
