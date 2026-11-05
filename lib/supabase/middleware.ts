import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './database.types';

export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  user: any | null;
}> {
  let response = NextResponse.next({ request });

  // Defensive: if Supabase env is missing (e.g. mis-configured deploy),
  // don't crash middleware — just return a clean passthrough so pages
  // can show their own error and the host shows useful info.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('[middleware] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env');
    return { response, user: null };
  }

  try {
    const supabase = createServerClient<Database>(url, key, {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookies) {
          for (const { name, value } of cookies) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookies) {
            response.cookies.set(name, value, options);
          }
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    return { response, user };
  } catch (err) {
    // Never let middleware crash — log and pass through.
    console.error('[middleware] updateSession failed:', err);
    return { response, user: null };
  }
}
