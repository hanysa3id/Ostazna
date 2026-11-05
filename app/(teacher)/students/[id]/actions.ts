'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function archiveStudentAction(formData: FormData) {
  const id = String(formData.get('id'));
  const supabase = await createClient();

  const { data: row } = await supabase.from('students').select('archived_at').eq('id', id).maybeSingle();
  await supabase
    .from('students')
    .update({ archived_at: row?.archived_at ? null : new Date().toISOString() })
    .eq('id', id);

  revalidatePath('/students');
  revalidatePath(`/students/${id}`);
  redirect('/students');
}
