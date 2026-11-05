'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function bulkArchiveStudentsAction(ids: string[]) {
  if (ids.length === 0) return { ok: true };
  const supabase = await createClient();
  const { error } = await supabase
    .from('students')
    .update({ archived_at: new Date().toISOString() })
    .in('id', ids);
  if (error) return { error: error.message };
  revalidatePath('/students');
  revalidatePath('/dashboard');
  return { ok: true };
}

export async function bulkUnarchiveStudentsAction(ids: string[]) {
  if (ids.length === 0) return { ok: true };
  const supabase = await createClient();
  const { error } = await supabase
    .from('students')
    .update({ archived_at: null })
    .in('id', ids);
  if (error) return { error: error.message };
  revalidatePath('/students');
  return { ok: true };
}
