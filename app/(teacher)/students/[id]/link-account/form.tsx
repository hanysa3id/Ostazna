'use client';

import { useActionState } from 'react';
import { linkStudentAccountAction, unlinkStudentAccountAction, type LinkState } from './actions';

const INITIAL: LinkState = {};

export function LinkAccountForm({ studentId, currentLinked }: { studentId: string; currentLinked: boolean }) {
  const [state, formAction, pending] = useActionState(linkStudentAccountAction, INITIAL);

  if (currentLinked) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-accent-700 bg-accent-500/10 border border-accent-500/30 rounded-card px-3 py-2">
          ✓ الحساب مربوط بهذا الطالب.
        </p>
        <form action={unlinkStudentAccountAction}>
          <input type="hidden" name="id" value={studentId} />
          <button className="text-xs text-red-600">إلغاء الربط</button>
        </form>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={studentId} />
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">بريد الطالب</label>
        <input name="email" type="email" required className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300" />
      </div>
      {state.error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-card px-3 py-2">{state.error}</p>}
      {state.ok && <p className="text-sm text-accent-700 bg-accent-500/10 border border-accent-500/30 rounded-card px-3 py-2">تم الربط ✓</p>}
      <button type="submit" disabled={pending} className="w-full px-4 py-2.5 rounded-card bg-primary-700 text-white font-medium disabled:opacity-60">
        {pending ? '...' : 'ربط الحساب'}
      </button>
    </form>
  );
}
