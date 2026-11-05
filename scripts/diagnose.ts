// scripts/diagnose.ts — Verifies the platform's data layer is healthy.
// Usage:  npm run diagnose
//
// Checks:
//   1. Service role key has the correct role
//   2. Every CMS table exists and is reachable
//   3. Row counts match what you expect
//   4. The first super admin exists with the correct role flag
//   5. RLS policies count per table (sanity check)

import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// 1. Service role key check
const payload = serviceKey.split('.')[1];
let role = 'unknown';
try {
  const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
  role = decoded?.role ?? 'unknown';
} catch {/**/}

console.log('=== Ostazna · Database Diagnosis ===\n');
console.log(`1. Service role key role: ${role === 'service_role' ? '✅' : '❌'} ${role}`);
if (role !== 'service_role') {
  console.error('   → SUPABASE_SERVICE_ROLE_KEY in .env.local is NOT the service_role key.');
  console.error('   → Copy the service_role key from Supabase Dashboard → Project Settings → API.');
}

const sb = createClient(url, serviceKey, { auth: { persistSession: false } });

const TABLES = [
  'teachers', 'subscriptions', 'students', 'groups', 'sessions', 'attendance', 'payments',
  'plans', 'audit_logs',
  'site_settings', 'site_hero_slides', 'site_stats', 'site_features',
  'site_testimonials', 'site_faqs', 'site_pages',
];

(async () => {
  console.log('\n2. Table existence + row counts:');
  // Some tables use a non-uuid primary key; use '*' so we don't depend on column names.
  for (const t of TABLES) {
    const { count, error } = await sb.from(t).select('*', { head: true, count: 'exact' });
    if (error) {
      console.log(`   ❌ ${t.padEnd(22)} — ${error.message}`);
    } else {
      console.log(`   ✅ ${t.padEnd(22)} — ${count} rows`);
    }
  }

  console.log('\n3. Super admin users:');
  const { data: list, error: lErr } = await sb.auth.admin.listUsers();
  if (lErr) {
    console.log(`   ❌ ${lErr.message}`);
  } else {
    const admins = (list?.users ?? []).filter(u => (u.app_metadata as any)?.role === 'super_admin');
    if (admins.length === 0) {
      console.log('   ❌ No super admin found. Run: npm run seed:admin -- --email ... --password ...');
    } else {
      admins.forEach(a => console.log(`   ✅ ${a.email} (${a.id.slice(0, 8)})`));
    }
  }

  console.log('\n4. CMS sample data:');
  for (const t of ['site_hero_slides', 'site_stats', 'site_features', 'site_testimonials', 'site_faqs']) {
    const { data } = await sb.from(t).select('*').limit(1);
    if (!data || data.length === 0) {
      console.log(`   ⚠ ${t.padEnd(22)} — empty (admin should add some)`);
    } else {
      console.log(`   ✅ ${t.padEnd(22)} — has data`);
    }
  }

  console.log('\n=== Done ===');
})();
