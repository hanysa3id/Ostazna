import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AttendanceSheet } from './sheet';

export const dynamic = 'force-dynamic';

export default async function AttendanceSessionPage({
  params,
}: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from('sessions')
    .select('id, scheduled_at, group_id, group:groups(name)')
    .eq('id', sessionId)
    .maybeSingle();
  if (!session) notFound();

  // Active members of the group at this time.
  const members = session.group_id
    ? await supabase
        .from('student_groups')
        .select('student:students(id, name_ar)')
        .eq('group_id', session.group_id)
        .is('left_at', null)
    : { data: [] };

  const { data: existing } = await supabase
    .from('attendance')
    .select('student_id, status, notes')
    .eq('session_id', sessionId);

  const initial = new Map((existing ?? []).map((r: any) => [r.student_id, r]));

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-primary-900">
          {(session as any).group?.name ?? 'حصة فردية'}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          {new Date(session.scheduled_at).toLocaleString('ar-EG', { dateStyle: 'full', timeStyle: 'short' })}
        </p>
      </div>

      <AttendanceSheet
        sessionId={session.id}
        students={(members.data ?? []).map((r: any) => r.student)}
        initial={Object.fromEntries(initial.entries())}
      />
    </div>
  );
}
