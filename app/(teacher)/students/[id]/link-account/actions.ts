'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { getCurrentTeacher } from '@/lib/dal/teachers';

export type LinkState = { error?: string; ok?: boolean };

export async function linkStudentAccountAction(_prev: LinkState, formData: FormData): Promise<LinkState> {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { error: 'يلزم تسجيل الدخول.' };

  const studentId = String(formData.get('id'));
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  if (!email) return { error: 'البريد مطلوب.' };

  const admin = createServiceRoleClient();
  const { data: list } = await admin.auth.admin.listUsers();
  const user = list?.users.find(u => u.email?.toLowerCase() === email);
  if (!user) return { error: 'لا يوجد حساب بهذا البريد. اطلب من الطالب التسجيل أولاً.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('students')
    .update({ user_id: user.id })
    .eq('id', studentId);
  if (error) return { error: error.message };

  revalidatePath(`/students/${studentId}`);
  return { ok: true };
}

export async function unlinkStudentAccountAction(formData: FormData) {
  const id = String(formData.get('id'));
  const supabase = await createClient();
  await supabase.from('students').update({ user_id: null }).eq('id', id);
  revalidatePath(`/students/${id}`);
  redirect(`/students/${id}/link-account`);
}
