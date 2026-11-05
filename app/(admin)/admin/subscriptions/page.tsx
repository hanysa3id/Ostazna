import Link from 'next/link';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { FileBadge, TrendingUp, Calendar } from 'lucide-react';
import { formatCurrencyEGP } from '@/lib/utils/numerals';
import { formatDate } from '@/lib/utils/dates';

export const metadata = { title: 'الاشتراكات' };
export const dynamic = 'force-dynamic';

const STATUSES = [
  { key: 'all',      label: 'الكل' },
  { key: 'active',   label: 'نشط' },
  { key: 'frozen',   label: 'مجمّد' },
  { key: 'archived', label: 'مؤرشف' },
];

export default async function AdminSubscriptionsPage({
  searchParams,
}: { searchParams: Promise<{ status?: string; from?: string; to?: string }> }) {
  const { status, from, to } = await searchParams;
  const sb = createServiceRoleClient();

  let q = sb
    .from('subscriptions')
    .select('id, starts_at, ends_at, status, amount_paid_egp, payment_method, created_at, teacher_id, teacher:teachers(name_ar, email)')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') q = q.eq('status', status);
  if (from) q = q.gte('starts_at', from);
  if (to)   q = q.lte('starts_at', to);

  const { data: subs } = await q.limit(200);

  const totalRevenue = (subs ?? []).reduce((s, r: any) => s + Number(r.amount_paid_egp ?? 0), 0);
  const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0,0,0,0);
  const thisMonthRev = (subs ?? [])
    .filter((s: any) => new Date(s.starts_at) >= thisMonth)
    .reduce((acc, r: any) => acc + Number(r.amount_paid_egp ?? 0), 0);

  const in14 = new Date(Date.now() + 14 * 86400_000).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  const { data: expiring } = await sb
    .from('subscriptions')
    .select('id, ends_at, teacher:teachers(name_ar, id)')
    .eq('status', 'active')
    .lte('ends_at', in14)
    .gte('ends_at', today)
    .order('ends_at')
    .limit(10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-900 flex items-center gap-2">
          <FileBadge className="w-6 h-6 text-violet-600" /> الاشتراكات
        </h1>
        <p className="mt-1 text-sm text-primary-700/80">{(subs ?? []).length} اشتراك في النتائج</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card icon={TrendingUp} label="إجمالي الإيراد المعروض" value={formatCurrencyEGP(totalRevenue)} tone="from-accent-500 to-cyan-500" />
        <Card icon={Calendar} label="إيراد هذا الشهر" value={formatCurrencyEGP(thisMonthRev)} tone="from-violet-500 to-primary-500" />
        <Card icon={FileBadge} label="على وشك الانتهاء (14 يوم)" value={String((expiring ?? []).length)} tone="from-amber-500 to-secondary-500" />
      </div>

      {(expiring ?? []).length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <h2 className="font-semibold text-amber-900 mb-3">⚠ على وشك الانتهاء — تواصل مع المدرس للتجديد</h2>
          <ul className="space-y-1 text-sm">
            {(expiring ?? []).map((e: any) => (
              <li key={e.id} className="flex items-center justify-between">
                <Link href={`/admin/teachers/${e.teacher?.id}`} className="text-primary-800 hover:text-violet-700">
                  {e.teacher?.name_ar}
                </Link>
                <span className="text-xs text-amber-700">ينتهي في {formatDate(e.ends_at)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <form className="bg-white rounded-2xl border border-primary-100 p-4 grid sm:grid-cols-4 gap-3" method="get">
        <select name="status" defaultValue={status ?? 'all'} className="px-3 py-2 rounded-card border border-primary-200 text-sm">
          {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <input name="from" type="date" defaultValue={from ?? ''} placeholder="من" className="px-3 py-2 rounded-card border border-primary-200 text-sm" />
        <input name="to" type="date" defaultValue={to ?? ''} placeholder="إلى" className="px-3 py-2 rounded-card border border-primary-200 text-sm" />
        <button className="px-4 py-2 rounded-card bg-primary-700 text-white text-sm">تطبيق</button>
      </form>

      <div className="bg-white rounded-2xl border border-primary-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary-50/40 text-primary-700">
            <tr>
              <th className="text-start px-4 py-3 font-medium">المدرس</th>
              <th className="text-start px-4 py-3 font-medium">من</th>
              <th className="text-start px-4 py-3 font-medium">إلى</th>
              <th className="text-end   px-4 py-3 font-medium">المبلغ</th>
              <th className="text-start px-4 py-3 font-medium">الطريقة</th>
              <th className="text-start px-4 py-3 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-50">
            {(subs ?? []).map((s: any) => (
              <tr key={s.id} className="hover:bg-primary-50/30 transition">
                <td className="px-4 py-3">
                  <Link href={`/admin/teachers/${s.teacher_id}`} className="text-violet-600 hover:underline font-medium">
                    {s.teacher?.name_ar ?? s.teacher?.email}
                  </Link>
                </td>
                <td className="px-4 py-3 text-primary-700">{formatDate(s.starts_at)}</td>
                <td className="px-4 py-3 text-primary-700">{formatDate(s.ends_at)}</td>
                <td className="px-4 py-3 text-end font-medium">{s.amount_paid_egp ? formatCurrencyEGP(s.amount_paid_egp) : '—'}</td>
                <td className="px-4 py-3 text-primary-600 text-xs">{s.payment_method ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    s.status === 'active' ? 'bg-accent-500/10 text-accent-700' :
                    s.status === 'frozen' ? 'bg-amber-50 text-amber-700' :
                                            'bg-neutral-100 text-neutral-700'
                  }`}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(subs ?? []).length === 0 && (
          <div className="p-10 text-center text-primary-500 text-sm">لا توجد نتائج.</div>
        )}
      </div>
    </div>
  );
}

function Card({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: string }) {
  return (
    <div className="p-5 bg-white rounded-2xl border border-primary-100">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tone} text-white grid place-items-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-xs text-primary-500">{label}</div>
      <div className="text-2xl font-bold text-primary-900 mt-1 tabular-nums">{value}</div>
    </div>
  );
}
