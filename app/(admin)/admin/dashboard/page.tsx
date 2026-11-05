import Link from 'next/link';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { AdminCharts } from './charts';
import { formatCurrencyEGP } from '@/lib/utils/numerals';
import {
  Users, UserCheck, Hourglass, Snowflake, Archive, TrendingUp, Sparkles,
  Image, BarChart3, Layers, MessageCircle, FileBadge, Activity, type LucideIcon,
} from 'lucide-react';

export const metadata = { title: 'Admin Dashboard' };
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const sb = createServiceRoleClient();

  const [
    { count: total }, { count: active }, { count: trial }, { count: frozen }, { count: archived },
    { count: studentsCount }, { count: waMonth }, { count: subscriptionsCount },
    { data: subs }, { data: teachers30 },
    { data: recentTeachers }, { data: recentSubs }, { data: recentLogs },
  ] = await Promise.all([
    sb.from('teachers').select('id', { head: true, count: 'exact' }),
    sb.from('teachers').select('id', { head: true, count: 'exact' }).eq('current_status', 'active'),
    sb.from('teachers').select('id', { head: true, count: 'exact' }).eq('current_status', 'trial'),
    sb.from('teachers').select('id', { head: true, count: 'exact' }).eq('current_status', 'frozen'),
    sb.from('teachers').select('id', { head: true, count: 'exact' }).eq('current_status', 'archived'),
    sb.from('students').select('id', { head: true, count: 'exact' }).is('archived_at', null),
    sb.from('wa_send_log').select('id', { head: true, count: 'exact' })
      .gte('sent_at', new Date(Date.now() - 30 * 86400_000).toISOString()),
    sb.from('subscriptions').select('id', { head: true, count: 'exact' }),
    sb.from('subscriptions').select('amount_paid_egp, starts_at, plan:plans(tier)')
      .gte('starts_at', new Date(Date.now() - 6 * 30 * 86400_000).toISOString().slice(0, 10))
      .order('starts_at'),
    sb.from('teachers').select('id, created_at')
      .gte('created_at', new Date(Date.now() - 6 * 30 * 86400_000).toISOString())
      .order('created_at'),
    sb.from('teachers').select('id, name_ar, email, created_at, current_status')
      .order('created_at', { ascending: false }).limit(5),
    sb.from('subscriptions').select('id, amount_paid_egp, created_at, teacher:teachers(name_ar, id)')
      .order('created_at', { ascending: false }).limit(5),
    sb.from('audit_logs').select('id, action, entity_type, created_at, teacher:teachers(name_ar, id)')
      .order('created_at', { ascending: false }).limit(8),
  ]);

  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i); d.setDate(1);
    months.push(d.toISOString().slice(0, 7));
  }
  const monthLabel = (m: string) => new Date(m + '-01').toLocaleDateString('ar-EG', { month: 'short' });

  const monthly = months.map(m => {
    const rev = (subs ?? []).filter((s: any) => (s.starts_at as string).startsWith(m))
      .reduce((acc, s: any) => acc + Number(s.amount_paid_egp ?? 0), 0);
    const signups = (teachers30 ?? []).filter((t: any) => (t.created_at as string).startsWith(m)).length;
    return { month: monthLabel(m), revenue: rev, signups };
  });

  const planCounts: Record<string, number> = {};
  for (const s of subs ?? []) {
    const tier = (s as any).plan?.tier ?? 'unknown';
    planCounts[tier] = (planCounts[tier] ?? 0) + 1;
  }
  const planDist = Object.entries(planCounts).map(([tier, count]) => ({ tier, count }));

  const totalRevenue6mo = monthly.reduce((s, m) => s + m.revenue, 0);
  const newThisMonth = (teachers30 ?? []).filter(t => (t.created_at as string).startsWith(months[5])).length;

  const cards: { label: string; value: string; tone: string; icon: LucideIcon }[] = [
    { label: 'إجمالي المدرسين', value: String(total ?? 0),                  tone: 'from-primary-500 to-violet-500', icon: Users },
    { label: 'نشط',             value: String(active ?? 0),                 tone: 'from-accent-500 to-cyan-500',    icon: UserCheck },
    { label: 'تجريبي',          value: String(trial ?? 0),                  tone: 'from-cyan-500 to-primary-500',   icon: Hourglass },
    { label: 'مجمّد',           value: String(frozen ?? 0),                 tone: 'from-amber-500 to-secondary-500', icon: Snowflake },
    { label: 'مؤرشف',           value: String(archived ?? 0),               tone: 'from-neutral-400 to-neutral-500', icon: Archive },
    { label: 'الطلاب النشطون',   value: String(studentsCount ?? 0),          tone: 'from-violet-500 to-cyan-500',    icon: Users },
    { label: 'إيرادات 6 شهور',   value: formatCurrencyEGP(totalRevenue6mo),  tone: 'from-accent-500 to-violet-500',  icon: TrendingUp },
    { label: 'رسائل WA الشهر',   value: String(waMonth ?? 0),                tone: 'from-secondary-500 to-accent-500', icon: MessageCircle },
  ];

  const quickActions = [
    { href: '/admin/cms/hero',         icon: Image,        label: 'تحرير الـ Hero',     tone: 'from-violet-500 to-primary-500' },
    { href: '/admin/cms/features',     icon: Layers,       label: 'تحرير المزايا',      tone: 'from-cyan-500 to-primary-500' },
    { href: '/admin/cms/testimonials', icon: MessageCircle, label: 'إدارة آراء العملاء', tone: 'from-accent-500 to-cyan-500' },
    { href: '/admin/teachers',         icon: Users,        label: 'إدارة المدرسين',     tone: 'from-violet-500 to-primary-700' },
    { href: '/admin/plans',            icon: Layers,       label: 'تعديل الخطط',         tone: 'from-secondary-500 to-violet-500' },
    { href: '/admin/audit-logs',       icon: Activity,     label: 'سجل التدقيق',         tone: 'from-amber-500 to-accent-500' },
  ];

  return (
    <div className="space-y-7">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl [background-image:var(--gradient-cool)] p-7 text-white shadow-large">
        <div className="absolute inset-0 bg-dot-grid opacity-20" />
        <span className="blob bg-violet-400/40 w-64 h-64 -top-20 -end-20" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-dark text-xs">
            <Sparkles className="w-3 h-3" />
            نظرة شاملة على المنصة
          </span>
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold">لوحة Super Admin</h1>
          <p className="mt-2 text-white/75 text-sm">{newThisMonth} مدرس جديد هذا الشهر · {subscriptionsCount} اشتراك مُسجّل</p>
        </div>
      </section>

      {/* STATS GRID */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {cards.map(c => (
          <div key={c.label} className="p-4 bg-white rounded-2xl border border-primary-100 card-lift overflow-hidden relative">
            <div className={`absolute -top-10 -end-10 w-24 h-24 rounded-full bg-gradient-to-br ${c.tone} opacity-10`} />
            <div className={`relative w-9 h-9 rounded-xl bg-gradient-to-br ${c.tone} text-white grid place-items-center mb-3`}>
              <c.icon className="w-4 h-4" />
            </div>
            <div className="text-xs text-primary-500">{c.label}</div>
            <div className="text-2xl font-bold text-primary-900 mt-1 tabular-nums">{c.value}</div>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <section>
        <h2 className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">إجراءات سريعة</h2>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {quickActions.map(a => (
            <Link key={a.href} href={a.href}
              className="group p-4 bg-white rounded-2xl border border-primary-100 hover:border-violet-200 hover:shadow-medium transition text-center">
              <div className={`mx-auto w-11 h-11 rounded-xl bg-gradient-to-br ${a.tone} text-white grid place-items-center mb-2 group-hover:scale-110 transition-transform`}>
                <a.icon className="w-5 h-5" />
              </div>
              <div className="text-xs font-medium text-primary-800">{a.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* CHARTS */}
      <AdminCharts monthly={monthly} planDist={planDist} />

      {/* RECENT ACTIVITY */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="bg-white rounded-2xl border border-primary-100 p-5">
          <h2 className="font-semibold text-primary-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-600" /> آخر المدرسين
          </h2>
          {(recentTeachers ?? []).length === 0 ? (
            <p className="text-sm text-primary-500">لا يوجد بعد.</p>
          ) : (
            <ul className="divide-y divide-primary-50 text-sm">
              {(recentTeachers ?? []).map(t => (
                <li key={t.id} className="py-2 flex items-center justify-between">
                  <Link href={`/admin/teachers/${t.id}`} className="text-primary-800 hover:text-violet-700">{t.name_ar}</Link>
                  <span className="text-xs text-primary-500">{t.current_status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-primary-100 p-5">
          <h2 className="font-semibold text-primary-900 mb-3 flex items-center gap-2">
            <FileBadge className="w-4 h-4 text-violet-600" /> آخر الاشتراكات
          </h2>
          {(recentSubs ?? []).length === 0 ? (
            <p className="text-sm text-primary-500">لا يوجد بعد.</p>
          ) : (
            <ul className="divide-y divide-primary-50 text-sm">
              {(recentSubs ?? []).map((s: any) => (
                <li key={s.id} className="py-2 flex items-center justify-between">
                  <Link href={`/admin/teachers/${s.teacher?.id}`} className="text-primary-800 hover:text-violet-700">
                    {s.teacher?.name_ar ?? '—'}
                  </Link>
                  <span className="text-xs font-medium text-accent-700">{s.amount_paid_egp ? formatCurrencyEGP(s.amount_paid_egp) : '—'}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-primary-100 p-5">
          <h2 className="font-semibold text-primary-900 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-600" /> آخر النشاطات
          </h2>
          {(recentLogs ?? []).length === 0 ? (
            <p className="text-sm text-primary-500">لا يوجد بعد.</p>
          ) : (
            <ul className="space-y-2 text-xs">
              {(recentLogs ?? []).map((l: any) => (
                <li key={l.id} className="flex items-center justify-between">
                  <span className="text-primary-700">
                    <code className="bg-primary-50 px-1.5 py-0.5 rounded text-[10px]">{l.action}</code>{' '}
                    {l.entity_type}
                  </span>
                  <span className="text-[10px] text-primary-400">
                    {new Date(l.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
