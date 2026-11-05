import Link from 'next/link';
import {
  LayoutDashboard, Users, Boxes, CalendarClock, ClipboardCheck, Wallet,
  Receipt, FileText, Globe, FileQuestion, BarChart3, Bell, Settings,
} from 'lucide-react';

const SECTIONS = [
  {
    title: 'الإدارة',
    items: [
      { href: '/dashboard',  icon: LayoutDashboard, label: 'لوحة التحكم' },
      { href: '/students',   icon: Users,           label: 'الطلاب' },
      { href: '/groups',     icon: Boxes,           label: 'المجموعات' },
      { href: '/schedule',   icon: CalendarClock,   label: 'الجدول' },
      { href: '/attendance', icon: ClipboardCheck,  label: 'الحضور' },
    ],
  },
  {
    title: 'المالية',
    items: [
      { href: '/finance/payments',  icon: Wallet,    label: 'المدفوعات' },
      { href: '/finance/expenses',  icon: Receipt,   label: 'المصروفات' },
      { href: '/finance/invoices',  icon: FileText,  label: 'الفواتير' },
    ],
  },
  {
    title: 'المزيد',
    items: [
      { href: '/exams',         icon: FileQuestion, label: 'الاختبارات' },
      { href: '/reports',       icon: BarChart3,    label: 'التقارير' },
      { href: '/cms',           icon: Globe,        label: 'موقعي' },
      { href: '/notifications', icon: Bell,         label: 'الإشعارات' },
      { href: '/settings',      icon: Settings,     label: 'الإعدادات' },
    ],
  },
];

export async function TeacherSidebar() {
  return (
    <aside className="hidden md:block w-64 shrink-0 border-e border-primary-100 bg-white/60 backdrop-blur-sm min-h-[calc(100dvh-4rem)] sticky top-16 self-start">
      <nav className="p-4 space-y-6">
        {SECTIONS.map(section => (
          <div key={section.title}>
            <h3 className="text-[10px] font-semibold text-primary-400 uppercase tracking-wider px-3 mb-2">{section.title}</h3>
            <div className="space-y-0.5">
              {section.items.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-primary-800 hover:bg-violet-50 hover:text-violet-700 transition-all"
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
  );
}
