'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentTeacher } from '@/lib/dal/teachers';

export type InvoiceActionState = { error?: string };

async function nextInvoiceNumber(teacherId: string): Promise<string> {
  const supabase = await createClient();
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from('invoices')
    .select('id', { count: 'exact', head: true })
    .eq('teacher_id', teacherId)
    .gte('issued_at', `${year}-01-01`);
  const seq = String((count ?? 0) + 1).padStart(4, '0');
  return `INV-${year}-${seq}`;
}

export async function issueInvoiceAction(_prev: InvoiceActionState, formData: FormData): Promise<InvoiceActionState> {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { error: 'يلزم تسجيل الدخول.' };

  const studentId = formData.get('student_id') as string;
  const amount = Number(formData.get('amount'));
  const itemsRaw = formData.get('items') as string;
  const dueDate = formData.get('due_date') as string;
  const notes = formData.get('notes') as string;

  if (!studentId || !amount || amount <= 0) return { error: 'بيانات الفاتورة غير مكتملة.' };

  const supabase = await createClient();
  const invoiceNumber = await nextInvoiceNumber(teacher.id);

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      teacher_id: teacher.id,
      student_id: studentId,
      invoice_number: invoiceNumber,
      amount,
      due_date: dueDate || null,
      status: 'issued',
      items: itemsRaw ? JSON.parse(itemsRaw) : [],
      notes: notes || null,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('[invoices/issue]', error);
    return { error: `تعذر الإصدار: ${error?.message ?? 'سبب غير معروف'}` };
  }

  revalidatePath('/finance/invoices');
  redirect(`/finance/invoices`);
}
