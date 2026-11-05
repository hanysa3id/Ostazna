import { redirect } from 'next/navigation';
import { getCurrentTeacher, isTeacherOnboarded, backfillOnboardedAt } from '@/lib/dal/teachers';
import { createClient } from '@/lib/supabase/server';
import { OnboardingWizard } from './wizard';

export const metadata = { title: 'إعداد حسابك' };
export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  if ((user.app_metadata as any)?.role === 'super_admin') redirect('/admin/dashboard');

  const teacher = await getCurrentTeacher();

  // If they've already onboarded (by stamp OR by structural proof), bounce them to dashboard.
  if (isTeacherOnboarded(teacher)) {
    if (teacher && !teacher.onboarded_at) void backfillOnboardedAt(teacher.id);
    redirect('/dashboard');
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-primary-50 to-white py-10 px-6">
      <div className="mx-auto max-w-2xl">
        <OnboardingWizard
          initialName={teacher?.name_ar ?? (user.user_metadata?.full_name as string | undefined) ?? ''}
          email={user.email!}
        />
      </div>
    </div>
  );
}
