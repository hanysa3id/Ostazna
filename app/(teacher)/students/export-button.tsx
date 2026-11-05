'use client';

import { Download } from 'lucide-react';

export function ExportStudentsButton({ students }: { students: any[] }) {
  function exportCSV() {
    const headers = ['الاسم', 'الاسم بالإنجليزية', 'الهاتف', 'ولي الأمر', 'هاتف ولي الأمر', 'تاريخ الميلاد'];
    const rows = students.map(s => [
      s.name_ar, s.name_en ?? '', s.phone ?? '', s.parent_name ?? '', s.parent_phone ?? '', s.date_of_birth ?? '',
    ]);
    const escape = (v: string) => /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    const csv = '﻿' + [headers, ...rows].map(r => r.map(escape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={exportCSV}
      disabled={students.length === 0}
      className="text-sm px-3 py-2 rounded-card border border-neutral-300 hover:bg-neutral-50 inline-flex items-center gap-1.5 disabled:opacity-50"
    >
      <Download className="w-4 h-4" /> تصدير CSV
    </button>
  );
}
