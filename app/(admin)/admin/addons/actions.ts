'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';

async function ensureAdmin() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user || (user.app_metadata as any)?.role !== 'super_admin') throw new Error('forbidden');
}

export async function saveAddonAction(formData: FormData) {
  await ensureAdmin();
  const sb = createServiceRoleClient();
  const id = (formData.get('id') as string) || null;
  const payload: any = {
    key:            String(formData.get('key') ?? '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'),
    name_ar:        String(formData.get('name_ar') ?? '').trim(),
    name_en:        (formData.get('name_en') as string) || null,
    description_ar: (formData.get('description_ar') as string) || null,
    price_egp:      Number(formData.get('price_egp') ?? 0),
    icon:           (formData.get('icon') as string) || null,
    is_active:      formData.get('is_active') === 'on',
  };
  if (!payload.key || !payload.name_ar) throw new Error('Key + name required');

  const { error } = id
    ? await sb.from('addons').update(payload).eq('id', id)
    : await sb.from('addons').insert(payload);
  if (error) {
    console.error('[admin/addons]', error);
    throw new Error(error.message);
  }
  revalidatePath('/admin/addons');
}

export async function deleteAddonAction(formData: FormData) {
  await ensureAdmin();
  const sb = createServiceRoleClient();
  const { error } = await sb.from('addons').delete().eq('id', String(formData.get('id')));
  if (error) throw new Error(error.message);
  revalidatePath('/admin/addons');
}

export async function grantAddonAction(formData: FormData) {
  await ensureAdmin();
  const sb = createServiceRoleClient();
  const { data: { user } } = await sb.auth.getUser();

  const teacherId = String(formData.get('teacher_id'));
  const addonId = String(formData.get('addon_id'));
  const months = Math.max(0, Math.min(36, Number(formData.get('months') ?? 1)));
  const notes = (formData.get('notes') as string) || null;

  let active_until: string | null = null;
  if (months > 0) {
    const d = new Date(); d.setMonth(d.getMonth() + months);
    active_until = d.toISOString().slice(0, 10);
  }

  const { error } = await sb.from('teacher_addons').upsert({
    teacher_id: teacherId,
    addon_id: addonId,
    active_from: new Date().toISOString().slice(0, 10),
    active_until,
    granted_by: user?.id,
    notes,
  }, { onConflict: 'teacher_id,addon_id' });
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/teachers/${teacherId}`);
}

export async function revokeAddonAction(formData: FormData) {
  await ensureAdmin();
  const sb = createServiceRoleClient();
  const teacherId = String(formData.get('teacher_id'));
  const addonId = String(formData.get('addon_id'));
  await sb.from('teacher_addons').delete().eq('teacher_id', teacherId).eq('addon_id', addonId);
  revalidatePath(`/admin/teachers/${teacherId}`);
}
