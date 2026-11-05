'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { markImpersonating, clearImpersonating } from '@/lib/impersonation';

async function ensureAdmin() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user || (user.app_metadata as any)?.role !== 'super_admin') {
    throw new Error('forbidden');
  }
  return { user };
}

export async function impersonateAction(formData: FormData) {
  const { user: admin } = await ensureAdmin();
  const teacherId = String(formData.get('teacher_id'));
  const sb = createServiceRoleClient();

  const { data: teacher } = await sb
    .from('teachers').select('user_id, email').eq('id', teacherId).single();
  if (!teacher) return;

  const { data: link, error } = await sb.auth.admin.generateLink({
    type: 'magiclink', email: teacher.email,
  });
  if (error || !link.properties?.hashed_token) return;

  const userClient = await createClient();
  await userClient.auth.verifyOtp({
    type: 'magiclink', token_hash: link.properties.hashed_token,
  });

  await sb.from('audit_logs').insert({
    teacher_id: teacherId,
    actor_id: admin.id,
    actor_role: 'super_admin',
    action: 'IMPERSONATE_START',
    entity_type: 'teachers',
    entity_id: teacherId,
  });
  await markImpersonating(admin.id, teacherId);
  redirect('/dashboard');
}

export async function endImpersonationAction() {
  const { getImpersonating } = await import('@/lib/impersonation');
  const c = await getImpersonating();
  if (!c) return;
  const sb = createServiceRoleClient();
  await sb.from('audit_logs').insert({
    teacher_id: c.teacherId,
    actor_id: c.adminId,
    actor_role: 'super_admin',
    action: 'IMPERSONATE_END',
    entity_type: 'teachers',
    entity_id: c.teacherId,
  });
  const userClient = await createClient();
  await userClient.auth.signOut();
  await clearImpersonating();
  redirect('/admin/dashboard');
}

export async function confirmSubscriptionAction(formData: FormData) {
  const { user } = await ensureAdmin();
  const sb = createServiceRoleClient();

  const teacherId = String(formData.get('teacher_id'));
  const planId = String(formData.get('plan_id'));
  const months = Math.max(1, Math.min(12, Number(formData.get('months') ?? 1)));
  const method = String(formData.get('payment_method')) as 'cash'|'bank_transfer'|'wallet'|'other';

  const { data: plan } = await sb.from('plans').select('price_egp').eq('id', planId).single();
  const start = new Date();
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);

  const { error: subErr } = await sb.from('subscriptions').insert({
    teacher_id: teacherId,
    plan_id: planId,
    status: 'active',
    starts_at: start.toISOString().slice(0, 10),
    ends_at: end.toISOString().slice(0, 10),
    amount_paid_egp: (plan?.price_egp ?? 0) * months,
    payment_method: method,
    confirmed_by: user.id,
  });
  if (subErr) throw new Error(subErr.message);

  await sb.from('teachers').update({ current_status: 'active', current_plan_id: planId }).eq('id', teacherId);
  revalidatePath(`/admin/teachers/${teacherId}`);
}

export async function setStatusAction(formData: FormData) {
  await ensureAdmin();
  const sb = createServiceRoleClient();
  const teacherId = String(formData.get('teacher_id'));
  const status = String(formData.get('status')) as 'trial'|'active'|'frozen'|'archived';
  const { error } = await sb.from('teachers').update({ current_status: status }).eq('id', teacherId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/teachers/${teacherId}`);
}

export async function resetPasswordAction(formData: FormData) {
  await ensureAdmin();
  const sb = createServiceRoleClient();
  const teacherId = String(formData.get('teacher_id'));
  const { data: teacher } = await sb.from('teachers').select('user_id, email').eq('id', teacherId).single();
  if (!teacher) throw new Error('Teacher not found');

  const { data, error } = await sb.auth.admin.generateLink({
    type: 'recovery', email: teacher.email,
  });
  if (error) throw new Error(error.message);

  console.log(`[admin] password reset link for ${teacher.email}: ${data?.properties?.action_link}`);
  // The link is also emailed by Supabase if email provider is configured.
  revalidatePath(`/admin/teachers/${teacherId}`);
}

export async function deleteTeacherAction(formData: FormData) {
  await ensureAdmin();
  const sb = createServiceRoleClient();
  const teacherId = String(formData.get('teacher_id'));
  const confirm = String(formData.get('confirm') ?? '');
  if (confirm !== 'DELETE') throw new Error('Please type DELETE to confirm');

  const { data: teacher } = await sb.from('teachers').select('user_id').eq('id', teacherId).single();
  if (!teacher) throw new Error('Teacher not found');

  // Cascading delete: teachers row → cascades to all owned data via FKs.
  const { error: tErr } = await sb.from('teachers').delete().eq('id', teacherId);
  if (tErr) throw new Error(`Failed to delete teacher row: ${tErr.message}`);

  // Then delete the auth user (separate operation).
  const { error: uErr } = await sb.auth.admin.deleteUser(teacher.user_id);
  if (uErr) console.error('[admin] auth user delete failed:', uErr);

  revalidatePath('/admin/teachers');
  redirect('/admin/teachers');
}
