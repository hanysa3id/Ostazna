import { createServerClient } from '@supabase/ssr';
import { createClient as createPlainClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookies) {
          try {
            for (const { name, value, options } of cookies) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // setAll called from a Server Component — middleware will refresh on next request.
          }
        },
      },
    }
  );
}

/**
 * Server-only Supabase client that uses the service role key and bypasses RLS.
 * NEVER expose to the browser. NEVER pass user input directly into queries without validation.
 * Used for admin/system operations like onboarding (where the user has no teacher_id claim yet).
 *
 * Important: this is a *plain* client (no cookie attachment), so an existing user session
 * cannot accidentally override the service role token.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SERVICE_ROLE_KEY_MISSING');

  // Catch the very common mistake of pasting the anon key in both env slots.
  // Service role JWTs decode to {"role":"service_role"}; anon JWTs to {"role":"anon"}.
  const payload = key.split('.')[1];
  if (payload) {
    try {
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
      if (decoded?.role && decoded.role !== 'service_role') {
        throw new Error(
          `SUPABASE_SERVICE_ROLE_KEY has role="${decoded.role}" — expected "service_role". ` +
          `Copy the *service_role* key from Supabase Dashboard → Project Settings → API.`
        );
      }
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('SUPABASE_SERVICE_ROLE_KEY')) throw err;
      // JSON parse failure is non-fatal — continue and let Supabase reject if the key is malformed.
    }
  }

  return createPlainClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}
