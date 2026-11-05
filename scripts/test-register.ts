// scripts/test-register.ts — tries a real signup via the anon client to surface the actual error.
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

(async () => {
  const ts = Date.now();
  const email = `test-${ts}@example.com`;
  const password = 'StrongP@ssw0rd-' + ts;

  console.log(`\nAttempting signUp for: ${email}\n`);

  const { data, error } = await sb.auth.signUp({
    email, password,
    options: { data: { full_name: 'Test User' } },
  });

  if (error) {
    console.log('❌ Error:', JSON.stringify({
      status: (error as any).status,
      code: (error as any).code,
      name: error.name,
      message: error.message,
    }, null, 2));
  } else {
    console.log('✅ SignUp succeeded');
    console.log('   user.id:', data.user?.id);
    console.log('   session:', data.session ? 'returned' : 'null (email confirmation required)');
    console.log('   email_confirmed_at:', data.user?.email_confirmed_at ?? 'null');

    // Cleanup: delete the test user
    if (data.user) {
      const sbAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      );
      await sbAdmin.auth.admin.deleteUser(data.user.id);
      console.log('   (test user cleaned up)');
    }
  }
})();
