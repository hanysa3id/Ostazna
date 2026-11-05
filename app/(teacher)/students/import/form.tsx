'use client';

import { useState, useTransition } from 'react';
import { importStudentsAction, type ImportRow, type ImportResult } from './actions';

export function ImportForm() {
  const [pending, start] = useTransition();
  const [preview, setPreview] = useState<ImportRow[] | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function parseCSV(text: string): ImportRow[] {
    // Strip BOM
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) throw new Error('الملف فارغ أو بدون بيانات.');

    const headers = splitCsvLine(lines[0]).map(h => h.trim());
    if (!headers.includes('name_ar')) throw new Error('العمود name_ar مطلوب.');

    const rows: ImportRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = splitCsvLine(lines[i]);
      const row: any = {};
      headers.forEach((h, j) => { row[h] = cells[j]?.trim() ?? ''; });
      if (row.name_ar) rows.push(row);
    }
    return rows;
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null); setResult(null); setPreview(null);
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length > 500) throw new Error('الحد الأقصى 500 صف لكل عملية.');
      setPreview(rows);
    } catch (err: any) { setError(err?.message ?? 'تعذر قراءة الملف.'); }
  }

  function commit() {
    if (!preview) return;
    setError(null);
    start(async () => {
      const res = await importStudentsAction(preview);
      setResult(res);
    });
  }

  return (
    <div className="space-y-4">
      <input type="file" accept=".csv,text/csv" onChange={onFile}
        className="block w-full text-sm file:me-4 file:px-4 file:py-2 file:rounded-card file:border-0 file:bg-primary-700 file:text-white file:cursor-pointer" />

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-card px-3 py-2">{error}</p>}

      {preview && (
        <>
          <div className="text-sm text-neutral-700">
            تم التعرف على <strong>{preview.length}</strong> صف. عاينها قبل الاستيراد:
          </div>
          <div className="bg-neutral-50 rounded-card border border-neutral-200 overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-neutral-100 text-neutral-600 sticky top-0">
                <tr>
                  <th className="text-start px-2 py-1.5">name_ar</th>
                  <th className="text-start px-2 py-1.5">phone</th>
                  <th className="text-start px-2 py-1.5">parent_name</th>
                  <th className="text-start px-2 py-1.5">parent_phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {preview.slice(0, 50).map((r, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1.5">{r.name_ar}</td>
                    <td className="px-2 py-1.5">{r.phone}</td>
                    <td className="px-2 py-1.5">{r.parent_name}</td>
                    <td className="px-2 py-1.5">{r.parent_phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 50 && <div className="text-center text-xs text-neutral-500 p-2">... +{preview.length - 50} صف</div>}
          </div>
          <button onClick={commit} disabled={pending}
            className="w-full px-4 py-2.5 rounded-card bg-accent-500 text-white font-medium disabled:opacity-60">
            {pending ? 'جارٍ الاستيراد...' : `استيراد ${preview.length} طالب`}
          </button>
        </>
      )}

      {result && (
        <div className={`rounded-card border px-4 py-3 text-sm ${result.errors.length === 0 ? 'bg-accent-500/10 border-accent-500/30 text-accent-700' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
          تم استيراد <strong>{result.inserted}</strong> طالب.
          {result.errors.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer">{result.errors.length} خطأ</summary>
              <ul className="mt-2 list-disc ms-5 space-y-1 text-xs">
                {result.errors.slice(0, 20).map((e, i) => <li key={i}>صف {e.row}: {e.message}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = []; let cur = ''; let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else {
      if (c === '"') q = true;
      else if (c === ',') { cells.push(cur); cur = ''; }
      else cur += c;
    }
  }
  cells.push(cur);
  return cells;
}
