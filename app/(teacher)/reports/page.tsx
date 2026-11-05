import { createClient } from '@/lib/supabase/server';
import { ReportsCharts } from './charts';
import { formatCurrencyEGP } from '@/lib/utils/numerals';

export const metadata = { title: 'التقارير' };
export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const supabase = await createClient();
  const since = new Date(); since.setMonth(since.getMonth() - 5); since.setDate(1);

  const [{ data: payments }, { data: expenses }, { data: attendance }] = await Promise.all([
    supabase.from('payments').select('amount, payment_date').gte('payment_date', since.toISOString().slice(0, 10)),
    supabase.from('expenses').select('amount, expense_date, category:expense_categories(name)').gte('expense_date', since.toISOString().slice(0, 10)),
    supabase.from('attendance').select('status, recorded_at').gte('recorded_at', since.toISOString()),
  ]);

  // Bucket by month
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i); d.setDate(1);
    months.push(d.toISOString().slice(0, 7));
  }
  const monthLabel = (m: string) => new Date(m + '-01').toLocaleDateString('ar-EG', { month: 'short' });

  const monthly = months.map(m => {
    const rev = (payments ?? []).filter((p: any) => p.payment_date.startsWith(m)).reduce((s, p: any) => s + Number(p.amount), 0);
    const exp = (expenses ?? []).filter((e: any) => e.expense_date.startsWith(m)).reduce((s, e: any) => s + Number(e.amount), 0);
    return { month: monthLabel(m), revenue: rev, expenses: exp, net: rev - exp };
  });

  // Expense breakdown
  const byCategory: Record<string, number> = {};
  for (const e of expenses ?? []) {
    const k = (e as any).category?.name ?? 'أخرى';
    byCategory[k] = (byCategory[k] ?? 0) + Number((e as any).amount);
  }
  const breakdown = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

  // Attendance
  const att = attendance ?? [];
  const present = att.filter((a: any) => a.status === 'present').length;
  const total = att.length || 1;
  const attendanceRate = Math.round((present / total) * 100);

  const totalRev = monthly.reduce((s, m) => s + m.revenue, 0);
  const totalExp = monthly.reduce((s, m) => s + m.expenses, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary-900">التقارير</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card label="إيرادات (6 أشهر)" value={formatCurrencyEGP(totalRev)} tone="accent" />
        <Card label="مصروفات (6 أشهر)" value={formatCurrencyEGP(totalExp)} tone="warn" />
        <Card label="معدل الحضور" value={`${attendanceRate}%`} tone="primary" />
      </div>

      <ReportsCharts monthly={monthly} breakdown={breakdown} />
    </div>
  );
}

function Card({ label, value, tone }: { label: string; value: string; tone: 'primary' | 'accent' | 'warn' }) {
  const cls = { primary: 'text-primary-700', accent: 'text-accent-600', warn: 'text-amber-700' }[tone];
  return (
    <div className="p-4 bg-white rounded-card border border-neutral-200">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${cls}`}>{value}</div>
    </div>
  );
}
