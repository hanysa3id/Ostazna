'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentTeacher } from '@/lib/dal/teachers';
import { paymentSchema } from '@/lib/validations/payment';
import { recordPayment } from '@/lib/dal/payments';
import { assertCanSendWA, logWASend, QuotaError } from '@/lib/quotas';
import { buildWaLink, latePaymentMessage } from '@/lib/utils/wa';

export type PaymentActionState = { error?: string };

export async function recordPaymentAction(_prev: PaymentActionState, formData: FormData): Promise<PaymentActionState> {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { error: 'يلزم تسجيل الدخول.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'يلزم تسجيل الدخول.' };

  const parsed = paymentSchema.safeParse({
    student_id: formData.get('student_id'),
    amount: formData.get('amount'),
    payment_date: formData.get('payment_date'),
    method: formData.get('method'),
    period_from: formData.get('period_from'),
    period_to: formData.get('period_to'),
    notes: formData.get('notes'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة.' };

  try {
    await recordPayment(teacher.id, user.id, parsed.data);
  } catch (err) {
    console.error('[payments/record]', err);
    return { error: err instanceof Error ? err.message : 'تعذر تسجيل الدفعة.' };
  }

  revalidatePath('/finance/payments');
  revalidatePath('/dashboard');
  redirect('/finance/payments');
}

export async function sendWaReminderAction(input: {
  studentId: string;
  recipientPhone: string;
  amountEGP: number;
}): Promise<{ url?: string; error?: string }> {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { error: 'يلزم تسجيل الدخول.' };
  if (!input.recipientPhone) return { error: 'لا يوجد رقم لولي الأمر.' };

  try {
    await assertCanSendWA(teacher.id);
  } catch (err) {
    if (err instanceof QuotaError) return { error: err.message };
    return { error: 'تعذر التحقق من السقف.' };
  }

  const supabase = await createClient();
  const { data: student } = await supabase
    .from('students')
    .select('name_ar')
    .eq('id', input.studentId)
    .maybeSingle();

  const message = latePaymentMessage({
    studentName: student?.name_ar ?? 'الطالب',
    amountEGP: input.amountEGP,
    monthLabel: new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' }),
    teacherName: teacher.name_ar,
  });

  const url = buildWaLink(input.recipientPhone, message);
  if (!url) return { error: 'رقم الهاتف غير صالح.' };

  await logWASend(teacher.id, input.recipientPhone, 'late_payment');
  return { url };
}
