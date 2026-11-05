'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentTeacher } from '@/lib/dal/teachers';

export async function regenerateSessionsAction() {
  const teacher = await getCurrentTeacher();
  if (!teacher) return;
  const supabase = await createClient();
  await supabase.rpc('expand_recurring_sessions', {
    p_teacher_id: teacher.id,
    p_horizon_days: 90,
  });
  revalidatePath('/schedule');
  revalidatePath('/dashboard');
}
