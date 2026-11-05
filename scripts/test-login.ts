// Quick test of login flow at the HTTP level.
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

(async () => {
  const sb = createClient(url, anon, { auth: { persistSession: false } });

  // Try to log in as one of the existing teachers (we'll trigger password reset)
  console.log('Testing signInWithPassword for cbadrx100@gmail.com (will fail if password unknown)...');
  const { data, error } = await sb.auth.signInWithPassword({
    email: 'cbadrx100@gmail.com',
    password: 'wrong-password-test',
  });
  if (error) {
    console.log(`  Expected: invalid creds → ${error.message} (code: ${(error as any).code})`);
  } else {
    console.log('  Surprisingly logged in!', data.user?.id);
  }

  // Test if rate limit recovered for new signup
  console.log('\nTesting signUp rate limit:');
  const ts = Date.now();
  const { data: sd, error: se } = await sb.auth.signUp({
    email: `test-${ts}@example.com`,
    password: 'StrongP@ssw0rd-' + ts,
  });
  if (se) {
    console.log(`  ❌ ${se.message} (code: ${(se as any).code})`);
  } else {
    console.log('  ✅ signUp works. session:', sd.session ? 'returned' : 'null (confirm email)');
    if (sd.user) {
      const adm = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
      await adm.auth.admin.deleteUser(sd.user.id);
    }
  }
})();
