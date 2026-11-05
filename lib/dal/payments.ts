import { createClient } from '@/lib/supabase/server';
import type { PaymentInput } from '@/lib/validations/payment';

export async function listPayments(opts: { studentId?: string; limit?: number } = {}) {
  const supabase = await createClient();
  let q = supabase
    .from('payments')
    .select('*, student:students(name_ar)')
    .order('payment_date', { ascending: false });
  if (opts.studentId) q = q.eq('student_id', opts.studentId);
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function recordPayment(teacherId: string, userId: string, input: PaymentInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('payments')
    .insert({
      teacher_id: teacherId,
      student_id: input.student_id,
      amount: input.amount,
      payment_date: input.payment_date,
      method: input.method,
      period_from: input.period_from || null,
      period_to: input.period_to || null,
      notes: input.notes || null,
      created_by: userId,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function monthRevenueEGP(): Promise<number> {
  const supabase = await createClient();
  const since = new Date(); since.setDate(1); since.setHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from('payments')
    .select('amount')
    .gte('payment_date', since.toISOString().slice(0, 10));
  if (error) throw error;
  return (data ?? []).reduce((sum, r: any) => sum + Number(r.amount), 0);
}

export async function listOverdueStudents() {
  // Students in monthly groups whose latest payment.period_to is older than today.
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .rpc('overdue_students_for_today', { p_today: today });
  if (error) {
    // Fallback if RPC isn't installed yet — return empty.
    return [];
  }
  return data ?? [];
}
