// Supabase Edge Function: nightly-tasks
//
// Runs once a day to:
//   1. Expand recurring sessions for the next 90 days for every active teacher.
//   2. Auto-freeze teachers whose subscription ends_at has passed.
//   3. Auto-archive teachers frozen for more than 30 days.
//
// Deploy:    supabase functions deploy nightly-tasks
// Schedule:  in Supabase Dashboard → Edge Functions → Cron, set "0 2 * * *" (Africa/Cairo)
//            or use pg_cron via SQL: select cron.schedule('nightly-tasks', '0 2 * * *', $$select net.http_post(...)$$);

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const auth = req.headers.get('authorization') ?? '';
  const expected = `Bearer ${Deno.env.get('CRON_SECRET') ?? ''}`;
  if (!Deno.env.get('CRON_SECRET') || auth !== expected) {
    return new Response('unauthorized', { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  );

  const summary: Record<string, number> = { expanded: 0, frozen: 0, archived: 0 };

  // 1. Expand recurring sessions per teacher.
  const { data: activeTeachers } = await supabase
    .from('teachers')
    .select('id')
    .in('current_status', ['trial', 'active']);
  for (const t of activeTeachers ?? []) {
    const { data: n } = await supabase.rpc('expand_recurring_sessions', {
      p_teacher_id: t.id, p_horizon_days: 90,
    });
    summary.expanded += Number(n ?? 0);
  }

  // 2. Freeze expired subscriptions.
  const today = new Date().toISOString().slice(0, 10);
  const { data: expired } = await supabase
    .from('teachers')
    .update({ current_status: 'frozen' })
    .eq('current_status', 'active')
    .filter(
      'id',
      'in',
      `(select teacher_id from subscriptions where ends_at < '${today}' and status = 'active')`
    )
    .select('id');
  summary.frozen = (expired ?? []).length;

  // 3. Archive teachers frozen for > 30 days.
  // We use updated_at as a proxy for "frozen since".
  const cutoff = new Date(Date.now() - 30 * 86400_000).toISOString();
  const { data: archived } = await supabase
    .from('teachers')
    .update({ current_status: 'archived' })
    .eq('current_status', 'frozen')
    .lt('updated_at', cutoff)
    .select('id');
  summary.archived = (archived ?? []).length;

  return new Response(JSON.stringify({ ok: true, summary }), {
    headers: { 'content-type': 'application/json' },
  });
});
