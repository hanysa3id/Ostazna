import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { listPayments, monthRevenueEGP, listOverdueStudents } from '@/lib/dal/payments';
import { formatCurrencyEGP } from '@/lib/utils/numerals';
import { formatDate } from '@/lib/utils/dates';
import { OverdueList } from './overdue-list';

export const metadata = { title: 'المدفوعات' };
export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
  const supabase = await createClient();
  const [payments, total, overdue, { data: students }] = await Promise.all([
    listPayments({ limit: 50 }),
    monthRevenueEGP(),
    listOverdueStudents(),
    supabase.from('students').select('id, name_ar, parent_phone').is('archived_at', null).order('name_ar'),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-primary-900">المدفوعات</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-600">
            هذا الشهر: <span className="font-semibold text-accent-600">{formatCurrencyEGP(total)}</span>
          </span>
          <Link href="/finance/payments/new" className="text-sm px-4 py-2 rounded-card bg-primary-700 text-white">تسجيل دفعة</Link>
        </div>
      </div>

      <OverdueList items={overdue as any[]} />

      {payments.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-card border border-dashed border-neutral-300">
          <p className="text-neutral-600">لا توجد مدفوعات بعد.</p>
        </div>
      ) : (
        <div className="bg-white rounded-card border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="text-start px-4 py-3 font-medium">التاريخ</th>
                <th className="text-start px-4 py-3 font-medium">الطالب</th>
                <th className="text-start px-4 py-3 font-medium">الفترة</th>
                <th className="text-start px-4 py-3 font-medium">الطريقة</th>
                <th className="text-end   px-4 py-3 font-medium">المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {payments.map((p: any) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 text-neutral-700">{formatDate(p.payment_date)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/students/${p.student_id}`} className="text-primary-700">{p.student?.name_ar ?? '—'}</Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-500 text-xs">
                    {p.period_from && p.period_to ? `${p.period_from} → ${p.period_to}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{p.method}</td>
                  <td className="px-4 py-3 text-end font-medium">{formatCurrencyEGP(Number(p.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
