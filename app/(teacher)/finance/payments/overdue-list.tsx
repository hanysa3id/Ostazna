'use client';

import { useTransition } from 'react';
import { MessageCircle } from 'lucide-react';
import { formatCurrencyEGP } from '@/lib/utils/numerals';
import { sendWaReminderAction } from './actions';

type Item = {
  student_id: string;
  name_ar: string;
  parent_phone: string | null;
  group_name: string;
  amount_due: number;
  last_period_to: string | null;
};

export function OverdueList({ items }: { items: Item[] }) {
  const [pending, start] = useTransition();

  if (!items || items.length === 0) return null;

  function remind(item: Item) {
    start(async () => {
      const res = await sendWaReminderAction({
        studentId: item.student_id,
        recipientPhone: item.parent_phone ?? '',
        amountEGP: Number(item.amount_due ?? 0),
      });
      if (res.error) {
        alert(res.error);
        return;
      }
      if (res.url) window.open(res.url, '_blank', 'noopener,noreferrer');
    });
  }

  return (
    <section className="bg-amber-50 border border-amber-200 rounded-card p-5">
      <h2 className="font-semibold text-amber-900 mb-3">متأخرون في الدفع ({items.length})</h2>
      <ul className="divide-y divide-amber-200">
        {items.map(it => (
          <li key={it.student_id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
            <div>
              <div className="font-medium text-neutral-900">{it.name_ar}</div>
              <div className="text-xs text-neutral-500">
                {it.group_name} · مستحق منذ {it.last_period_to ?? 'بداية الاشتراك'}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium text-amber-900">{formatCurrencyEGP(Number(it.amount_due ?? 0))}</span>
              <button
                onClick={() => remind(it)}
                disabled={pending || !it.parent_phone}
                title={it.parent_phone ? 'تذكير عبر واتساب' : 'لا يوجد رقم ولي أمر'}
                className="text-xs px-3 py-1.5 rounded-card bg-accent-500 text-white disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" /> تذكير
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
