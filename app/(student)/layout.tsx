import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/components/dashboard/logout-button';

export const dynamic = 'force-dynamic';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Only users linked to a `students.user_id` may access here.
  const { data: student } = await supabase
    .from('students')
    .select('id, name_ar, teacher:teachers(name_ar, subdomain)')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!student) {
    return (
      <div className="min-h-dvh grid place-items-center px-6 bg-bg">
        <div className="bg-white rounded-card border border-neutral-200 p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-primary-900">حساب الطالب غير مفعّل</h1>
          <p className="text-sm text-neutral-600 mt-2">تواصل مع المدرس لربط حسابك ببياناته.</p>
          <Link href="/" className="mt-4 inline-block text-primary-700 text-sm">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg">
      <header className="h-16 border-b border-neutral-200 bg-white">
        <div className="h-full px-6 flex items-center justify-between">
          <Link href="/student" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary-700 grid place-items-center text-white font-bold">ط</div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-primary-800">{student.name_ar}</div>
              <div className="text-[10px] text-neutral-500">{(student.teacher as any)?.name_ar ?? ''}</div>
            </div>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/student" className="text-neutral-700 hover:text-primary-700">الرئيسية</Link>
            <Link href="/student/schedule" className="text-neutral-700 hover:text-primary-700">الجدول</Link>
            <Link href="/student/grades" className="text-neutral-700 hover:text-primary-700">الدرجات</Link>
            <Link href="/student/payments" className="text-neutral-700 hover:text-primary-700">المدفوعات</Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl p-6">{children}</main>
    </div>
  );
}
