'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';

async function ensureAdmin() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user || (user.app_metadata as any)?.role !== 'super_admin') throw new Error('forbidden');
  return user;
}

export async function saveSettingAction(key: string, value: any) {
  const user = await ensureAdmin();
  const sb = createServiceRoleClient();
  const { error } = await sb
    .from('platform_settings')
    .upsert({ key, value, updated_by: user.id, updated_at: new Date().toISOString() });
  if (error) {
    console.error('[platform-settings]', error);
    throw new Error(error.message);
  }
  revalidatePath('/admin/platform-settings');
  return { ok: true };
}

export async function savePaymentMethodsAction(formData: FormData) {
  const value = {
    cash:   { enabled: formData.get('cash_enabled') === 'on',   label: 'نقدي / تحويل يدوي' },
    bank:   { enabled: formData.get('bank_enabled') === 'on',   label: 'تحويل بنكي', iban: String(formData.get('bank_iban') ?? '') },
    wallet: { enabled: formData.get('wallet_enabled') === 'on', label: 'محفظة إلكترونية', number: String(formData.get('wallet_number') ?? '') },
    instructions_ar: String(formData.get('instructions_ar') ?? ''),
  };
  await saveSettingAction('payment_methods', value);
}

export async function saveBrandingAction(formData: FormData) {
  const value = {
    support_email:    String(formData.get('support_email') ?? ''),
    support_phone:    String(formData.get('support_phone') ?? ''),
    support_whatsapp: String(formData.get('support_whatsapp') ?? ''),
  };
  await saveSettingAction('platform_branding', value);
}
