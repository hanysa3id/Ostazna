import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentTeacher } from '@/lib/dal/teachers';
import { TeacherSidebar } from '@/components/dashboard/teacher-sidebar';
import { TeacherHeader } from '@/components/dashboard/teacher-header';
import { ImpersonationBanner } from '@/components/dashboard/impersonation-banner';

export const dynamic = 'force-dynamic';

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Super admins do not belong in the teacher portal.
  // Skip this check during impersonation so the admin can browse as the teacher.
  const { getImpersonating } = await import('@/lib/impersonation');
  const isAdmin = (user.app_metadata as any)?.role === 'super_admin';
  const impersonating = await getImpersonating();
  if (isAdmin && !impersonating) redirect('/admin/dashboard');

  const teacher = await getCurrentTeacher();

  // No teachers row yet → render children plain so /onboarding can fill the screen.
  // Each individual page (dashboard, students, ...) decides whether to bounce to /onboarding.
  if (!teacher) return <>{children}</>;

  return (
    <div className="min-h-dvh bg-bg">
      <ImpersonationBanner />
      <TeacherHeader teacher={teacher} />
      <div className="flex">
        <TeacherSidebar />
        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
