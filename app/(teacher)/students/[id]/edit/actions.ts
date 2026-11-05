'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type EditState = { error?: string };

export async function editStudentAction(_prev: EditState, formData: FormData): Promise<EditState> {
  const id = String(formData.get('id'));
  const name_ar = String(formData.get('name_ar') ?? '').trim();
  if (name_ar.length < 2) return { error: 'الاسم مطلوب.' };

  const customRaw = String(formData.get('custom_fields') ?? '{}');
  let custom_fields: Record<string, string> = {};
  try { custom_fields = JSON.parse(customRaw); } catch { custom_fields = {}; }

  const supabase = await createClient();
  const { error } = await supabase
    .from('students')
    .update({
      name_ar,
      name_en: (formData.get('name_en') as string) || null,
      date_of_birth: (formData.get('date_of_birth') as string) || null,
      phone: (formData.get('phone') as string) || null,
      parent_name: (formData.get('parent_name') as string) || null,
      parent_phone: (formData.get('parent_phone') as string) || null,
      notes: (formData.get('notes') as string) || null,
      custom_fields,
    })
    .eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/students');
  revalidatePath(`/students/${id}`);
  redirect(`/students/${id}`);
}
