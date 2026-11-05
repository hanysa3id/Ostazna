import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'ostazna.com';
const RESERVED = new Set(['app', 'admin', 'www', 'api', 'cdn', 'static', 'assets']);

const PROTECTED_PREFIXES = [
  '/dashboard', '/students', '/groups', '/schedule', '/attendance',
  '/finance', '/notifications', '/settings', '/onboarding',
  '/exams', '/reports', '/cms', '/parent', '/student', '/data-export',
];
const AUTH_ROUTES = new Set(['/login', '/register', '/forgot-password']);
const AUTH_PASSTHROUGH = new Set(['/verify']);

// Hosts that are treated like the apex (no subdomain rewrite).
// Includes Vercel preview/production deployments and the explicit root domain.
const APEX_HOSTS = new Set<string>([ROOT_DOMAIN, `www.${ROOT_DOMAIN}`]);

function isApexLikeHost(host: string): boolean {
  if (APEX_HOSTS.has(host)) return true;
  if (host === 'localhost') return true;
  if (host.endsWith('.vercel.app')) return true;     // Vercel previews + production fallback
  if (host.endsWith('.local') || host.endsWith('.localhost')) return true;
  if (/^[\d.]+$/.test(host)) return true;             // raw IP
  if (!host.includes('.')) return true;               // dotless (e.g. localhost variants)
  return false;
}

export async function middleware(request: NextRequest) {
  try {
    const { response, user } = await updateSession(request);
    const url = request.nextUrl;
    const host = (request.headers.get('host') ?? '').split(':')[0].toLowerCase();
    const path = url.pathname;

    // Resolve subdomain only for *.ostazna.com hosts that aren't reserved.
    let subdomain: string | null = null;
    if (host.endsWith(`.${ROOT_DOMAIN}`)) {
      const candidate = host.slice(0, -1 - ROOT_DOMAIN.length);
      if (candidate && !RESERVED.has(candidate)) subdomain = candidate;
    }

    // Admin host or /admin path → must be authenticated (role check happens in layout).
    if (host === `admin.${ROOT_DOMAIN}` || path.startsWith('/admin')) {
      if (!user) return NextResponse.redirect(new URL('/login', request.url));
    }

    // Protected routes.
    if (PROTECTED_PREFIXES.some(p => path === p || path.startsWith(p + '/'))) {
      if (!user) {
        const login = new URL('/login', request.url);
        login.searchParams.set('next', path);
        return NextResponse.redirect(login);
      }
    }

    // Authenticated user on auth pages → bounce to dashboard.
    if (user && AUTH_ROUTES.has(path) && !AUTH_PASSTHROUGH.has(path)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Never interfere with /auth/* (OAuth callback, etc.).
    if (path.startsWith('/auth/')) return response;

    // Block direct access to internal /s/* on apex hosts.
    if (!subdomain && path.startsWith('/s/') && isApexLikeHost(host)) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }

    // Teacher subdomain rewrite.
    if (subdomain && !path.startsWith('/api') && !path.startsWith('/_next')) {
      const rewritten = new URL(`/s/${subdomain}${path}`, request.url);
      return NextResponse.rewrite(rewritten, { headers: response.headers });
    }

    // Custom-domain rewrite — only when host is genuinely a third-party domain
    // pointing at our infra (not Vercel previews, not localhost, not the apex).
    if (!isApexLikeHost(host) && !path.startsWith('/api') && !path.startsWith('/_next')) {
      const rewritten = new URL(`/s/${encodeURIComponent('@host:' + host)}${path}`, request.url);
      return NextResponse.rewrite(rewritten, { headers: response.headers });
    }

    return response;
  } catch (err) {
    // Never let middleware crash the request — return a clean passthrough so
    // the page can render its own error / 404 / login.
    console.error('[middleware] unhandled error:', err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif)).*)',
  ],
};
