'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Archive, ArchiveRestore } from 'lucide-react';
import { bulkArchiveStudentsAction, bulkUnarchiveStudentsAction } from './actions';

type Student = {
  id: string;
  name_ar: string;
  phone: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  archived_at: string | null;
};

export function StudentsTable({ students, archived }: { students: Student[]; archived: boolean }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();

  function toggle(id: string) {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  function toggleAll() {
    if (selected.size === students.length) setSelected(new Set());
    else setSelected(new Set(students.map(s => s.id)));
  }

  function bulk(kind: 'archive' | 'unarchive') {
    if (selected.size === 0) return;
    const verb = kind === 'archive' ? 'أرشفة' : 'استعادة';
    if (!confirm(`${verb} ${selected.size} طالب؟`)) return;
    start(async () => {
      const ids = Array.from(selected);
      await (kind === 'archive' ? bulkArchiveStudentsAction(ids) : bulkUnarchiveStudentsAction(ids));
      setSelected(new Set());
      router.refresh();
    });
  }

  if (students.length === 0) {
    return (
      <div className="p-10 text-center bg-white rounded-card border border-dashed border-neutral-300">
        <p className="text-neutral-600">لا توجد نتائج.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {selected.size > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-card p-3 flex items-center justify-between text-sm">
          <span>تحديد {selected.size} طالب</span>
          <div className="flex items-center gap-2">
            {archived ? (
              <button onClick={() => bulk('unarchive')} disabled={pending}
                className="text-xs px-3 py-1.5 rounded-card bg-accent-500 text-white inline-flex items-center gap-1.5">
                <ArchiveRestore className="w-3.5 h-3.5" /> استعادة المحدد
              </button>
            ) : (
              <button onClick={() => bulk('archive')} disabled={pending}
                className="text-xs px-3 py-1.5 rounded-card bg-amber-600 text-white inline-flex items-center gap-1.5">
                <Archive className="w-3.5 h-3.5" /> أرشفة المحدد
              </button>
            )}
            <button onClick={() => setSelected(new Set())} className="text-xs text-neutral-600">إلغاء</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-card border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-3 w-10">
                <input type="checkbox"
                  checked={selected.size === students.length}
                  onChange={toggleAll} />
              </th>
              <th className="text-start px-4 py-3 font-medium">الاسم</th>
              <th className="text-start px-4 py-3 font-medium">الهاتف</th>
              <th className="text-start px-4 py-3 font-medium">ولي الأمر</th>
              <th className="text-start px-4 py-3 font-medium">هاتف ولي الأمر</th>
              <th className="text-start px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {students.map(s => (
              <tr key={s.id} className={selected.has(s.id) ? 'bg-primary-50/50' : ''}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} />
                </td>
                <td className="px-4 py-3 font-medium">
                  <Link href={`/students/${s.id}`} className="text-primary-700 hover:underline">{s.name_ar}</Link>
                </td>
                <td className="px-4 py-3 text-neutral-600">{s.phone ?? '—'}</td>
                <td className="px-4 py-3 text-neutral-600">{s.parent_name ?? '—'}</td>
                <td className="px-4 py-3 text-neutral-600 font-mono text-xs">{s.parent_phone ?? '—'}</td>
                <td className="px-4 py-3 text-end">
                  <Link href={`/students/${s.id}`} className="text-primary-700 text-xs">عرض</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
