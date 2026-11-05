import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getCurrentTeacher, isTeacherOnboarded, backfillOnboardedAt } from '@/lib/dal/teachers';
import { listTodaySessions } from '@/lib/dal/sessions';
import { listOverdueStudents, monthRevenueEGP } from '@/lib/dal/payments';
import { listStudents } from '@/lib/dal/students';
import { StatCard } from '@/components/dashboard/stat-card';
import {
  Users, Wallet, CalendarClock, AlertTriangle, Activity, Sparkles, ArrowLeft,
  Plus, ClipboardCheck, MessageCircle,
} from 'lucide-react';
import { formatCurrencyEGP } from '@/lib/utils/numerals';
import { GradientButton } from '@/components/ui/gradient-button';

export const metadata = { title: 'لوحة التحكم' };
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const teacher = await getCurrentTeacher();
  if (!isTeacherOnboarded(teacher)) redirect('/onboarding');
  if (teacher && !teacher.onboarded_at) {
    void backfillOnboardedAt(teacher.id);
  }

  const t = await getTranslations('dashboard.cards');

  // Fetch each section independently — one failed query shouldn't break the whole page.
  async function safe<T>(p: Promise<T>, fallback: T, label: string): Promise<T> {
    try { return await p; }
    catch (err) { console.error(`[dashboard] ${label} failed:`, err); return fallback; }
  }

  const [students, sessions, revenue, overdue] = await Promise.all([
    safe(listStudents(),         [],  'listStudents'),
    safe(listTodaySessions(),    [],  'listTodaySessions'),
    safe(monthRevenueEGP(),      0,   'monthRevenueEGP'),
    safe(listOverdueStudents(),  [],  'listOverdueStudents'),
  ]);

  const isFresh = students.length === 0;
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'صباح الخير';
    if (h < 18) return 'مساء النور';
    return 'مساء الخير';
  })();

  return (
    <div className="space-y-7">
      {/* Hero greeting */}
      <section className="relative overflow-hidden rounded-3xl [background-image:var(--gradient-cool)] p-7 sm:p-9 text-white shadow-large">
        <div className="absolute inset-0 bg-dot-grid opacity-20" />
        <span className="blob bg-violet-400/40 w-64 h-64 -top-20 -end-20" />
        <span className="blob bg-cyan-400/30 w-48 h-48 -bottom-10 -start-10" />

        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-dark text-xs">
              <Sparkles className="w-3 h-3" />
              {new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold">
              {greeting}، <span className="text-white">{teacher.name_ar}</span>
            </h1>
            <p className="mt-2 text-white/75 text-sm">إليك نظرة سريعة على يومك ونشاط طلابك.</p>
          </div>

          <div className="flex items-center gap-2">
            <GradientButton href="/students/add" variant="glass" size="sm">
              <Plus className="w-4 h-4" /> طالب جديد
            </GradientButton>
            <GradientButton href="/finance/payments/new" variant="glass" size="sm">
              <Wallet className="w-4 h-4" /> دفعة
            </GradientButton>
          </div>
        </div>
      </section>

      {/* Onboarding nudge for fresh teachers */}
      {isFresh && (
        <section className="p-6 bg-gradient-to-bl from-violet-50 via-white to-cyan-50 border border-violet-100 rounded-2xl">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl [background-image:var(--gradient-aurora)] text-white grid place-items-center shrink-0 shadow-glow">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-primary-900">ابدأ بثلاث خطوات</h2>
              <p className="text-sm text-primary-700/80 mt-0.5">منصتك جاهزة، بقي إعداد بياناتك الأولى.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Step n={1} title="أضف طلابك" desc="يدوياً أو عبر CSV" href="/students/add" />
            <Step n={2} title="أنشئ مجموعة" desc="حدّد الجدول الأسبوعي" href="/groups/new" />
            <Step n={3} title="سجّل أول دفعة" desc="ابدأ تتبع الإيرادات" href="/finance/payments/new" />
          </div>
        </section>
      )}

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label={t('active_students')}  value={String(students.length)}        icon={Users}          tone="primary" />
        <StatCard label={t('month_revenue')}    value={formatCurrencyEGP(revenue)}     icon={Wallet}         tone="accent" />
        <StatCard label={t('today_sessions')}   value={String(sessions.length)}        icon={CalendarClock}  tone="cyan" />
        <StatCard label={t('overdue')}          value={String(overdue.length)}         icon={AlertTriangle}  tone="warn" />
        <StatCard label={t('attendance_rate')}  value="—"                              icon={Activity}       tone="muted" />
      </div>

      {/* Two-column data */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's sessions */}
        <section className="p-6 bg-white rounded-2xl border border-primary-100 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-primary-900 flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-cyan-600" /> حصص اليوم
            </h2>
            <Link href="/schedule" className="text-xs text-violet-600 hover:underline inline-flex items-center gap-1">
              عرض الجدول <ArrowLeft className="w-3 h-3" />
            </Link>
          </div>
          {sessions.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-primary-500">لا توجد حصص اليوم.</p>
              <Link href="/groups" className="mt-2 inline-block text-violet-600 text-xs">إعداد المجموعات →</Link>
            </div>
          ) : (
            <ul className="divide-y divide-primary-50">
              {sessions.map((s: any) => (
                <li key={s.id} className="py-3 flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-cyan-100 text-primary-700 grid place-items-center font-mono text-sm shrink-0">
                    {new Date(s.scheduled_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/attendance/${s.id}`} className="text-primary-900 font-medium hover:text-violet-700 block truncate">
                      {s.group?.name ?? s.title ?? 'حصة'}
                    </Link>
                    <div className="text-[11px] text-primary-500">
                      {new Date(s.scheduled_at).toLocaleDateString('ar-EG', { weekday: 'long' })}
                    </div>
                  </div>
                  <Link href={`/attendance/${s.id}`} className="opacity-0 group-hover:opacity-100 transition text-xs text-violet-600 inline-flex items-center gap-1">
                    <ClipboardCheck className="w-3.5 h-3.5" /> تسجيل
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Overdue */}
        <section className="p-6 bg-white rounded-2xl border border-primary-100 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-primary-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> المتأخرون
            </h2>
            <Link href="/finance/payments" className="text-xs text-violet-600 hover:underline">عرض الكل</Link>
          </div>
          {overdue.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-14 h-14 rounded-full bg-accent-500/10 text-accent-600 grid place-items-center mx-auto mb-3">
                ✓
              </div>
              <p className="text-sm text-primary-700 font-medium">لا يوجد متأخرون</p>
              <p className="text-xs text-primary-500 mt-1">عمل ممتاز!</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {overdue.slice(0, 5).map((s: any) => (
                <li key={s.student_id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 transition">
                  <Link href={`/students/${s.student_id}`} className="text-sm text-primary-900 font-medium truncate">{s.name_ar}</Link>
                  <span className="text-xs font-bold text-amber-700">{formatCurrencyEGP(Number(s.amount_due ?? 0))}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Step({ n, title, desc, href }: { n: number; title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="bg-white rounded-2xl border border-primary-100 p-4 hover:border-violet-300 hover:shadow-medium transition card-lift">
      <div className="flex items-center gap-2.5 mb-1.5">
        <span className="w-7 h-7 rounded-full [background-image:var(--gradient-aurora)] text-white text-xs grid place-items-center font-bold shadow-soft">{n}</span>
        <span className="font-medium text-primary-900">{title}</span>
      </div>
      <p className="text-xs text-primary-500 ms-9">{desc}</p>
    </Link>
  );
}
