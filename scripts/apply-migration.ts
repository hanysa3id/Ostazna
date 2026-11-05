// scripts/apply-migration.ts — apply a single SQL migration directly via pg.
// Usage: npx tsx --env-file=.env.local scripts/apply-migration.ts <file>
import { readFileSync } from 'node:fs';
import { argv } from 'node:process';
import { Client } from 'pg';

const file = argv[2];
if (!file) { console.error('usage: apply-migration <file.sql>'); process.exit(1); }

const sql = readFileSync(file, 'utf8');
const cs = process.env.SUPABASE_DB_URL;
if (!cs) { console.error('SUPABASE_DB_URL missing in .env.local'); process.exit(1); }

(async () => {
  const c = new Client({ connectionString: cs, ssl: { rejectUnauthorized: false } });
  await c.connect();
  try {
    console.log(`Applying ${file} (${sql.length} chars)...`);
    await c.query(sql);
    console.log('✅ Applied successfully');
  } catch (err: any) {
    console.error('❌ Error:', err.message);
    if (err.position) console.error('   at position:', err.position);
    process.exit(1);
  } finally {
    await c.end();
  }
})();
