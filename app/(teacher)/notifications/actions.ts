'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentTeacher } from '@/lib/dal/teachers';
import { assertCanSendWA, logWASend, QuotaError } from '@/lib/quotas';

export type NotifyState = { error?: string };

export async function sendNotificationAction(_prev: NotifyState, formData: FormData): Promise<NotifyState> {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { error: 'يلزم تسجيل الدخول.' };

  const title = String(formData.get('title') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();
  const channel = formData.get('channel') as 'in_app' | 'whatsapp';
  const targetType = formData.get('target_type') as 'all' | 'group' | 'student';
  const targetId = (formData.get('target_id') as string) || null;

  if (!title || !body) return { error: 'العنوان والرسالة مطلوبان.' };

  if (channel === 'whatsapp') {
    try { await assertCanSendWA(teacher.id); } catch (err) {
      if (err instanceof QuotaError) return { error: err.message };
      return { error: 'تعذر التحقق من السقف.' };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.from('notifications').insert({
    teacher_id: teacher.id,
    title,
    body,
    channel,
    target_type: targetType,
    target_ids: targetId ? [targetId] : [],
    status: channel === 'in_app' ? 'sent' : 'pending',
    sent_at: channel === 'in_app' ? new Date().toISOString() : null,
  });

  if (error) return { error: `تعذر الإرسال: ${error.message}` };

  if (channel === 'whatsapp') {
    // Log a single WA send for cap purposes; actual link opening is done client-side.
    await logWASend(teacher.id, 'broadcast', 'manual_notification');
  }

  revalidatePath('/notifications');
  redirect('/notifications');
}
