'use client';

import { useActionState } from 'react';
import { createExamAction, type ExamState } from '../actions';

const INITIAL: ExamState = {};

export function ExamForm() {
  const [state, formAction, pending] = useActionState(createExamAction, INITIAL);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">عنوان الاختبار</label>
        <input name="title" required minLength={2} className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">الوصف</label>
        <textarea name="description" rows={3} className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">المدة (دقيقة)</label>
          <input name="duration_minutes" type="number" min={1} max={300} defaultValue={60} required className="w-full px-3 py-2 rounded-card border border-neutral-300" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">الدرجة الكلية</label>
          <input name="total_marks" type="number" min={1} defaultValue={100} required className="w-full px-3 py-2 rounded-card border border-neutral-300" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">درجة النجاح</label>
          <input name="pass_marks" type="number" min={0} defaultValue={50} required className="w-full px-3 py-2 rounded-card border border-neutral-300" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">يبدأ في</label>
          <input name="starts_at" type="datetime-local" className="w-full px-3 py-2 rounded-card border border-neutral-300" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">ينتهي في</label>
          <input name="ends_at" type="datetime-local" className="w-full px-3 py-2 rounded-card border border-neutral-300" />
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-card px-3 py-2">{state.error}</p>}

      <button type="submit" disabled={pending} className="w-full px-4 py-2.5 rounded-card bg-primary-700 text-white font-medium disabled:opacity-60">
        {pending ? '...' : 'إنشاء الاختبار'}
      </button>
    </form>
  );
}
