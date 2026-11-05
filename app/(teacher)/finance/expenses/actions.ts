'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentTeacher } from '@/lib/dal/teachers';

export type ExpenseActionState = { error?: string };

const expenseSchema = z.object({
  amount: z.coerce.number().positive(),
  expense_date: z.string().date(),
  category_id: z.string().uuid().optional().or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
});

export async function addExpenseAction(_prev: ExpenseActionState, formData: FormData): Promise<ExpenseActionState> {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { error: 'يلزم تسجيل الدخول.' };

  const parsed = expenseSchema.safeParse({
    amount: formData.get('amount'),
    expense_date: formData.get('expense_date'),
    category_id: formData.get('category_id'),
    description: formData.get('description'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة.' };

  const supabase = await createClient();
  const { error } = await supabase.from('expenses').insert({
    teacher_id: teacher.id,
    amount: parsed.data.amount,
    expense_date: parsed.data.expense_date,
    category_id: parsed.data.category_id || null,
    description: parsed.data.description || null,
    receipt_url: (formData.get('receipt_url') as string) || null,
  });
  if (error) {
    console.error('[expenses/add]', error);
    return { error: `تعذر الحفظ: ${error.message}` };
  }

  revalidatePath('/finance/expenses');
  redirect('/finance/expenses');
}

export async function addCategoryAction(formData: FormData) {
  const teacher = await getCurrentTeacher();
  if (!teacher) return;
  const name = String(formData.get('name')).trim();
  const color = String(formData.get('color') ?? '#eef4fb');
  if (!name) return;
  const supabase = await createClient();
  await supabase.from('expense_categories').insert({ teacher_id: teacher.id, name, color });
  revalidatePath('/finance/expenses');
  revalidatePath('/finance/expenses/categories');
}

export async function deleteCategoryAction(formData: FormData) {
  const id = String(formData.get('id'));
  const supabase = await createClient();
  await supabase.from('expense_categories').delete().eq('id', id);
  revalidatePath('/finance/expenses');
  revalidatePath('/finance/expenses/categories');
}
