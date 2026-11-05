import Link from 'next/link';
import { listGroups } from '@/lib/dal/groups';
import { formatCurrencyEGP } from '@/lib/utils/numerals';

export const metadata = { title: 'المجموعات' };
export const dynamic = 'force-dynamic';

export default async function GroupsPage() {
  const groups = await listGroups();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-900">المجموعات</h1>
        <Link href="/groups/new" className="text-sm px-4 py-2 rounded-card bg-primary-700 text-white">
          مجموعة جديدة
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-card border border-dashed border-neutral-300">
          <p className="text-neutral-600">لا توجد مجموعات بعد.</p>
          <Link href="/groups/new" className="mt-3 inline-block text-primary-700 text-sm">أنشئ مجموعة →</Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((g: any) => (
            <Link key={g.id} href={`/groups/${g.id}`} className="p-5 bg-white rounded-card border border-neutral-200 hover:border-primary-300 hover:shadow-sm transition">
              <h3 className="font-semibold text-primary-900">{g.name}</h3>
              <p className="text-xs text-neutral-500 mt-1">
                {g.subject?.name_ar ?? '—'} · {g.grade?.name ?? '—'}
              </p>
              <p className="mt-3 text-sm">
                {g.pricing === 'monthly'
                  ? `${formatCurrencyEGP(Number(g.price_monthly ?? 0))} / شهر`
                  : `${formatCurrencyEGP(Number(g.price_per_session ?? 0))} / حصة`}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
