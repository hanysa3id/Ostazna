import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'الدرجات' };
export const dynamic = 'force-dynamic';

export default async function StudentGradesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: student } = await supabase
    .from('students').select('id').eq('user_id', user.id).maybeSingle();
  if (!student) return null;

  const [{ data: online }, { data: offline }, { data: attendance }] = await Promise.all([
    supabase
      .from('exam_submissions')
      .select('id, score, submitted_at, exam:exams(title, total_marks)')
      .eq('student_id', student.id)
      .order('submitted_at', { ascending: false }),
    supabase
      .from('offline_grades')
      .select('id, exam_title, score, total_marks, exam_date, notes')
      .eq('student_id', student.id)
      .order('exam_date', { ascending: false }),
    supabase
      .from('attendance')
      .select('status, recorded_at, session:sessions(scheduled_at, group:groups(name))')
      .eq('student_id', student.id)
      .order('recorded_at', { ascending: false })
      .limit(30),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary-900">درجاتك وحضورك</h1>

      <section className="bg-white rounded-card border border-neutral-200 p-5">
        <h2 className="font-semibold mb-3">الاختبارات الإلكترونية</h2>
        {(online ?? []).length === 0 ? (
          <p className="text-sm text-neutral-500">لا توجد اختبارات منجزة بعد.</p>
        ) : (
          <ul className="text-sm divide-y divide-neutral-100">
            {(online ?? []).map((r: any) => (
              <li key={r.id} className="py-2 flex items-center justify-between">
                <span>{r.exam?.title}</span>
                <span className="font-medium">{r.score ?? '—'} / {r.exam?.total_marks}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white rounded-card border border-neutral-200 p-5">
        <h2 className="font-semibold mb-3">الاختبارات الورقية</h2>
        {(offline ?? []).length === 0 ? (
          <p className="text-sm text-neutral-500">لا يوجد سجل بعد.</p>
        ) : (
          <ul className="text-sm divide-y divide-neutral-100">
            {(offline ?? []).map((r: any) => (
              <li key={r.id} className="py-2 flex items-center justify-between">
                <div>
                  <div>{r.exam_title}</div>
                  <div className="text-xs text-neutral-500">{r.exam_date}</div>
                </div>
                <span className="font-medium">{r.score} / {r.total_marks}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white rounded-card border border-neutral-200 p-5">
        <h2 className="font-semibold mb-3">سجل الحضور</h2>
        {(attendance ?? []).length === 0 ? (
          <p className="text-sm text-neutral-500">لا توجد سجلات.</p>
        ) : (
          <ul className="text-sm divide-y divide-neutral-100">
            {(attendance ?? []).map((a: any, i: number) => (
              <li key={i} className="py-2 flex items-center justify-between">
                <span>{(a.session as any)?.group?.name ?? 'حصة'} — {(a.session as any)?.scheduled_at ? new Date(a.session.scheduled_at).toLocaleDateString('ar-EG') : ''}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  a.status === 'present' ? 'bg-accent-500/10 text-accent-700' :
                  a.status === 'late'    ? 'bg-amber-100 text-amber-700' :
                  a.status === 'excused' ? 'bg-neutral-100 text-neutral-700' :
                                            'bg-red-50 text-red-700'
                }`}>
                  {a.status === 'present' ? 'حاضر' : a.status === 'absent' ? 'غائب' : a.status === 'late' ? 'متأخر' : 'معذور'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
