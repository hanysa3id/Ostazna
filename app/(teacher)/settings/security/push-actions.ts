'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentTeacher } from '@/lib/dal/teachers';

export async function savePushSubscription(input: {
  endpoint: string; p256dh: string; auth: string; userAgent?: string;
}) {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { error: 'unauthorized' };
  const supabase = await createClient();
  const { error } = await supabase.from('push_subscriptions').upsert({
    teacher_id: teacher.id,
    endpoint: input.endpoint,
    p256dh: input.p256dh,
    auth: input.auth,
    user_agent: input.userAgent ?? null,
  }, { onConflict: 'teacher_id,endpoint' });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function removePushSubscription(endpoint: string) {
  const teacher = await getCurrentTeacher();
  if (!teacher) return;
  const supabase = await createClient();
  await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
}
