'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, User, Boxes, FileText, Receipt } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Result =
  | { kind: 'student'; id: string; label: string; sub?: string; href: string }
  | { kind: 'group';   id: string; label: string; sub?: string; href: string }
  | { kind: 'invoice'; id: string; label: string; sub?: string; href: string }
  | { kind: 'expense'; id: string; label: string; sub?: string; href: string };

const ICONS = { student: User, group: Boxes, invoice: FileText, expense: Receipt };
const LABELS = { student: 'طالب', group: 'مجموعة', invoice: 'فاتورة', expense: 'مصروف' };

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [pending, start] = useTransition();
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setOpen(true);
      } else if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open || q.trim().length < 2) { setResults([]); return; }
    const handle = setTimeout(() => {
      start(async () => {
        const supabase = createClient();
        const term = `%${q.trim()}%`;
        const [students, groups, invoices, expenses] = await Promise.all([
          supabase.from('students').select('id, name_ar').ilike('name_ar', term).limit(5),
          supabase.from('groups').select('id, name').ilike('name', term).limit(5),
          supabase.from('invoices').select('id, invoice_number, amount').ilike('invoice_number', term).limit(5),
          supabase.from('expenses').select('id, description, amount').ilike('description', term).limit(5),
        ]);
        const out: Result[] = [
          ...(students.data ?? []).map(s => ({ kind: 'student' as const, id: s.id, label: s.name_ar, href: `/students/${s.id}` })),
          ...(groups.data ?? []).map(g => ({ kind: 'group' as const, id: g.id, label: g.name, href: `/groups/${g.id}` })),
          ...(invoices.data ?? []).map((i: any) => ({ kind: 'invoice' as const, id: i.id, label: i.invoice_number, sub: `${i.amount} جنيه`, href: '/finance/invoices' })),
          ...(expenses.data ?? []).map((e: any) => ({ kind: 'expense' as const, id: e.id, label: e.description ?? '—', sub: `${e.amount} جنيه`, href: '/finance/expenses' })),
        ];
        setResults(out);
      });
    }, 200);
    return () => clearTimeout(handle);
  }, [q, open]);

  function go(href: string) {
    setOpen(false); setQ('');
    router.push(href);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-card border border-neutral-200 bg-neutral-50 text-neutral-500 text-sm hover:bg-neutral-100"
      >
        <Search className="w-3.5 h-3.5" />
        <span>بحث...</span>
        <kbd className="ms-2 text-[10px] bg-white border border-neutral-200 rounded px-1 py-0.5 font-mono">Ctrl K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" onClick={() => setOpen(false)}>
          <div className="fixed inset-0 bg-black/40" />
          <div onClick={e => e.stopPropagation()} className="relative w-full max-w-xl bg-white rounded-card shadow-xl border border-neutral-200">
            <div className="flex items-center gap-2 p-3 border-b border-neutral-100">
              <Search className="w-4 h-4 text-neutral-400" />
              <input
                autoFocus value={q} onChange={e => setQ(e.target.value)}
                placeholder="ابحث في الطلاب، المجموعات، الفواتير..."
                className="flex-1 outline-none text-sm placeholder-neutral-400"
              />
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-neutral-100">
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {q.trim().length < 2 ? (
                <p className="p-6 text-sm text-neutral-500 text-center">اكتب حرفين على الأقل للبحث.</p>
              ) : pending ? (
                <p className="p-6 text-sm text-neutral-500 text-center">جارٍ البحث...</p>
              ) : results.length === 0 ? (
                <p className="p-6 text-sm text-neutral-500 text-center">لا توجد نتائج.</p>
              ) : (
                <ul className="divide-y divide-neutral-100">
                  {results.map(r => {
                    const Icon = ICONS[r.kind];
                    return (
                      <li key={`${r.kind}-${r.id}`}>
                        <button onClick={() => go(r.href)} className="w-full text-start px-4 py-2.5 hover:bg-neutral-50 flex items-center gap-3">
                          <Icon className="w-4 h-4 text-neutral-400" />
                          <div className="flex-1">
                            <div className="text-sm text-neutral-900">{r.label}</div>
                            {r.sub && <div className="text-xs text-neutral-500">{r.sub}</div>}
                          </div>
                          <span className="text-xs text-neutral-400">{LABELS[r.kind]}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
