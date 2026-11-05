'use server';

import { revalidatePath } from 'next/cache';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentTeacher } from '@/lib/dal/teachers';

export async function addAssistantAction(formData: FormData) {
  const teacher = await getCurrentTeacher();
  if (!teacher) return;
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  if (!name || !email) return;

  // Look up the auth user by email (service role required).
  const admin = createServiceRoleClient();
  const { data: list } = await admin.auth.admin.listUsers();
  const user = list?.users.find(u => u.email?.toLowerCase() === email);
  if (!user) {
    // Silently no-op if not found — UI could surface this in a future iteration.
    return;
  }

  const supabase = await createClient();
  await supabase.from('assistants').insert({
    teacher_id: teacher.id,
    user_id: user.id,
    name,
    email,
    permissions: {},
  });
  revalidatePath('/settings/assistants');
}

export async function removeAssistantAction(formData: FormData) {
  const id = String(formData.get('id'));
  const supabase = await createClient();
  await supabase.from('assistants').delete().eq('id', id);
  revalidatePath('/settings/assistants');
}

export async function togglePermissionAction(formData: FormData) {
  const id = String(formData.get('id'));
  const key = String(formData.get('key'));
  const value = formData.get('value') === 'on';

  const supabase = await createClient();
  const { data: row } = await supabase.from('assistants').select('permissions').eq('id', id).maybeSingle();
  const next = { ...(row?.permissions ?? {}), [key]: value };
  await supabase.from('assistants').update({ permissions: next }).eq('id', id);
  revalidatePath('/settings/assistants');
}
