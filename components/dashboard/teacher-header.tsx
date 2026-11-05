import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { TeacherRow } from '@/lib/dal/teachers';
import { LocaleSwitcher } from '@/components/shared/locale-switcher';
import { LogoutButton } from './logout-button';
import { NotificationsBell } from './notifications-bell';
import { MobileNav } from './mobile-nav';
import { GlobalSearch } from './global-search';

export async function TeacherHeader({ teacher }: { teacher: TeacherRow }) {
  const initial = (teacher.name_ar || teacher.email)[0]?.toUpperCase();

  const supabase = await createClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('notifications')
    .select('id', { head: true, count: 'exact' })
    .gte('created_at', since);

  return (
    <header className="h-16 sticky top-0 z-30 backdrop-blur-md bg-white/75 border-b border-primary-100">
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-xl [background-image:var(--gradient-aurora)] grid place-items-center text-white font-bold shadow-glow group-hover:scale-105 transition-transform">
              أ
            </div>
            <span className="text-lg font-semibold text-primary-900 hidden sm:inline">أستاذنا</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <GlobalSearch />
          <LocaleSwitcher />
          <NotificationsBell teacherId={teacher.id} initialCount={count ?? 0} />
          <Link href="/settings/profile" className="flex items-center gap-2 text-sm hover:opacity-80 transition">
            {teacher.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={teacher.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-violet-200" />
            ) : (
              <div className="w-9 h-9 rounded-full [background-image:var(--gradient-aurora)] text-white grid place-items-center font-semibold shadow-soft">{initial}</div>
            )}
            <span className="hidden lg:inline text-primary-900 font-medium">{teacher.name_ar}</span>
          </Link>
          <LogoutButton />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
