'use server';

import { revalidatePath } from 'next/cache';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { isSubdomainTaken } from '@/lib/dal/teachers';
import {
  profileSchema, academicYearSchema, firstGroupSchema, subdomainSchema,
} from '@/lib/validations/onboarding';

const RESERVED_SUBS = new Set(['app','admin','www','api','cdn','static','assets','help','blog','docs','status','support','mail','dev','staging','test']);

type Input = {
  profile: { name_ar: string; name_en?: string; phone?: string };
  year: { name: string; start_date: string; end_date: string };
  group: {
    name: string; grade_name: string; subject_name: string;
    pricing: 'monthly' | 'per_session'; price: number;
  };
  subdomain: string;
};

export async function completeOnboarding(input: Input): Promise<{ ok?: boolean; error?: string }> {
  // Auth check uses the user-scoped client.
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return { error: 'يلزم تسجيل الدخول.' };

  // Onboarding writes use service role: the teacher row doesn't exist yet,
  // so the JWT has no `teacher_id` claim, so RLS would reject the chain of inserts.
  // We've already verified the user above, so this is safe and scoped.
  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch (err) {
    console.error('[onboarding] service role client init failed:', err);
    return {
      error: err instanceof Error
        ? err.message
        : 'مفتاح Supabase service role غير مضبوط. راجع .env.local',
    };
  }

  // Validate every payload.
  const profile = profileSchema.safeParse(input.profile);
  const year = academicYearSchema.safeParse(input.year);
  const group = firstGroupSchema.safeParse(input.group);
  const sub = subdomainSchema.safeParse({ subdomain: input.subdomain });
  if (!profile.success) return { error: profile.error.issues[0]?.message ?? 'بيانات غير صحيحة.' };
  if (!year.success) return { error: year.error.issues[0]?.message ?? 'بيانات السنة غير صحيحة.' };
  if (!group.success) return { error: group.error.issues[0]?.message ?? 'بيانات المجموعة غير صحيحة.' };
  if (!sub.success) return { error: sub.error.issues[0]?.message ?? 'الـ Subdomain غير صحيح.' };
  if (RESERVED_SUBS.has(sub.data.subdomain)) return { error: 'هذا الـ Subdomain محجوز، اختر آخر.' };

  // Find existing teacher row (if any) so we can exclude self from the subdomain check.
  const { data: existing } = await supabase
    .from('teachers')
    .select('id, subdomain')
    .eq('user_id', user.id)
    .maybeSingle();

  // Only check subdomain if it's actually changing (or new).
  if (existing?.subdomain !== sub.data.subdomain) {
    const taken = await isSubdomainTaken(sub.data.subdomain, existing?.id);
    if (taken) return { error: 'هذا الـ Subdomain مستخدم بالفعل، اختر آخر.' };
  }

  // Look up the Free plan id.
  const { data: freePlan } = await supabase.from('plans').select('id').eq('tier', 'free').single();
  if (!freePlan) return { error: 'الخطة المجانية غير متوفرة. تواصل مع الدعم.' };

  // Upsert teacher row.
  const teacherPayload = {
    user_id: user.id,
    email: user.email!,
    name_ar: profile.data.name_ar,
    name_en: profile.data.name_en || null,
    phone: profile.data.phone || null,
    subdomain: sub.data.subdomain,
    current_status: 'trial' as const,
    current_plan_id: freePlan.id,
    onboarded_at: new Date().toISOString(),
  };

  const { data: teacher, error: tErr } = await supabase
    .from('teachers')
    .upsert(teacherPayload, { onConflict: 'user_id' })
    .select('id')
    .single();
  if (tErr || !teacher) {
    console.error('[onboarding] teacher upsert failed:', tErr);
    return { error: `تعذر إنشاء الحساب: ${tErr?.message ?? 'سبب غير معروف'}` };
  }
  console.log(`[onboarding] teacher row OK: ${teacher.id}`);

  // Clear any previous "is_current" academic year for this teacher to avoid the
  // partial unique index conflict (one_current_year_per_teacher).
  await supabase
    .from('academic_years')
    .update({ is_current: false })
    .eq('teacher_id', teacher.id)
    .eq('is_current', true);

  // Academic year (idempotent on (teacher_id, name)).
  const { data: ay, error: ayErr } = await supabase
    .from('academic_years')
    .upsert({
      teacher_id: teacher.id,
      name: year.data.name,
      start_date: year.data.start_date,
      end_date: year.data.end_date,
      is_current: true,
    }, { onConflict: 'teacher_id,name' })
    .select('id')
    .single();
  if (ayErr || !ay) {
    console.error('[onboarding] academic_year upsert failed:', ayErr);
    return { error: `تعذر إنشاء السنة الدراسية: ${ayErr?.message ?? 'سبب غير معروف'}` };
  }

  // Grade — idempotent: reuse existing grade with the same name in this year.
  const { data: existingGrade } = await supabase
    .from('grades')
    .select('id')
    .eq('teacher_id', teacher.id)
    .eq('academic_year_id', ay.id)
    .eq('name', group.data.grade_name)
    .maybeSingle();

  let gradeId: string;
  if (existingGrade) {
    gradeId = existingGrade.id;
  } else {
    const { data: newGrade, error: gErr } = await supabase
      .from('grades')
      .insert({
        teacher_id: teacher.id,
        academic_year_id: ay.id,
        name: group.data.grade_name,
        level: 'secondary',
      })
      .select('id')
      .single();
    if (gErr || !newGrade) {
      console.error('[onboarding] grade insert failed:', gErr);
      return { error: `تعذر إنشاء المرحلة: ${gErr?.message ?? 'سبب غير معروف'}` };
    }
    gradeId = newGrade.id;
  }

  // Subject.
  const { data: subject, error: sErr } = await supabase
    .from('subjects')
    .upsert({ teacher_id: teacher.id, name_ar: group.data.subject_name }, { onConflict: 'teacher_id,name_ar' })
    .select('id')
    .single();
  if (sErr || !subject) {
    console.error('[onboarding] subject upsert failed:', sErr);
    return { error: `تعذر إنشاء المادة: ${sErr?.message ?? 'سبب غير معروف'}` };
  }

  // First group — idempotent: reuse if a group with same name+year exists.
  const { data: existingGroup } = await supabase
    .from('groups')
    .select('id')
    .eq('teacher_id', teacher.id)
    .eq('academic_year_id', ay.id)
    .eq('name', group.data.name)
    .maybeSingle();

  if (!existingGroup) {
    const { error: grpErr } = await supabase.from('groups').insert({
      teacher_id: teacher.id,
      academic_year_id: ay.id,
      grade_id: gradeId,
      subject_id: subject.id,
      name: group.data.name,
      pricing: group.data.pricing,
      price_monthly: group.data.pricing === 'monthly' ? group.data.price : null,
      price_per_session: group.data.pricing === 'per_session' ? group.data.price : null,
    });
    if (grpErr) {
      console.error('[onboarding] group insert failed:', grpErr);
      return { error: `تعذر إنشاء المجموعة: ${grpErr.message}` };
    }
  }
  console.log(`[onboarding] complete for teacher ${teacher.id}`);

  // Force a session refresh so the next request's JWT carries the teacher_id claim
  // (populated by the Custom Access Token Hook configured in Supabase).
  await userClient.auth.refreshSession();

  // Fire-and-forget welcome email (no-op if RESEND_API_KEY isn't set).
  try {
    const { sendEmail, welcomeEmailHtml } = await import('@/lib/email');
    void sendEmail({
      to: user.email!,
      subject: 'أهلاً بك في أستاذنا',
      html: welcomeEmailHtml(profile.data.name_ar),
    });
  } catch { /* swallow */ }

  revalidatePath('/', 'layout');
  return { ok: true };
}
