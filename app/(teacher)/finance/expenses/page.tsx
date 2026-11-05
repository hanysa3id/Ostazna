import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatCurrencyEGP } from '@/lib/utils/numerals';
import { formatDate } from '@/lib/utils/dates';

export const metadata = { title: 'المصروفات' };
export const dynamic = 'force-dynamic';

export default async function ExpensesPage() {
  const supabase = await createClient();
  const since = new Date(); since.setDate(1); since.setHours(0, 0, 0, 0);

  const [{ data: expenses }, { data: monthly }, { data: categories }] = await Promise.all([
    supabase
      .from('expenses')
      .select('*, category:expense_categories(name, color)')
      .order('expense_date', { ascending: false })
      .limit(100),
    supabase.from('expenses').select('amount').gte('expense_date', since.toISOString().slice(0, 10)),
    supabase.from('expense_categories').select('id, name, color'),
  ]);

  const monthTotal = (monthly ?? []).reduce((s, r: any) => s + Number(r.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-primary-900">المصروفات</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-600">
            هذا الشهر: <span className="font-semibold text-red-700">{formatCurrencyEGP(monthTotal)}</span>
          </span>
          <Link href="/finance/expenses/new" className="text-sm px-4 py-2 rounded-card bg-primary-700 text-white">إضافة مصروف</Link>
        </div>
      </div>

      <section className="bg-white rounded-card border border-neutral-200 p-5">
        <h2 className="font-semibold mb-3">التصنيفات</h2>
        {(categories ?? []).length === 0 ? (
          <p className="text-sm text-neutral-500">
            لا توجد تصنيفات. <Link href="/finance/expenses/categories" className="text-primary-700">أنشئ تصنيفاً</Link>
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(categories ?? []).map(c => (
              <span key={c.id} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: c.color ?? '#eef4fb' }}>
                {c.name}
              </span>
            ))}
            <Link href="/finance/expenses/categories" className="text-xs px-2 py-1 text-primary-700">إدارة →</Link>
          </div>
        )}
      </section>

      {(expenses ?? []).length === 0 ? (
        <div className="p-10 text-center bg-white rounded-card border border-dashed border-neutral-300">
          <p className="text-neutral-600">لا توجد مصروفات بعد.</p>
        </div>
      ) : (
        <div className="bg-white rounded-card border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="text-start px-4 py-3 font-medium">التاريخ</th>
                <th className="text-start px-4 py-3 font-medium">الوصف</th>
                <th className="text-start px-4 py-3 font-medium">التصنيف</th>
                <th className="text-end   px-4 py-3 font-medium">المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {(expenses ?? []).map((e: any) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 text-neutral-700">{formatDate(e.expense_date)}</td>
                  <td className="px-4 py-3">{e.description ?? '—'}</td>
                  <td className="px-4 py-3 text-neutral-600">{e.category?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-end font-medium text-red-700">{formatCurrencyEGP(Number(e.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
