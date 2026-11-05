// scripts/test-dashboard.ts — exercises the same DAL queries the dashboard runs,
// using a real authenticated session for an existing teacher. Surfaces the actual
// SQL errors so we can pinpoint which query is failing.
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;

(async () => {
  const admin = createClient(url, service, { auth: { persistSession: false } });

  // Find a non-admin teacher to impersonate.
  const { data: list } = await admin.auth.admin.listUsers();
  const allUsers = list?.users ?? [];

  // Get teacher rows
  const { data: teachers } = await admin.from('teachers').select('id, user_id, name_ar, email');
  if (!teachers || teachers.length === 0) {
    console.error('No teachers found.');
    process.exit(1);
  }

  for (const teacher of teachers) {
    const u = allUsers.find(x => x.id === teacher.user_id);
    if (!u) continue;
    if ((u.app_metadata as any)?.role === 'super_admin') continue;

    console.log(`\n=== Testing as: ${teacher.email} (${teacher.id}) ===`);

    // Generate a magic link to get a session as this user
    const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink', email: teacher.email,
    });
    if (linkErr || !link.properties?.hashed_token) {
      console.error('  failed to generate link:', linkErr); continue;
    }

    // Create a fresh user-scoped client and use the magic link to get a session.
    const userClient = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error: otpErr } = await userClient.auth.verifyOtp({
      type: 'magiclink', token_hash: link.properties.hashed_token,
    });
    if (otpErr) { console.error('  verifyOtp failed:', otpErr.message); continue; }

    // Now run the same queries the dashboard does:
    const tests = [
      { name: 'getCurrentTeacher', q: () => userClient.from('teachers').select('*').eq('user_id', teacher.user_id).maybeSingle() },
      { name: 'listStudents',      q: () => userClient.from('students').select('*').is('archived_at', null).order('created_at', { ascending: false }) },
      { name: 'listTodaySessions', q: () => {
          const start = new Date(); start.setHours(0,0,0,0);
          const end = new Date(start); end.setDate(end.getDate() + 1);
          return userClient.from('sessions').select('*, group:groups(name)').gte('scheduled_at', start.toISOString()).lt('scheduled_at', end.toISOString());
        }},
      { name: 'monthRevenue',      q: () => {
          const since = new Date(); since.setDate(1); since.setHours(0,0,0,0);
          return userClient.from('payments').select('amount').gte('payment_date', since.toISOString().slice(0, 10));
        }},
      { name: 'overdueRPC',        q: () => userClient.rpc('overdue_students_for_today', { p_today: new Date().toISOString().slice(0, 10) }) },
    ];

    for (const t of tests) {
      const { data, error } = await t.q();
      if (error) {
        console.log(`  ❌ ${t.name.padEnd(20)} ${error.code} ${error.message}`);
        if ((error as any).hint)    console.log(`     hint: ${(error as any).hint}`);
        if ((error as any).details) console.log(`     details: ${(error as any).details}`);
      } else {
        const count = Array.isArray(data) ? data.length : data ? 1 : 0;
        console.log(`  ✅ ${t.name.padEnd(20)} (${count} rows)`);
      }
    }
  }
})();
