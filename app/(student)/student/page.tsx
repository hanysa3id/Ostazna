import { createClient } from '@/lib/supabase/server';
import { formatCurrencyEGP } from '@/lib/utils/numerals';
import { formatDateTime } from '@/lib/utils/dates';

export const metadata = { title: 'بوابة الطالب' };
export const dynamic = 'force-dynamic';

export default async function StudentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: student } = await supabase
    .from('students')
    .select('id, name_ar, teacher_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!student) return null;

  const now = new Date().toISOString();
  const inWeek = new Date(Date.now() + 7 * 86400_000).toISOString();

  const [
    { data: groups },
    { data: nextSessions },
    { data: payments },
    { data: attendance },
  ] = await Promise.all([
    supabase
      .from('student_groups')
      .select('group:groups(id, name)')
      .eq('student_id', student.id)
      .is('left_at', null),
    supabase
      .from('sessions')
      .select('id, scheduled_at, group_id, group:groups(name)')
      .gte('scheduled_at', now)
      .lt('scheduled_at', inWeek)
      .order('scheduled_at')
      .limit(5),
    supabase
      .from('payments')
      .select('amount, payment_date')
      .eq('student_id', student.id)
      .order('payment_date', { ascending: false })
      .limit(5),
    supabase
      .from('attendance')
      .select('status, recorded_at')
      .eq('student_id', student.id)
      .order('recorded_at', { ascending: false })
      .limit(20),
  ]);

  const present = (attendance ?? []).filter((a: any) => a.status === 'present').length;
  const total = (attendance ?? []).length || 1;
  const rate = Math.round((present / total) * 100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary-900">أهلاً، {student.name_ar}</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card label="المجموعات" value={String((groups ?? []).length)} />
        <Card label="معدل الحضور" value={`${rate}%`} />
        <Card label="حصص الأسبوع القادم" value={String((nextSessions ?? []).length)} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="bg-white rounded-card border border-neutral-200 p-5">
          <h2 className="font-semibold mb-3">حصصك القادمة</h2>
          {(nextSessions ?? []).length === 0 ? (
            <p className="text-sm text-neutral-500">لا توجد حصص قادمة هذا الأسبوع.</p>
          ) : (
            <ul className="text-sm divide-y divide-neutral-100">
              {(nextSessions ?? []).map((s: any) => (
                <li key={s.id} className="py-2 flex items-center justify-between">
                  <span>{s.group?.name ?? 'حصة'}</span>
                  <span className="text-neutral-500 text-xs">{formatDateTime(s.scheduled_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-card border border-neutral-200 p-5">
          <h2 className="font-semibold mb-3">آخر مدفوعاتك</h2>
          {(payments ?? []).length === 0 ? (
            <p className="text-sm text-neutral-500">لا توجد مدفوعات.</p>
          ) : (
            <ul className="text-sm divide-y divide-neutral-100">
              {(payments ?? []).map((p: any, i: number) => (
                <li key={i} className="py-2 flex items-center justify-between">
                  <span>{p.payment_date}</span>
                  <span className="font-medium text-accent-600">{formatCurrencyEGP(Number(p.amount))}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 bg-white rounded-card border border-neutral-200">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="text-2xl font-bold text-primary-700 mt-1">{value}</div>
    </div>
  );
}
