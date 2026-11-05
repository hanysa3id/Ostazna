import { createClient } from '@/lib/supabase/server';
import { formatDateTime } from '@/lib/utils/dates';

export const metadata = { title: 'جدول الحصص' };
export const dynamic = 'force-dynamic';

export default async function StudentSchedulePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: student } = await supabase
    .from('students').select('id').eq('user_id', user.id).maybeSingle();
  if (!student) return null;

  const { data: groupRows } = await supabase
    .from('student_groups')
    .select('group_id')
    .eq('student_id', student.id)
    .is('left_at', null);
  const groupIds = (groupRows ?? []).map((r: any) => r.group_id);
  if (groupIds.length === 0) {
    return <p className="text-sm text-neutral-500">لم تُسجَّل في مجموعات بعد.</p>;
  }

  const now = new Date().toISOString();
  const inMonth = new Date(Date.now() + 30 * 86400_000).toISOString();
  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, scheduled_at, duration_minutes, status, group:groups(name)')
    .in('group_id', groupIds)
    .gte('scheduled_at', now)
    .lt('scheduled_at', inMonth)
    .order('scheduled_at');

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-primary-900">جدول الحصص</h1>
      {(sessions ?? []).length === 0 ? (
        <div className="p-10 text-center bg-white rounded-card border border-dashed border-neutral-300">
          <p className="text-neutral-600">لا توجد حصص قادمة.</p>
        </div>
      ) : (
        <div className="bg-white rounded-card border border-neutral-200 divide-y divide-neutral-100">
          {(sessions ?? []).map((s: any) => (
            <div key={s.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900">{s.group?.name ?? 'حصة'}</p>
                <p className="text-xs text-neutral-500">{formatDateTime(s.scheduled_at)} · {s.duration_minutes}د</p>
              </div>
              <span className="text-xs text-neutral-400">{s.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
