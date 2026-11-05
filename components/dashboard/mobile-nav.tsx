'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import {
  LayoutDashboard, Users, Boxes, CalendarClock, ClipboardCheck, Wallet,
  Receipt, FileText, Globe, FileQuestion, BarChart3, Bell, Settings,
} from 'lucide-react';

const ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { href: '/students', icon: Users, label: 'الطلاب' },
  { href: '/groups', icon: Boxes, label: 'المجموعات' },
  { href: '/schedule', icon: CalendarClock, label: 'الجدول' },
  { href: '/attendance', icon: ClipboardCheck, label: 'الحضور' },
  { href: '/finance/payments', icon: Wallet, label: 'المدفوعات' },
  { href: '/finance/expenses', icon: Receipt, label: 'المصروفات' },
  { href: '/finance/invoices', icon: FileText, label: 'الفواتير' },
  { href: '/exams', icon: FileQuestion, label: 'الاختبارات' },
  { href: '/reports', icon: BarChart3, label: 'التقارير' },
  { href: '/cms', icon: Globe, label: 'موقعي' },
  { href: '/notifications', icon: Bell, label: 'الإشعارات' },
  { href: '/settings', icon: Settings, label: 'الإعدادات' },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 rounded-card hover:bg-neutral-100 text-neutral-700"
        aria-label="القائمة"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />
          <aside className="md:hidden fixed top-0 bottom-0 end-0 w-72 bg-white z-50 shadow-xl flex flex-col">
            <div className="h-16 px-4 border-b border-neutral-200 flex items-center justify-between">
              <span className="font-semibold text-primary-800">القائمة</span>
              <button onClick={() => setOpen(false)} className="p-2 rounded-card hover:bg-neutral-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
              {ITEMS.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-card text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-800"
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
