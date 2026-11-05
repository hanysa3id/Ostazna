// Per-tier quota enforcement. Called from server actions before any quota-bound mutation.
// Quota source = teachers.current_plan_id → plans.{student_cap, wa_cap_monthly}.

import { createClient } from '@/lib/supabase/server';

export class QuotaError extends Error {
  constructor(public code: 'students_cap' | 'wa_cap_monthly', message: string) {
    super(message);
    this.name = 'QuotaError';
  }
}

async function getTeacherPlan(teacherId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('teachers')
    .select('id, current_plan_id, plans:current_plan_id(student_cap, wa_cap_monthly)')
    .eq('id', teacherId)
    .single();
  if (error || !data) throw new Error('plan_lookup_failed');
  return data as unknown as {
    id: string;
    current_plan_id: string;
    plans: { student_cap: number | null; wa_cap_monthly: number | null } | null;
  };
}

export async function assertCanAddStudent(teacherId: string) {
  const supabase = await createClient();
  const teacher = await getTeacherPlan(teacherId);
  const cap = teacher.plans?.student_cap;
  if (cap == null) return; // unlimited

  const { count, error } = await supabase
    .from('students')
    .select('id', { count: 'exact', head: true })
    .is('archived_at', null);
  if (error) throw new Error('count_failed');
  if ((count ?? 0) >= cap) {
    throw new QuotaError('students_cap', `وصلت للحد الأقصى (${cap}) من الطلاب لخطتك الحالية.`);
  }
}

export async function assertCanSendWA(teacherId: string) {
  const supabase = await createClient();
  const teacher = await getTeacherPlan(teacherId);
  const cap = teacher.plans?.wa_cap_monthly;
  if (cap == null) return; // unlimited

  const since = new Date();
  since.setDate(1); since.setHours(0, 0, 0, 0);
  const { count, error } = await supabase
    .from('wa_send_log')
    .select('id', { count: 'exact', head: true })
    .gte('sent_at', since.toISOString());
  if (error) throw new Error('count_failed');
  if ((count ?? 0) >= cap) {
    throw new QuotaError('wa_cap_monthly', `وصلت للحد الأقصى (${cap}) من رسائل الواتساب هذا الشهر.`);
  }
}

export async function logWASend(teacherId: string, recipient: string, template?: string) {
  const supabase = await createClient();
  await supabase.from('wa_send_log').insert({
    teacher_id: teacherId,
    recipient_phone: recipient,
    template: template ?? null,
  });
}
