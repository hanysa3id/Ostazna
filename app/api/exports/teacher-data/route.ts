import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const TABLES = ['students', 'groups', 'student_groups', 'sessions', 'attendance', 'payments', 'subjects', 'grades', 'academic_years'] as const;

function toCSV(rows: any[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return '';
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\n');
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // RLS automatically scopes to this teacher's rows.
  const dump: Record<string, string> = {};
  for (const table of TABLES) {
    const { data, error } = await supabase.from(table).select('*');
    dump[`${table}.csv`] = error ? `# error: ${error.message}` : toCSV(data ?? []);
  }

  // Plain-text manifest. (A proper ZIP would require an extra dependency — kept simple for MVP.)
  const body = Object.entries(dump)
    .map(([file, content]) => `\n===== ${file} =====\n${content}\n`)
    .join('\n');

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="ostazna-export-${new Date().toISOString().slice(0, 10)}.txt"`,
    },
  });
}
