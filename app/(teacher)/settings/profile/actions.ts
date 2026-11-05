'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentTeacher } from '@/lib/dal/teachers';

export type ProfileState = { error?: string; ok?: boolean };

export async function saveProfileAction(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { error: 'يلزم تسجيل الدخول.' };

  const name_ar = String(formData.get('name_ar') ?? '').trim();
  const name_en = (String(formData.get('name_en') ?? '').trim()) || null;
  const phone = (String(formData.get('phone') ?? '').trim()) || null;
  const avatar_url = (String(formData.get('avatar_url') ?? '').trim()) || null;
  if (name_ar.length < 2) return { error: 'الاسم مطلوب.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('teachers')
    .update({ name_ar, name_en, phone, avatar_url })
    .eq('id', teacher.id);
  if (error) return { error: error.message };

  revalidatePath('/settings/profile');
  revalidatePath('/dashboard');
  return { ok: true };
}
