import { createClient, createServiceRoleClient } from '@/lib/supabase/server';

export type TeacherRow = {
  id: string;
  user_id: string;
  name_ar: string;
  name_en: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  subdomain: string | null;
  current_status: 'trial' | 'active' | 'frozen' | 'archived';
  current_plan_id: string | null;
  locale: string;
  onboarded_at: string | null;
};

export async function getCurrentTeacher(): Promise<TeacherRow | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('[getCurrentTeacher] user-scoped query error:', error.code, error.message);
  }

  // If the user-scoped read returns nothing, try service role as a fallback.
  // This handles transient RLS issues right after onboarding (before token refresh).
  if (!data) {
    try {
      const sb = createServiceRoleClient();
      const { data: serviceData } = await sb
        .from('teachers').select('*').eq('user_id', user.id).maybeSingle();
      if (serviceData) return serviceData as TeacherRow;
    } catch (err) {
      console.error('[getCurrentTeacher] service role fallback failed:', err);
    }
  }
  return (data as TeacherRow) ?? null;
}

/**
 * A teacher is considered onboarded if they have a subdomain AND a current_plan_id.
 * `onboarded_at` is the canonical marker, but for resilience we accept the structural
 * proof too — that prevents a NULL `onboarded_at` from looping the user back to the
 * wizard after they've already completed it.
 *
 * If we detect this drift, we fix it lazily so the next request takes the fast path.
 */
export function isTeacherOnboarded(t: TeacherRow | null | undefined): boolean {
  if (!t) return false;
  if (t.onboarded_at) return true;
  return Boolean(t.subdomain && t.current_plan_id);
}

/** Best-effort backfill of onboarded_at for legacy rows. Never throws. */
export async function backfillOnboardedAt(teacherId: string): Promise<void> {
  try {
    const sb = createServiceRoleClient();
    await sb
      .from('teachers')
      .update({ onboarded_at: new Date().toISOString() })
      .eq('id', teacherId)
      .is('onboarded_at', null);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[backfillOnboardedAt] failed:', err);
  }
}

export async function isSubdomainTaken(subdomain: string, exceptTeacherId?: string): Promise<boolean> {
  // Service role: subdomain check must see ALL teachers, not just the caller's row.
  const supabase = createServiceRoleClient();
  let q = supabase.from('teachers').select('id', { head: true, count: 'exact' }).eq('subdomain', subdomain);
  if (exceptTeacherId) q = q.neq('id', exceptTeacherId);
  const { count, error } = await q;
  if (error) throw new Error('subdomain_check_failed');
  return (count ?? 0) > 0;
}

export async function getTeacherBySubdomain(subdomain: string) {
  const supabase = await createClient();

  // Custom-domain marker from middleware: "@host:example.com"
  if (subdomain.startsWith('@host:')) {
    const host = subdomain.slice('@host:'.length);
    const { data } = await supabase
      .from('teachers')
      .select('id, name_ar, name_en, avatar_url, phone, subdomain, settings')
      .eq('custom_domain', host)
      .maybeSingle();
    return data;
  }

  const { data } = await supabase
    .from('teachers')
    .select('id, name_ar, name_en, avatar_url, phone, subdomain, settings')
    .eq('subdomain', subdomain)
    .maybeSingle();
  return data;
}
