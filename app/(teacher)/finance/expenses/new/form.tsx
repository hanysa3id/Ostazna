'use client';

import { useActionState, useState } from 'react';
import { ImageUploader } from '@/components/shared/image-uploader';
import { addExpenseAction, type ExpenseActionState } from '../actions';

const INITIAL: ExpenseActionState = {};

export function ExpenseForm({
  categories,
  teacherId,
}: { categories: { id: string; name: string }[]; teacherId: string }) {
  const [state, formAction, pending] = useActionState(addExpenseAction, INITIAL);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="receipt_url" value={receiptUrl ?? ''} />
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">المبلغ</label>
        <input name="amount" type="number" step="0.01" min="0.01" required
          className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">التاريخ</label>
        <input name="expense_date" type="date" defaultValue={today} required
          className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">التصنيف</label>
        <select name="category_id" className="w-full px-3 py-2.5 rounded-card border border-neutral-300">
          <option value="">— بدون —</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">الوصف</label>
        <input name="description" className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">صورة الإيصال (اختياري)</label>
        <ImageUploader
          bucket="receipts"
          teacherId={teacherId}
          entity="expense"
          accept="image/*,application/pdf"
          onUploaded={(url) => setReceiptUrl(url || null)}
        />
      </div>

      {state.error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-card px-3 py-2">{state.error}</p>}

      <button type="submit" disabled={pending} className="w-full px-4 py-2.5 rounded-card bg-primary-700 text-white font-medium disabled:opacity-60">
        {pending ? '...' : 'حفظ'}
      </button>
    </form>
  );
}
