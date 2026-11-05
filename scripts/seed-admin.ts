// scripts/seed-admin.ts — one-time bootstrap for the first Super Admin user.
//
// Usage:
//   npm run seed:admin -- --email you@example.com --password 'Strong#Pass1'
//
// The npm script loads .env.local automatically (--env-file flag).
// Falls back to env vars ADMIN_EMAIL / ADMIN_PASSWORD if no CLI args.

import { createClient } from '@supabase/supabase-js';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    email: { type: 'string' },
    password: { type: 'string' },
  },
  strict: false,
});

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (values.email as string | undefined) ?? process.env.ADMIN_EMAIL;
const password = (values.password as string | undefined) ?? process.env.ADMIN_PASSWORD;

if (!url || !serviceKey) {
  console.error('Missing Supabase env. Make sure .env.local has:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!email || !password) {
  console.error('Missing admin credentials. Pass them as flags:');
  console.error('  npm run seed:admin -- --email you@example.com --password \'Strong#Pass1\'');
  console.error('Or set ADMIN_EMAIL / ADMIN_PASSWORD in .env.local');
  process.exit(1);
}

async function main() {
  const admin = createClient(url!, serviceKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: list, error: listErr } = await admin.auth.admin.listUsers();
  if (listErr) throw listErr;

  const existing = list?.users.find(u => u.email?.toLowerCase() === email!.toLowerCase());

  let userId: string;
  if (existing) {
    userId = existing.id;
    console.log(`User exists: ${userId} — updating role to super_admin`);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: email!,
      password: password!,
      email_confirm: true,
      app_metadata: { role: 'super_admin' },
    });
    if (error || !data.user) throw error ?? new Error('createUser failed');
    userId = data.user.id;
    console.log(`Created admin user: ${userId}`);
  }

  await admin.auth.admin.updateUserById(userId, {
    app_metadata: { role: 'super_admin' },
  });
  console.log('✔ super_admin role set on app_metadata');
  console.log('Login at /login then visit https://admin.ostazna.com/admin/dashboard');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
