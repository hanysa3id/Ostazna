'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveAttendanceAction } from './actions';

type Status = 'present' | 'absent' | 'late' | 'excused';

const COLORS: Record<Status, string> = {
  present: 'bg-accent-500/10 text-accent-600 border-accent-500/30',
  absent: 'bg-red-50 text-red-700 border-red-200',
  late: 'bg-amber-50 text-amber-700 border-amber-200',
  excused: 'bg-neutral-100 text-neutral-700 border-neutral-300',
};

const LABELS: Record<Status, string> = {
  present: 'حاضر',
  absent: 'غائب',
  late: 'متأخر',
  excused: 'معذور',
};

export function AttendanceSheet({
  sessionId,
  students,
  initial,
}: {
  sessionId: string;
  students: { id: string; name_ar: string }[];
  initial: Record<string, { status: Status; notes: string | null }>;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [rows, setRows] = useState<Record<string, { status: Status; notes: string }>>(() => {
    const out: Record<string, { status: Status; notes: string }> = {};
    for (const s of students) {
      out[s.id] = {
        status: (initial[s.id]?.status as Status) ?? 'present',
        notes: initial[s.id]?.notes ?? '',
      };
    }
    return out;
  });
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  function set(id: string, patch: Partial<{ status: Status; notes: string }>) {
    setRows(r => ({ ...r, [id]: { ...r[id], ...patch } }));
  }

  function bulk(status: Status) {
    setRows(r => Object.fromEntries(Object.entries(r).map(([id, v]) => [id, { ...v, status }])));
  }

  function save() {
    start(async () => {
      const res = await saveAttendanceAction({
        sessionId,
        rows: Object.entries(rows).map(([student_id, v]) => ({ student_id, status: v.status, notes: v.notes || null })),
      });
      if (res.error) alert(res.error);
      else {
        setSavedAt(new Date());
        router.refresh();
      }
    });
  }

  if (students.length === 0) {
    return (
      <div className="p-10 text-center bg-white rounded-card border border-dashed border-neutral-300">
        <p className="text-neutral-600">لا يوجد طلاب في هذه المجموعة.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-neutral-500">تحديد جماعي:</span>
        {(Object.keys(LABELS) as Status[]).map(s => (
          <button key={s} onClick={() => bulk(s)} className={`px-2 py-1 rounded border ${COLORS[s]}`}>
            {LABELS[s]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-card border border-neutral-200 divide-y divide-neutral-100">
        {students.map(s => {
          const row = rows[s.id];
          return (
            <div key={s.id} className="p-3 flex items-center gap-3 flex-wrap">
              <span className="font-medium text-neutral-900 flex-1 min-w-32">{s.name_ar}</span>
              <div className="flex gap-1">
                {(Object.keys(LABELS) as Status[]).map(st => (
                  <button
                    key={st}
                    onClick={() => set(s.id, { status: st })}
                    className={`text-xs px-2.5 py-1 rounded border ${row.status === st ? COLORS[st] : 'border-neutral-200 text-neutral-500'}`}
                  >
                    {LABELS[st]}
                  </button>
                ))}
              </div>
              <input
                value={row.notes}
                onChange={e => set(s.id, { notes: e.target.value })}
                placeholder="ملاحظة (اختياري)"
                className="text-xs px-2 py-1.5 rounded border border-neutral-200 w-44"
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        {savedAt && <span className="text-xs text-accent-600">حُفظ {savedAt.toLocaleTimeString('ar-EG')}</span>}
        <button
          onClick={save} disabled={pending}
          className="ms-auto px-5 py-2.5 rounded-card bg-primary-700 text-white font-medium disabled:opacity-60"
        >
          {pending ? '...' : 'حفظ الحضور'}
        </button>
      </div>
    </div>
  );
}
