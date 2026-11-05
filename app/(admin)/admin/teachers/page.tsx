import Link from 'next/link';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { Search, Users as UsersIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils/dates';

export const metadata = { title: 'المدرسون' };
export const dynamic = 'force-dynamic';

const STATUSES = [
  { key: 'all',      label: 'الكل',     tone: 'bg-primary-50  text-primary-700' },
  { key: 'trial',    label: 'تجريبي',  tone: 'bg-cyan-50     text-cyan-700' },
  { key: 'active',   label: 'نشط',     tone: 'bg-accent-500/10 text-accent-700' },
  { key: 'frozen',   label: 'مجمّد',   tone: 'bg-amber-50    text-amber-700' },
  { key: 'archived', label: 'مؤرشف',  tone: 'bg-neutral-100 text-neutral-700' },
];

export default async function AdminTeachersPage({
  searchParams,
}: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q, status } = await searchParams;
  const sb = createServiceRoleClient();

  let query = sb
    .from('teachers')
    .select('id, name_ar, email, phone, subdomain, current_status, created_at, current_plan_id')
    .order('created_at', { ascending: false });

  if (q && q.trim().length > 0) {
    query = query.or(`name_ar.ilike.%${q}%,email.ilike.%${q}%,subdomain.ilike.%${q}%`);
  }
  if (status && status !== 'all') {
    query = query.eq('current_status', status);
  }

  const { data: teachers } = await query.limit(200);

  // Counts per status (for tabs)
  const allCounts = await Promise.all(
    STATUSES.filter(s => s.key !== 'all').map(async s => {
      const { count } = await sb.from('teachers').select('id', { head: true, count: 'exact' }).eq('current_status', s.key);
      return [s.key, count ?? 0] as const;
    })
  );
  const counts = Object.fromEntries(allCounts);
  const totalCount = (Object.values(counts) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary-900 flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-violet-600" /> المدرسون
          </h1>
          <p className="mt-1 text-sm text-primary-700/80">{totalCount} مدرس مسجّل في المنصة</p>
        </div>
      </div>

      <form className="flex items-center gap-2" method="get">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-primary-400" />
          <input
            name="q" defaultValue={q ?? ''}
            placeholder="ابحث بالاسم، البريد، أو الـ Subdomain..."
            className="w-full ps-10 pe-3 py-2.5 rounded-card border border-primary-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none"
          />
        </div>
        {status && status !== 'all' && <input type="hidden" name="status" value={status} />}
        <button className="text-sm px-4 py-2.5 rounded-card bg-primary-700 text-white">بحث</button>
      </form>

      <div className="flex items-center gap-2 flex-wrap">
        {STATUSES.map(s => {
          const c = s.key === 'all' ? totalCount : (counts[s.key] ?? 0);
          const active = (status ?? 'all') === s.key;
          const params = new URLSearchParams();
          if (q) params.set('q', q);
          if (s.key !== 'all') params.set('status', s.key);
          const href = `/admin/teachers?${params.toString()}`;
          return (
            <Link key={s.key} href={href}
              className={`text-xs px-3 py-1.5 rounded-full ${active ? `${s.tone} font-semibold` : 'bg-white text-primary-600 border border-primary-100 hover:border-violet-200'}`}>
              {s.label} <span className="opacity-60">({c})</span>
            </Link>
          );
        })}
      </div>

      {(teachers ?? []).length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-primary-200">
          <p className="text-primary-600">لا توجد نتائج تطابق البحث.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-primary-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-primary-50/40 text-primary-700">
              <tr>
                <th className="text-start px-4 py-3 font-medium">المدرس</th>
                <th className="text-start px-4 py-3 font-medium">الـ Subdomain</th>
                <th className="text-start px-4 py-3 font-medium">الانضمام</th>
                <th className="text-start px-4 py-3 font-medium">الحالة</th>
                <th className="text-end   px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50">
              {(teachers ?? []).map(t => (
                <tr key={t.id} className="hover:bg-primary-50/30 transition">
                  <td className="px-4 py-3">
                    <div className="font-medium text-primary-900">{t.name_ar}</div>
                    <div className="text-xs text-primary-500">{t.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {t.subdomain ? (
                      <a href={`http://${t.subdomain}.ostazna.com`} target="_blank" rel="noopener" className="text-violet-600 hover:underline text-xs font-mono">
                        {t.subdomain}.ostazna.com
                      </a>
                    ) : <span className="text-primary-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-primary-600">{formatDate(t.created_at)}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.current_status} /></td>
                  <td className="px-4 py-3 text-end">
                    <Link href={`/admin/teachers/${t.id}`} className="text-violet-600 text-xs font-medium hover:underline">
                      إدارة ←
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active:   'bg-accent-500/10 text-accent-700 border-accent-500/30',
    trial:    'bg-cyan-50      text-cyan-700    border-cyan-200',
    frozen:   'bg-amber-50     text-amber-700   border-amber-200',
    archived: 'bg-neutral-100  text-neutral-700 border-neutral-200',
  };
  const labels: Record<string, string> = { active: 'نشط', trial: 'تجريبي', frozen: 'مجمّد', archived: 'مؤرشف' };
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${map[status] ?? ''}`}>{labels[status] ?? status}</span>;
}
