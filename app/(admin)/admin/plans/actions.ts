'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';

async function ensureAdmin() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user || (user.app_metadata as any)?.role !== 'super_admin') throw new Error('forbidden');
}

export async function updatePlanAction(formData: FormData) {
  await ensureAdmin();
  const sb = createServiceRoleClient();

  const id = String(formData.get('id'));
  const studentCapRaw = String(formData.get('student_cap') ?? '');
  const waCapRaw = String(formData.get('wa_cap_monthly') ?? '');
  const addonsRaw = String(formData.get('bundled_addons') ?? '');

  const payload: any = {
    name_ar:        String(formData.get('name_ar') ?? '').trim(),
    name_en:        String(formData.get('name_en') ?? '').trim(),
    price_egp:      Number(formData.get('price_egp') ?? 0),
    student_cap:    studentCapRaw === '' ? null : Number(studentCapRaw),
    wa_cap_monthly: waCapRaw === '' ? null : Number(waCapRaw),
    bundled_addons: addonsRaw.split(',').map(s => s.trim()).filter(Boolean),
    is_active:      formData.get('is_active') === 'on',
  };

  const { error } = await sb.from('plans').update(payload).eq('id', id);
  if (error) {
    console.error('[admin/plans] update failed:', error);
    throw new Error(error.message);
  }
  revalidatePath('/admin/plans');
  revalidatePath('/pricing');
}
