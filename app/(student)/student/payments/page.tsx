import { createClient } from '@/lib/supabase/server';
import { formatCurrencyEGP } from '@/lib/utils/numerals';
import { formatDate } from '@/lib/utils/dates';

export const metadata = { title: 'مدفوعاتي' };
export const dynamic = 'force-dynamic';

export default async function StudentPaymentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: student } = await supabase
    .from('students').select('id').eq('user_id', user.id).maybeSingle();
  if (!student) return null;

  const { data: payments } = await supabase
    .from('payments')
    .select('id, amount, payment_date, method, period_from, period_to, notes')
    .eq('student_id', student.id)
    .order('payment_date', { ascending: false });

  const total = (payments ?? []).reduce((s, p: any) => s + Number(p.amount), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-900">مدفوعاتي</h1>
        <span className="text-sm text-neutral-600">
          الإجمالي: <span className="font-semibold text-accent-600">{formatCurrencyEGP(total)}</span>
        </span>
      </div>

      {(payments ?? []).length === 0 ? (
        <div className="p-10 text-center bg-white rounded-card border border-dashed border-neutral-300">
          <p className="text-neutral-600">لا توجد مدفوعات.</p>
        </div>
      ) : (
        <div className="bg-white rounded-card border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="text-start px-4 py-3 font-medium">التاريخ</th>
                <th className="text-start px-4 py-3 font-medium">الفترة</th>
                <th className="text-start px-4 py-3 font-medium">الطريقة</th>
                <th className="text-end   px-4 py-3 font-medium">المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {(payments ?? []).map((p: any) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 text-neutral-700">{formatDate(p.payment_date)}</td>
                  <td className="px-4 py-3 text-neutral-500 text-xs">{p.period_from && p.period_to ? `${p.period_from} → ${p.period_to}` : '—'}</td>
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
