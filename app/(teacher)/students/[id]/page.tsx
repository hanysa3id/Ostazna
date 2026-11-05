import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getStudent } from '@/lib/dal/students';
import { listPayments } from '@/lib/dal/payments';
import { formatCurrencyEGP } from '@/lib/utils/numerals';
import { formatDate } from '@/lib/utils/dates';
import { archiveStudentAction } from './actions';

export const dynamic = 'force-dynamic';

async function safe<T>(p: Promise<T>, fallback: T, label: string): Promise<T> {
  try { return await p; }
  catch (err) { console.error(`[student-detail] ${label} failed:`, err); return fallback; }
}

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let student;
  try { student = await getStudent(id); }
  catch (err) { console.error('[student-detail] getStudent failed:', err); notFound(); }
  if (!student) notFound();

  const supabase = await createClient();

  // Each query is independently safe — one failure shouldn't crash the page.
  const [payments, groupRowsRes, attendanceRowsRes] = await Promise.all([
    safe(listPayments({ studentId: id, limit: 20 }), [] as any[], 'listPayments'),
    safe(
      supabase
        .from('student_groups')
        .select('group:groups(id, name)')
        .eq('student_id', id)
        .is('left_at', null),
      { data: [] as any[] },
      'student_groups',
    ),
    safe(
      supabase
        .from('attendance')
        .select('status, recorded_at')
        .eq('student_id', id)
        .order('recorded_at', { ascending: false })
        .limit(30),
      { data: [] as any[] },
      'attendance',
    ),
  ]);

  const groupRows = (groupRowsRes.data ?? []).filter((r: any) => r?.group);
  const attendanceRows = attendanceRowsRes.data ?? [];

  const present = attendanceRows.filter((a: any) => a.status === 'present').length;
  const total = attendanceRows.length;
  const rate = total ? Math.round((present / total) * 100) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">{student.name_ar}</h1>
          {student.name_en && <p className="text-sm text-neutral-500">{student.name_en}</p>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/students/${student.id}/edit`} className="text-xs px-3 py-1.5 rounded-card border border-neutral-300 hover:bg-neutral-50">تعديل</Link>
          <Link href={`/students/${student.id}/link-account`} className="text-xs px-3 py-1.5 rounded-card border border-neutral-300 hover:bg-neutral-50">
            {student.user_id ? '✓ مربوط بحساب' : 'ربط حساب'}
          </Link>
          <form action={archiveStudentAction}>
            <input type="hidden" name="id" value={student.id} />
            <button className="text-xs px-3 py-1.5 rounded-card border border-red-200 text-red-700 hover:bg-red-50">
              {student.archived_at ? 'إعادة' : 'أرشفة'}
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="p-5 bg-white rounded-card border border-neutral-200">
          <h2 className="font-semibold mb-3">البيانات الأساسية</h2>
          <dl className="text-sm space-y-2">
            <Row label="الهاتف" value={student.phone} />
            <Row label="ولي الأمر" value={student.parent_name} />
            <Row label="هاتف ولي الأمر" value={student.parent_phone} />
            <Row label="تاريخ الميلاد" value={formatDate(student.date_of_birth)} />
            <Row label="معدل الحضور" value={rate !== null ? `${rate}% (آخر ${total} حصة)` : null} />
          </dl>
          {student.notes && (
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <div className="text-xs text-neutral-500 mb-1">ملاحظات</div>
              <p className="text-sm text-neutral-700 whitespace-pre-line">{student.notes}</p>
            </div>
          )}
        </section>

        <section className="p-5 bg-white rounded-card border border-neutral-200">
          <h2 className="font-semibold mb-3">المجموعات</h2>
          {groupRows.length === 0 ? (
            <p className="text-sm text-neutral-500">لم يُسجَّل في مجموعات بعد.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {groupRows.map((row: any, i: number) => (
                <li key={row.group?.id ?? i}>
                  {row.group?.id ? (
                    <Link href={`/groups/${row.group.id}`} className="text-primary-700 hover:underline">
                      {row.group.name ?? '—'}
                    </Link>
                  ) : (
                    <span className="text-neutral-500">{row.group?.name ?? 'مجموعة غير متاحة'}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="p-5 bg-white rounded-card border border-neutral-200 md:col-span-2">
          <h2 className="font-semibold mb-3">آخر المدفوعات</h2>
          {payments.length === 0 ? (
            <p className="text-sm text-neutral-500">لا توجد مدفوعات.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-neutral-500 text-xs">
                <tr>
                  <th className="text-start pb-2">التاريخ</th>
                  <th className="text-start pb-2">الفترة</th>
                  <th className="text-start pb-2">الطريقة</th>
                  <th className="text-end pb-2">المبلغ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {payments.map((p: any) => (
                  <tr key={p.id}>
                    <td className="py-2">{formatDate(p.payment_date)}</td>
                    <td className="py-2 text-neutral-500 text-xs">{p.period_from && p.period_to ? `${p.period_from} → ${p.period_to}` : '—'}</td>
                    <td className="py-2 text-neutral-600">{p.method}</td>
                    <td className="py-2 text-end font-medium">{formatCurrencyEGP(Number(p.amount ?? 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-neutral-800">{value || '—'}</dd>
    </div>
  );
}
