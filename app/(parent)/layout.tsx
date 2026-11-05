import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/components/dashboard/logout-button';

export const dynamic = 'force-dynamic';

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: parent } = await supabase
    .from('parents')
    .select('id, name, consent_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!parent) {
    return (
      <div className="min-h-dvh grid place-items-center px-6 bg-bg">
        <div className="bg-white rounded-card border border-neutral-200 p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-primary-900">حساب ولي الأمر غير مفعّل</h1>
          <p className="text-sm text-neutral-600 mt-2">
            تواصل مع المدرس ليربط حسابك ببياناته.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg">
      <header className="h-16 border-b border-neutral-200 bg-white">
        <div className="h-full px-6 flex items-center justify-between">
          <Link href="/parent" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary-700 grid place-items-center text-white font-bold">و</div>
            <span className="font-semibold text-primary-800">بوابة ولي الأمر</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-neutral-600 hidden sm:inline">{parent.name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl p-6">{children}</main>
    </div>
  );
}
