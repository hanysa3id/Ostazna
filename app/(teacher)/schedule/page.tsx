import { createClient } from '@/lib/supabase/server';
import { getCurrentTeacher } from '@/lib/dal/teachers';
import { regenerateSessionsAction } from './actions';

export const metadata = { title: 'الجدول' };
export const dynamic = 'force-dynamic';

const WD = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];

export default async function SchedulePage({
  searchParams,
}: { searchParams: Promise<{ week?: string }> }) {
  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  const { week } = await searchParams;
  const start = week ? new Date(week) : new Date();
  start.setHours(0, 0, 0, 0);
  // Anchor to Saturday (start of EG week)
  const dow = start.getDay();
  const offset = (dow + 1) % 7;
  start.setDate(start.getDate() - offset);
  const end = new Date(start); end.setDate(end.getDate() + 7);

  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, scheduled_at, duration_minutes, status, group:groups(name)')
    .gte('scheduled_at', start.toISOString())
    .lt('scheduled_at', end.toISOString())
    .order('scheduled_at');

  // Group by day
  const byDay: Record<number, any[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  for (const s of (sessions ?? [])) {
    const d = new Date(s.scheduled_at).getDay();
    byDay[d].push(s);
  }

  const prevWeek = new Date(start); prevWeek.setDate(prevWeek.getDate() - 7);
  const nextWeek = new Date(start); nextWeek.setDate(nextWeek.getDate() + 7);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-primary-900">الجدول الأسبوعي</h1>
        <div className="flex items-center gap-2">
          <a href={`/schedule/print${week ? `?week=${week}` : ''}`} target="_blank" rel="noopener"
            className="text-xs px-3 py-1.5 rounded-card border border-neutral-300 hover:bg-neutral-50">
            طباعة
          </a>
          <form action={regenerateSessionsAction}>
            <button className="text-xs px-3 py-1.5 rounded-card border border-neutral-300 hover:bg-neutral-50">
              توليد الحصص لـ 90 يوم
            </button>
          </form>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <a href={`/schedule?week=${prevWeek.toISOString().slice(0,10)}`} className="text-sm text-primary-700">← الأسبوع السابق</a>
        <span className="text-sm text-neutral-600">
          {start.toLocaleDateString('ar-EG')} — {new Date(end.getTime() - 86400000).toLocaleDateString('ar-EG')}
        </span>
        <a href={`/schedule?week=${nextWeek.toISOString().slice(0,10)}`} className="text-sm text-primary-700">الأسبوع التالي →</a>
      </div>

      <div className="grid gap-3 md:grid-cols-7">
        {[6,0,1,2,3,4,5].map(d => {
          const day = new Date(start); day.setDate(day.getDate() + ((d + 1) % 7));
          return (
            <div key={d} className="bg-white rounded-card border border-neutral-200 min-h-32">
              <div className="px-3 py-2 border-b border-neutral-100 text-sm font-medium text-neutral-700 flex items-center justify-between">
                <span>{WD[d]}</span>
                <span className="text-xs text-neutral-400">{day.getDate()}/{day.getMonth() + 1}</span>
              </div>
              <ul className="p-2 space-y-1">
                {byDay[d].length === 0 && <li className="text-xs text-neutral-400 px-1">—</li>}
                {byDay[d].map((s: any) => (
                  <li key={s.id} className="text-xs px-2 py-1.5 rounded bg-primary-50 text-primary-800">
                    <div className="font-medium">{s.group?.name ?? 'حصة'}</div>
                    <div className="text-[10px] text-primary-600">
                      {new Date(s.scheduled_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
