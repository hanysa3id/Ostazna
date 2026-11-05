// Lightweight impersonation: a server action mints a session for the target teacher
// using the service role admin API, sets the auth cookies, and the middleware/UI shows
// an impersonation banner driven by a separate cookie.

import { cookies } from 'next/headers';

export const IMPERSONATION_COOKIE = 'ostazna_impersonating';

export async function markImpersonating(adminId: string, teacherId: string) {
  const c = await cookies();
  c.set(IMPERSONATION_COOKIE, JSON.stringify({ adminId, teacherId, at: Date.now() }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60, // 1 hour max
  });
}

export async function clearImpersonating() {
  const c = await cookies();
  c.delete(IMPERSONATION_COOKIE);
}

export async function getImpersonating(): Promise<{ adminId: string; teacherId: string; at: number } | null> {
  const c = await cookies();
  const raw = c.get(IMPERSONATION_COOKIE)?.value;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
