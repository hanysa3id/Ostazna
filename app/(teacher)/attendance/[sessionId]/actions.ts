'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentTeacher } from '@/lib/dal/teachers';

type Row = { student_id: string; status: 'present'|'absent'|'late'|'excused'; notes: string | null };

export async function saveAttendanceAction(input: { sessionId: string; rows: Row[] }) {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { error: 'يلزم تسجيل الدخول.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'يلزم تسجيل الدخول.' };

  const payload = input.rows.map(r => ({
    teacher_id: teacher.id,
    session_id: input.sessionId,
    student_id: r.student_id,
    status: r.status,
    notes: r.notes,
    recorded_by: user.id,
    recorded_at: new Date().toISOString(),
  }));

  // Upsert by (session_id, student_id) — idempotent re-saves.
  const { error } = await supabase.from('attendance').upsert(payload, { onConflict: 'session_id,student_id' });
  if (error) {
    console.error('[attendance/save]', error);
    return { error: `تعذر الحفظ: ${error.message}` };
  }

  // Mark session completed once attendance is recorded.
  await supabase.from('sessions').update({ status: 'completed' }).eq('id', input.sessionId);

  revalidatePath(`/attendance/${input.sessionId}`);
  revalidatePath('/attendance');
  revalidatePath('/dashboard');
  return { ok: true };
}
