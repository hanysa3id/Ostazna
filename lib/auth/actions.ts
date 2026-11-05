'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { loginSchema, registerSchema } from '@/lib/validations/auth';

export type AuthState = { error?: string; ok?: boolean };

async function getOrigin(): Promise<string> {
  // Prefer the actual request origin so dev (localhost) and prod (ostazna.com) both work.
  const h = await headers();
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'invalid' };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: 'invalid_credentials' };

  revalidatePath('/', 'layout');

  // Route by role: super admins go straight to the admin panel.
  const requestedNext = formData.get('next') as string | null;
  if (requestedNext) redirect(requestedNext);

  const isAdmin = (data.user?.app_metadata as any)?.role === 'super_admin';
  redirect(isAdmin ? '/admin/dashboard' : '/dashboard');
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'invalid' };

  const supabase = await createClient();
  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.name },
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
    },
  });
  if (error) {
    // Log the actual error for debugging.
    console.error('[register] signUp failed:', JSON.stringify({
      status: (error as any).status,
      code: (error as any).code,
      name: error.name,
      message: error.message,
    }, null, 2));

    const m = error.message.toLowerCase();
    const code = (error as any).code as string | undefined;

    if (m.includes('registered') || m.includes('already')) return { error: 'email_in_use' };
    if (m.includes('password')) return { error: 'weak_password' };
    if (code === 'over_email_send_rate_limit' || m.includes('rate limit')) {
      return { error: 'تم تجاوز حد إرسال رسائل التأكيد لهذه الساعة. اطلب من مدير المنصة تعطيل تأكيد البريد من Supabase Auth → Providers → Email، أو ربط SMTP خارجي.' };
    }
    if (m.includes('email') && m.includes('invalid')) return { error: 'البريد غير صالح.' };
    if (m.includes('confirmation') || m.includes('smtp')) {
      return { error: 'إعدادات SMTP غير مكتملة في Supabase. عطّل تأكيد البريد أو اربط SMTP.' };
    }
    return { error: error.message };
  }

  // If Supabase is configured WITHOUT email confirmation, signUp returns a session immediately.
  // In that case, send the user straight to onboarding instead of the verify screen.
  if (data.session) {
    revalidatePath('/', 'layout');
    redirect('/onboarding');
  }
  redirect('/verify');
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function googleSignInAction() {
  const supabase = await createClient();
  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=/onboarding`,
    },
  });
  if (error || !data.url) redirect('/login?error=oauth');
  redirect(data.url);
}
