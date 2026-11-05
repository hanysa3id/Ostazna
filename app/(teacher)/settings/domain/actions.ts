'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentTeacher } from '@/lib/dal/teachers';

const VALID = /^(?!:\/\/)([a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}$/;

export async function saveCustomDomainAction(formData: FormData) {
  const teacher = await getCurrentTeacher();
  if (!teacher) return;

  const raw = String(formData.get('custom_domain') ?? '').trim().toLowerCase().replace(/\/$/, '').replace(/^https?:\/\//, '');
  const value = raw === '' ? null : raw;
  if (value && !VALID.test(value)) return;

  const supabase = await createClient();
  await supabase.from('teachers').update({ custom_domain: value }).eq('id', teacher.id);

  revalidatePath('/settings/domain');
  revalidatePath('/settings');
}
