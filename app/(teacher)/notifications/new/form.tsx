'use client';

import { useActionState, useState } from 'react';
import { sendNotificationAction, type NotifyState } from '../actions';

const INITIAL: NotifyState = {};

export function NotificationForm({
  groups,
  students,
}: {
  groups: { id: string; name: string }[];
  students: { id: string; name_ar: string; parent_phone: string | null }[];
}) {
  const [state, formAction, pending] = useActionState(sendNotificationAction, INITIAL);
  const [target, setTarget] = useState<'all' | 'group' | 'student'>('all');
  const [channel, setChannel] = useState<'in_app' | 'whatsapp'>('in_app');

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">العنوان</label>
        <input name="title" required className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">الرسالة</label>
        <textarea name="body" required rows={4} className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">القناة</label>
          <select name="channel" value={channel} onChange={e => setChannel(e.target.value as any)}
            className="w-full px-3 py-2.5 rounded-card border border-neutral-300">
            <option value="in_app">داخل المنصة</option>
            <option value="whatsapp">واتساب (روابط)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">الجمهور</label>
          <select name="target_type" value={target} onChange={e => setTarget(e.target.value as any)}
            className="w-full px-3 py-2.5 rounded-card border border-neutral-300">
            <option value="all">الجميع</option>
            <option value="group">مجموعة</option>
            <option value="student">طالب واحد</option>
          </select>
        </div>
      </div>

      {target === 'group' && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">اختر المجموعة</label>
          <select name="target_id" required className="w-full px-3 py-2.5 rounded-card border border-neutral-300">
            <option value="">—</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      )}
      {target === 'student' && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">اختر الطالب</label>
          <select name="target_id" required className="w-full px-3 py-2.5 rounded-card border border-neutral-300">
            <option value="">—</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name_ar}</option>)}
          </select>
        </div>
      )}

      {channel === 'whatsapp' && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-card px-3 py-2">
          ستفتح رسائل واتساب في تبويبات جديدة بعد الإرسال (روابط wa.me — مجاني). يخضع للسقف الشهري لخطتك.
        </p>
      )}

      {state.error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-card px-3 py-2">{state.error}</p>}

      <button type="submit" disabled={pending} className="w-full px-4 py-2.5 rounded-card bg-primary-700 text-white font-medium disabled:opacity-60">
        {pending ? '...' : 'إرسال'}
      </button>
    </form>
  );
}
