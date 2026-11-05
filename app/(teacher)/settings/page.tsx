import Link from 'next/link';
import { getCurrentTeacher } from '@/lib/dal/teachers';
import { User, Users, Shield, Download, Globe } from 'lucide-react';

export const metadata = { title: 'الإعدادات' };
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  const cards = [
    { href: '/settings/profile',    icon: User,     title: 'الملف الشخصي', desc: 'الاسم، الصورة، الهاتف.' },
    { href: '/settings/security',   icon: Shield,   title: 'الأمان', desc: 'كلمة المرور والمصادقة الثنائية.' },
    { href: '/settings/assistants', icon: Users,    title: 'المساعدون', desc: 'حسابات السكرتارية بصلاحيات محددة.' },
    { href: '/settings/domain',     icon: Globe,    title: 'الدومين المخصص', desc: 'اربط دومينك الخاص بموقعك.' },
    { href: '/data-export',         icon: Download, title: 'تصدير البيانات', desc: 'تنزيل كل بياناتك.' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary-900">الإعدادات</h1>

      <section className="p-5 bg-white rounded-card border border-neutral-200">
        <h2 className="font-semibold mb-3">الحساب الحالي</h2>
        <dl className="text-sm grid sm:grid-cols-2 gap-2">
          <Row label="الاسم" value={teacher.name_ar} />
          <Row label="البريد" value={teacher.email} />
          <Row label="الـ Subdomain" value={teacher.subdomain ? `${teacher.subdomain}.ostazna.com` : '—'} />
          <Row label="حالة الاشتراك" value={teacher.current_status} />
        </dl>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(c => (
          <Link key={c.href} href={c.href} className="p-5 bg-white rounded-card border border-neutral-200 hover:border-primary-300 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 grid place-items-center shrink-0">
              <c.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">{c.title}</h3>
              <p className="text-sm text-neutral-600 mt-0.5">{c.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-neutral-800">{value}</dd>
    </div>
  );
}
