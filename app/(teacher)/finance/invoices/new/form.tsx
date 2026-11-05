'use client';

import { useActionState, useState } from 'react';
import { issueInvoiceAction, type InvoiceActionState } from '../actions';

const INITIAL: InvoiceActionState = {};

type Item = { description: string; quantity: number; unit_price: number };

export function InvoiceForm({ students }: { students: { id: string; name_ar: string }[] }) {
  const [state, formAction, pending] = useActionState(issueInvoiceAction, INITIAL);
  const [items, setItems] = useState<Item[]>([
    { description: 'اشتراك الشهر', quantity: 1, unit_price: 500 },
  ]);

  const total = items.reduce((s, i) => s + i.quantity * i.unit_price, 0);

  function update(idx: number, patch: Partial<Item>) {
    setItems(it => it.map((x, i) => (i === idx ? { ...x, ...patch } : x)));
  }
  function add() { setItems(it => [...it, { description: '', quantity: 1, unit_price: 0 }]); }
  function remove(idx: number) { setItems(it => it.filter((_, i) => i !== idx)); }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <input type="hidden" name="amount" value={String(total)} />

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">الطالب</label>
        <select name="student_id" required className="w-full px-3 py-2.5 rounded-card border border-neutral-300">
          <option value="">اختر طالباً</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name_ar}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">تاريخ الاستحقاق</label>
        <input name="due_date" type="date" className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-neutral-700">البنود</label>
          <button type="button" onClick={add} className="text-xs text-primary-700">+ بند</button>
        </div>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input
                value={it.description}
                onChange={e => update(i, { description: e.target.value })}
                placeholder="الوصف"
                className="col-span-6 px-2 py-1.5 rounded border border-neutral-300 text-sm"
              />
              <input
                type="number" min={1} value={it.quantity}
                onChange={e => update(i, { quantity: Number(e.target.value) })}
                className="col-span-2 px-2 py-1.5 rounded border border-neutral-300 text-sm"
              />
              <input
                type="number" min={0} step="0.01" value={it.unit_price}
                onChange={e => update(i, { unit_price: Number(e.target.value) })}
                className="col-span-3 px-2 py-1.5 rounded border border-neutral-300 text-sm"
              />
              <button type="button" onClick={() => remove(i)} className="col-span-1 text-red-600 text-xs">×</button>
            </div>
          ))}
        </div>
        <div className="mt-3 text-end text-sm font-semibold">الإجمالي: {total.toLocaleString('ar-EG')} جنيه</div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">ملاحظات</label>
        <textarea name="notes" rows={2} className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300" />
      </div>

      {state.error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-card px-3 py-2">{state.error}</p>}

      <button type="submit" disabled={pending} className="w-full px-4 py-2.5 rounded-card bg-primary-700 text-white font-medium disabled:opacity-60">
        {pending ? '...' : 'إصدار الفاتورة'}
      </button>
    </form>
  );
}
