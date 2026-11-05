// Caddy on-demand TLS validator.
// Returns 200 only if the hostname is a registered teacher custom_domain
// (or one of the platform's built-in hosts). Otherwise 404 → Caddy refuses to issue.

import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'ostazna.com';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const host = (url.searchParams.get('domain') ?? '').toLowerCase();

  if (!host) return new NextResponse('missing domain', { status: 400 });
  if (host === ROOT || host.endsWith(`.${ROOT}`)) return new NextResponse('ok', { status: 200 });

  const supabase = createServiceRoleClient();
  const { count } = await supabase
    .from('teachers')
    .select('id', { count: 'exact', head: true })
    .eq('custom_domain', host);

  return new NextResponse(count ? 'ok' : 'unknown', { status: count ? 200 : 404 });
}
