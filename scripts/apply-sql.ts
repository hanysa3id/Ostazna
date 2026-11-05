// scripts/apply-sql.ts — execute a raw SQL file against Supabase via service role.
// Usage: npx tsx --env-file=.env.local scripts/apply-sql.ts <path-to-sql>
//
// Uses Supabase Management API (REST) since the service role JS client doesn't
// support raw multi-statement SQL. Fallback: execute statement-by-statement
// using pg via the connection string from SUPABASE_DB_URL.

import { readFileSync } from 'node:fs';
import { argv } from 'node:process';

const file = argv[2];
if (!file) {
  console.error('usage: npx tsx scripts/apply-sql.ts <file.sql>');
  process.exit(1);
}

const sql = readFileSync(file, 'utf8');
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const projectRef = url.match(/https?:\/\/([^.]+)\./)?.[1];

if (!projectRef) {
  console.error('Could not parse project ref from URL');
  process.exit(1);
}

// Use the PostgREST RPC `exec_sql` if available, otherwise advise db:push.
async function main() {
  // Try via Postgres REST `query` endpoint (Supabase Management API requires PAT, not service key).
  // Workaround: ask user to run via SQL Editor or `supabase db push`.

  console.log(`\nSQL to apply:\n${'='.repeat(60)}`);
  console.log(sql.slice(0, 500) + (sql.length > 500 ? '\n... (truncated)' : ''));
  console.log('='.repeat(60));

  console.log('\nThis script cannot execute multi-statement SQL via the JS client.');
  console.log('Run instead:');
  console.log(`  cat "${file}" | npx supabase db remote commit --linked`);
  console.log('OR open Supabase Dashboard → SQL Editor → paste & run:');
  console.log(`  https://supabase.com/dashboard/project/${projectRef}/sql/new`);
}

main();
