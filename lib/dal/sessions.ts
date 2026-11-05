import { createClient } from '@/lib/supabase/server';

export async function listSessionsRange(fromISO: string, toISO: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sessions')
    .select('*, group:groups(name)')
    .gte('scheduled_at', fromISO)
    .lt('scheduled_at', toISO)
    .order('scheduled_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function listTodaySessions() {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setDate(end.getDate() + 1);
  return listSessionsRange(start.toISOString(), end.toISOString());
}

export async function setSessionStatus(id: string, status: 'scheduled' | 'completed' | 'cancelled') {
  const supabase = await createClient();
  const { error } = await supabase.from('sessions').update({ status }).eq('id', id);
  if (error) throw error;
}
