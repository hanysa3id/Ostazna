import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatCurrencyEGP } from '@/lib/utils/numerals';
import { formatDate } from '@/lib/utils/dates';

export const metadata = { title: 'الفواتير' };
export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<string, string> = {
  draft: 'مسودة',
  issued: 'مُصدرة',
  paid: 'مدفوعة',
  cancelled: 'ملغاة',
};

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, student:students(name_ar)')
    .order('issued_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-primary-900">الفواتير الرسمية</h1>
        <Link href="/finance/invoices/new" className="text-sm px-4 py-2 rounded-card bg-primary-700 text-white">إصدار فاتورة</Link>
      </div>

      {(invoices ?? []).length === 0 ? (
        <div className="p-10 text-center bg-white rounded-card border border-dashed border-neutral-300">
          <p className="text-neutral-600">لا توجد فواتير بعد.</p>
        </div>
      ) : (
        <div className="bg-white rounded-card border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="text-start px-4 py-3 font-medium">الرقم</th>
                <th className="text-start px-4 py-3 font-medium">الطالب</th>
                <th className="text-start px-4 py-3 font-medium">التاريخ</th>
                <th className="text-start px-4 py-3 font-medium">الحالة</th>
                <th className="text-end   px-4 py-3 font-medium">المبلغ</th>
                <th className="text-start px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {(invoices ?? []).map((inv: any) => (
                <tr key={inv.id}>
                  <td className="px-4 py-3 font-mono">{inv.invoice_number}</td>
                  <td className="px-4 py-3">{inv.student?.name_ar ?? '—'}</td>
                  <td className="px-4 py-3 text-neutral-600">{formatDate(inv.issued_at)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-neutral-100">{STATUS_LABELS[inv.status]}</span>
                  </td>
                  <td className="px-4 py-3 text-end font-medium">{formatCurrencyEGP(Number(inv.amount))}</td>
                  <td className="px-4 py-3 text-end">
                    <a href={`/api/invoices/${inv.id}/pdf`} target="_blank" rel="noopener" className="text-primary-700 text-xs">PDF ↗</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
