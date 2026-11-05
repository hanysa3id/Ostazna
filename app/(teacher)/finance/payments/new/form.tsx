'use client';

import { useActionState } from 'react';
import { recordPaymentAction, type PaymentActionState } from '../actions';

const INITIAL: PaymentActionState = {};

export function PaymentForm({ students }: { students: { id: string; name_ar: string }[] }) {
  const [state, formAction, pending] = useActionState(recordPaymentAction, INITIAL);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">الطالب</label>
        <select name="student_id" required className="w-full px-3 py-2.5 rounded-card border border-neutral-300">
          <option value="">اختر طالباً</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name_ar}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">المبلغ</label>
          <input name="amount" type="number" step="0.01" min="0.01" required
            className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">الطريقة</label>
          <select name="method" defaultValue="cash" className="w-full px-3 py-2.5 rounded-card border border-neutral-300">
            <option value="cash">نقدي</option>
            <option value="bank_transfer">تحويل بنكي</option>
            <option value="wallet">محفظة</option>
            <option value="other">أخرى</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">تاريخ الدفع</label>
        <input name="payment_date" type="date" defaultValue={today} required
          className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">من تاريخ</label>
          <input name="period_from" type="date" className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">إلى تاريخ</label>
          <input name="period_to" type="date" className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">ملاحظات</label>
        <textarea name="notes" rows={2} className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300" />
      </div>

      {state.error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-card px-3 py-2">{state.error}</p>}

      <button type="submit" disabled={pending} className="w-full px-4 py-2.5 rounded-card bg-primary-700 text-white font-medium disabled:opacity-60">
        {pending ? '...' : 'تسجيل الدفعة'}
      </button>
    </form>
  );
}
