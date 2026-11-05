'use client';

import { useActionState, useState } from 'react';
import { saveGroupAction, type GroupActionState } from './actions';

const INITIAL: GroupActionState = {};

const WEEKDAYS = [
  { v: 6, label: 'السبت' },
  { v: 0, label: 'الأحد' },
  { v: 1, label: 'الإثنين' },
  { v: 2, label: 'الثلاثاء' },
  { v: 3, label: 'الأربعاء' },
  { v: 4, label: 'الخميس' },
  { v: 5, label: 'الجمعة' },
];

type Slot = { weekday: number; time: string; duration_minutes: number };

export function GroupForm({
  academicYear,
  grades,
  subjects,
  initial,
}: {
  academicYear: { id: string; name: string } | null;
  grades: { id: string; name: string }[];
  subjects: { id: string; name_ar: string }[];
  initial?: {
    id: string;
    name: string;
    grade_id: string | null;
    subject_id: string | null;
    pricing: 'monthly' | 'per_session';
    price_monthly: number | null;
    price_per_session: number | null;
    schedule: { slots?: Slot[] } | null;
  };
}) {
  const [state, formAction, pending] = useActionState(saveGroupAction, INITIAL);
  const [pricing, setPricing] = useState<'monthly' | 'per_session'>(initial?.pricing ?? 'monthly');
  const [slots, setSlots] = useState<Slot[]>(initial?.schedule?.slots ?? []);

  function addSlot() {
    setSlots(s => [...s, { weekday: 2, time: '16:00', duration_minutes: 90 }]);
  }
  function removeSlot(idx: number) {
    setSlots(s => s.filter((_, i) => i !== idx));
  }
  function updateSlot(idx: number, patch: Partial<Slot>) {
    setSlots(s => s.map((slot, i) => (i === idx ? { ...slot, ...patch } : slot)));
  }

  if (!academicYear) {
    return <p className="text-sm text-amber-700">أنشئ سنة دراسية حالية أولاً من الإعدادات.</p>;
  }

  return (
    <form action={formAction} className="space-y-4">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="academic_year_id" value={academicYear.id} />
      <input type="hidden" name="schedule" value={JSON.stringify({ slots })} />

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">اسم المجموعة</label>
        <input
          name="name" defaultValue={initial?.name} required minLength={2}
          className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">المادة</label>
          <select name="subject_id" defaultValue={initial?.subject_id ?? ''} className="w-full px-3 py-2.5 rounded-card border border-neutral-300">
            <option value="">—</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name_ar}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">المرحلة</label>
          <select name="grade_id" defaultValue={initial?.grade_id ?? ''} className="w-full px-3 py-2.5 rounded-card border border-neutral-300">
            <option value="">—</option>
            {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">نوع التسعير</label>
          <select
            name="pricing" value={pricing} onChange={e => setPricing(e.target.value as any)}
            className="w-full px-3 py-2.5 rounded-card border border-neutral-300"
          >
            <option value="monthly">شهري</option>
            <option value="per_session">بالحصة</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">السعر (جنيه)</label>
          <input
            name={pricing === 'monthly' ? 'price_monthly' : 'price_per_session'}
            type="number" step="0.01" min="0"
            defaultValue={(pricing === 'monthly' ? initial?.price_monthly : initial?.price_per_session) ?? ''}
            required
            className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-neutral-700">الجدول الأسبوعي</label>
          <button type="button" onClick={addSlot} className="text-xs text-primary-700">+ إضافة موعد</button>
        </div>
        {slots.length === 0 ? (
          <p className="text-xs text-neutral-500">لم تُضف مواعيد بعد.</p>
        ) : (
          <div className="space-y-2">
            {slots.map((slot, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-neutral-50 rounded-card">
                <select
                  value={slot.weekday} onChange={e => updateSlot(i, { weekday: Number(e.target.value) })}
                  className="px-2 py-1.5 rounded border border-neutral-300 text-sm"
                >
                  {WEEKDAYS.map(d => <option key={d.v} value={d.v}>{d.label}</option>)}
                </select>
                <input
                  type="time" value={slot.time}
                  onChange={e => updateSlot(i, { time: e.target.value })}
                  className="px-2 py-1.5 rounded border border-neutral-300 text-sm"
                />
                <input
                  type="number" min={15} max={240} step={15} value={slot.duration_minutes}
                  onChange={e => updateSlot(i, { duration_minutes: Number(e.target.value) })}
                  className="w-20 px-2 py-1.5 rounded border border-neutral-300 text-sm"
                />
                <span className="text-xs text-neutral-500">دقيقة</span>
                <button type="button" onClick={() => removeSlot(i)} className="ms-auto text-xs text-red-600">حذف</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-card px-3 py-2">{state.error}</p>
      )}

      <button type="submit" disabled={pending} className="w-full px-4 py-2.5 rounded-card bg-primary-700 text-white font-medium disabled:opacity-60">
        {pending ? '...' : 'حفظ المجموعة'}
      </button>
    </form>
  );
}
