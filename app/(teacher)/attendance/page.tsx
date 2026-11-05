import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentTeacher } from '@/lib/dal/teachers';

export const metadata = { title: 'الحضور' };
export const dynamic = 'force-dynamic';

export default async function AttendanceIndexPage({
  searchParams,
}: { searchParams: Promise<{ date?: string }> }) {
  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  const { date } = await searchParams;
  const day = date ? new Date(date) : new Date();
  day.setHours(0, 0, 0, 0);
  const next = new Date(day); next.setDate(next.getDate() + 1);

  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, scheduled_at, status, group:groups(name)')
    .gte('scheduled_at', day.toISOString())
    .lt('scheduled_at', next.toISOString())
    .order('scheduled_at');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-primary-900">تسجيل الحضور</h1>
        <input
          type="date"
          defaultValue={day.toISOString().slice(0, 10)}
          className="px-3 py-2 rounded-card border border-neutral-300 text-sm"
          onChange={undefined as any}
          name="date"
          form="date-form"
        />
        <form id="date-form" method="get" className="hidden" />
      </div>

      {(sessions ?? []).length === 0 ? (
        <div className="p-10 text-center bg-white rounded-card border border-dashed border-neutral-300">
          <p className="text-neutral-600">لا توجد حصص في هذا اليوم.</p>
        </div>
      ) : (
        <div className="bg-white rounded-card border border-neutral-200 divide-y divide-neutral-100">
          {(sessions ?? []).map((s: any) => (
            <Link key={s.id} href={`/attendance/${s.id}`} className="p-4 flex items-center justify-between hover:bg-neutral-50">
              <div>
                <p className="font-medium text-neutral-900">{s.group?.name ?? 'حصة'}</p>
                <p className="text-xs text-neutral-500">
                  {new Date(s.scheduled_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  {' · '}{s.status}
                </p>
              </div>
              <span className="text-primary-700 text-sm">تسجيل ←</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
