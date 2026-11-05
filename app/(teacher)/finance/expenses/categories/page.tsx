import { createClient } from '@/lib/supabase/server';
import { addCategoryAction, deleteCategoryAction } from '../actions';

export const metadata = { title: 'تصنيفات المصروفات' };
export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: cats } = await supabase.from('expense_categories').select('*').order('name');

  return (
    <div className="space-y-5 max-w-xl">
      <h1 className="text-2xl font-bold text-primary-900">تصنيفات المصروفات</h1>

      <form action={addCategoryAction} className="bg-white rounded-card border border-neutral-200 p-4 flex gap-2">
        <input name="name" required placeholder="اسم التصنيف" className="flex-1 px-3 py-2 rounded-card border border-neutral-300" />
        <input name="color" type="color" defaultValue="#eef4fb" className="w-12 rounded-card border border-neutral-300" />
        <button className="px-4 py-2 rounded-card bg-primary-700 text-white text-sm">إضافة</button>
      </form>

      <ul className="bg-white rounded-card border border-neutral-200 divide-y divide-neutral-100">
        {(cats ?? []).map(c => (
          <li key={c.id} className="p-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded" style={{ backgroundColor: c.color ?? '#eef4fb' }} />
              {c.name}
            </span>
            <form action={deleteCategoryAction}>
              <input type="hidden" name="id" value={c.id} />
              <button className="text-xs text-red-600">حذف</button>
            </form>
          </li>
        ))}
        {(cats ?? []).length === 0 && <li className="p-4 text-sm text-neutral-500">لا توجد تصنيفات.</li>}
      </ul>
    </div>
  );
}
