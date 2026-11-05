import { createClient } from '@/lib/supabase/server';
import { formatCurrencyEGP } from '@/lib/utils/numerals';
import { formatDate } from '@/lib/utils/dates';

export const metadata = { title: 'بوابة ولي الأمر' };
export const dynamic = 'force-dynamic';

export default async function ParentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: parent } = await supabase
    .from('parents')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!parent) return null;

  const { data: links } = await supabase
    .from('parent_students')
    .select('student:students(id, name_ar)')
    .eq('parent_id', parent.id);

  const studentIds = (links ?? []).map((l: any) => l.student.id);
  if (studentIds.length === 0) {
    return <p className="text-sm text-neutral-500">لا يوجد طلاب مرتبطون بحسابك.</p>;
  }

  const [{ data: payments }, { data: attendance }] = await Promise.all([
    supabase.from('payments').select('amount, payment_date, period_to, student:students(name_ar)').in('student_id', studentIds).order('payment_date', { ascending: false }).limit(20),
    supabase.from('attendance').select('status, recorded_at, student:students(name_ar)').in('student_id', studentIds).order('recorded_at', { ascending: false }).limit(20),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary-900">أهلاً بك</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="bg-white rounded-card border border-neutral-200 p-5">
          <h2 className="font-semibold mb-3">آخر المدفوعات</h2>
          {(payments ?? []).length === 0 ? (
            <p className="text-sm text-neutral-500">لا توجد مدفوعات.</p>
          ) : (
            <ul className="text-sm divide-y divide-neutral-100">
              {(payments ?? []).map((p: any, i: number) => (
                <li key={i} className="py-2 flex items-center justify-between">
                  <span>{p.student?.name_ar} — {formatDate(p.payment_date)}</span>
                  <span className="font-medium text-accent-600">{formatCurrencyEGP(Number(p.amount))}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-card border border-neutral-200 p-5">
          <h2 className="font-semibold mb-3">آخر سجلات الحضور</h2>
          {(attendance ?? []).length === 0 ? (
            <p className="text-sm text-neutral-500">لا توجد سجلات.</p>
          ) : (
            <ul className="text-sm divide-y divide-neutral-100">
              {(attendance ?? []).map((a: any, i: number) => (
                <li key={i} className="py-2 flex items-center justify-between">
                  <span>{a.student?.name_ar} — {formatDate(a.recorded_at)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${a.status === 'present' ? 'bg-accent-500/10 text-accent-700' : 'bg-red-50 text-red-700'}`}>
                    {a.status === 'present' ? 'حاضر' : a.status === 'absent' ? 'غائب' : a.status === 'late' ? 'متأخر' : 'معذور'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
