'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentTeacher } from '@/lib/dal/teachers';

export type GroupActionState = { error?: string };

export async function saveGroupAction(_prev: GroupActionState, formData: FormData): Promise<GroupActionState> {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { error: 'يلزم تسجيل الدخول.' };

  const id = (formData.get('id') as string) || null;
  const pricing = formData.get('pricing') as 'monthly' | 'per_session';
  const scheduleStr = formData.get('schedule') as string;

  const payload: any = {
    teacher_id: teacher.id,
    name: String(formData.get('name')),
    academic_year_id: String(formData.get('academic_year_id')),
    grade_id: (formData.get('grade_id') as string) || null,
    subject_id: (formData.get('subject_id') as string) || null,
    pricing,
    price_monthly: pricing === 'monthly' ? Number(formData.get('price_monthly')) : null,
    price_per_session: pricing === 'per_session' ? Number(formData.get('price_per_session')) : null,
    schedule: scheduleStr ? JSON.parse(scheduleStr) : null,
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from('groups').update(payload).eq('id', id)
    : await supabase.from('groups').insert(payload);

  if (error) {
    console.error('[groups/save] failed:', error);
    return { error: `تعذر الحفظ: ${error.message}` };
  }

  // Materialize sessions for any newly-added slots.
  await supabase.rpc('expand_recurring_sessions', { p_teacher_id: teacher.id, p_horizon_days: 90 });

  revalidatePath('/groups');
  revalidatePath('/schedule');
  redirect('/groups');
}

export async function archiveGroupAction(formData: FormData) {
  const teacher = await getCurrentTeacher();
  if (!teacher) return;
  const id = String(formData.get('id'));
  const supabase = await createClient();
  await supabase.from('groups').update({ archived_at: new Date().toISOString() }).eq('id', id);
  revalidatePath('/groups');
  redirect('/groups');
}

export async function addStudentToGroupAction(formData: FormData) {
  const teacher = await getCurrentTeacher();
  if (!teacher) return;
  const groupId = String(formData.get('group_id'));
  const studentId = String(formData.get('student_id'));
  const supabase = await createClient();
  await supabase.from('student_groups').insert({
    teacher_id: teacher.id,
    student_id: studentId,
    group_id: groupId,
  });
  revalidatePath(`/groups/${groupId}`);
}

export async function removeStudentFromGroupAction(formData: FormData) {
  const teacher = await getCurrentTeacher();
  if (!teacher) return;
  const groupId = String(formData.get('group_id'));
  const studentId = String(formData.get('student_id'));
  const supabase = await createClient();
  await supabase
    .from('student_groups')
    .update({ left_at: new Date().toISOString() })
    .eq('group_id', groupId)
    .eq('student_id', studentId)
    .is('left_at', null);
  revalidatePath(`/groups/${groupId}`);
}
