// scripts/check-state.ts — verifies migration state and prints teacher rows.
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

(async () => {
  console.log('\n=== Tables (Phase 0010+) ===');
  for (const t of ['addons', 'teacher_addons', 'platform_settings']) {
    const { error } = await sb.from(t).select('*', { head: true, count: 'exact' });
    console.log(`  ${t.padEnd(22)} ${error ? '❌ ' + error.message : '✅'}`);
  }

  console.log('\n=== Teachers ===');
  const { data: teachers } = await sb
    .from('teachers')
    .select('id, email, name_ar, onboarded_at, subdomain, current_plan_id, current_status');
  for (const t of teachers ?? []) {
    console.log(`  ${t.email}`);
    console.log(`    name_ar: ${t.name_ar}`);
    console.log(`    onboarded_at: ${t.onboarded_at ?? 'NULL'}`);
    console.log(`    subdomain: ${t.subdomain ?? 'NULL'}`);
    console.log(`    current_plan_id: ${t.current_plan_id ? '✅ set' : '❌ NULL'}`);
    console.log(`    current_status: ${t.current_status}`);
  }

  console.log('\n=== Recent audit logs (last 5) ===');
  const { data: logs } = await sb
    .from('audit_logs')
    .select('action, entity_type, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  for (const l of logs ?? []) {
    console.log(`  ${l.created_at?.slice(0, 19)} ${l.action} ${l.entity_type}`);
  }
})();
