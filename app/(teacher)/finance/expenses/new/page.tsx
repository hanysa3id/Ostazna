import { createClient } from '@/lib/supabase/server';
import { getCurrentTeacher } from '@/lib/dal/teachers';
import { ExpenseForm } from './form';

export const metadata = { title: 'إضافة مصروف' };
export const dynamic = 'force-dynamic';

export default async function NewExpensePage() {
  const supabase = await createClient();
  const teacher = await getCurrentTeacher();
  const { data: categories } = await supabase.from('expense_categories').select('id, name').order('name');

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-primary-900 mb-6">إضافة مصروف</h1>
      <div className="bg-white rounded-card border border-neutral-200 p-6">
        <ExpenseForm categories={categories ?? []} teacherId={teacher?.id ?? ''} />
      </div>
    </div>
  );
}
