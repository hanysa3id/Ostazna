import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/components/dashboard/logout-button';
import {
  LayoutDashboard, Users as UsersIcon, FileBadge, Layers, FileText,
  Settings as SettingsIcon, Sparkles, Image, BarChart3, MessageSquare,
  HelpCircle, FileEdit, Package, MessageCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const SECTIONS = [
  {
    title: 'الإدارة',
    items: [
      { href: '/admin/dashboard',     icon: LayoutDashboard, label: 'لوحة التحكم' },
      { href: '/admin/teachers',      icon: UsersIcon,       label: 'المدرسون' },
      { href: '/admin/subscriptions', icon: FileBadge,       label: 'الاشتراكات' },
      { href: '/admin/plans',         icon: Layers,          label: 'الخطط' },
      { href: '/admin/addons',        icon: Package,         label: 'الـ Add-ons' },
    ],
  },
  {
    title: 'إدارة المحتوى (CMS)',
    items: [
      { href: '/admin/cms',              icon: Sparkles,     label: 'نظرة عامة' },
      { href: '/admin/cms/hero',         icon: Image,        label: 'الـ Hero / Sliders' },
      { href: '/admin/cms/stats',        icon: BarChart3,    label: 'الإحصائيات' },
      { href: '/admin/cms/features',     icon: Layers,       label: 'المزايا' },
      { href: '/admin/cms/testimonials', icon: MessageSquare, label: 'آراء العملاء' },
      { href: '/admin/cms/faqs',         icon: HelpCircle,   label: 'الأسئلة الشائعة' },
      { href: '/admin/cms/pages',        icon: FileEdit,     label: 'صفحات مخصصة' },
    ],
  },
  {
    title: 'الرقابة والإعدادات',
    items: [
      { href: '/admin/audit-logs',        icon: FileText,     label: 'سجل التدقيق' },
      { href: '/admin/wa-log',            icon: MessageCircle, label: 'سجل الواتساب' },
      { href: '/admin/platform-settings', icon: SettingsIcon, label: 'إعدادات المنصة' },
    ],
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const isAdmin = (user.app_metadata as any)?.role === 'super_admin';
  if (!isAdmin) redirect('/dashboard');

  return (
    <div className="min-h-dvh bg-bg">
      <header className="h-16 backdrop-blur-md bg-white/80 border-b border-primary-100 sticky top-0 z-30">
        <div className="h-full px-6 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-700 to-primary-900 grid place-items-center text-white font-bold shadow-glow">A</div>
            <div>
              <span className="text-base font-semibold text-primary-900 block leading-tight">Super Admin</span>
              <span className="text-[10px] text-primary-500">إدارة المنصة</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-primary-700 hover:text-violet-600">عرض الموقع ↗</Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden md:block w-64 shrink-0 border-e border-primary-100 bg-white/60 backdrop-blur-sm min-h-[calc(100dvh-4rem)] sticky top-16 self-start">
          <nav className="p-4 space-y-6">
            {SECTIONS.map(section => (
              <div key={section.title}>
                <h3 className="text-[10px] font-semibold text-primary-400 uppercase tracking-wider px-3 mb-2">{section.title}</h3>
                <div className="space-y-0.5">
                  {section.items.map(({ href, icon: Icon, label }) => (
                    <Link
                      key={href} href={href}
                      className="group flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-primary-800 hover:bg-violet-50 hover:text-violet-700 transition-all"
                    >
                      <Icon className="w-4 h-4 text-primary-400 group-hover:text-violet-600 transition-colors" />
                      <span className="font-medium">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
