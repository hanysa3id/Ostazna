import { createClient } from '@/lib/supabase/server';
import { getCurrentTeacher } from '@/lib/dal/teachers';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'طباعة الجدول' };

const WD = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];

export default async function PrintSchedulePage({
  searchParams,
}: { searchParams: Promise<{ week?: string }> }) {
  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  const { week } = await searchParams;
  const start = week ? new Date(week) : new Date();
  start.setHours(0, 0, 0, 0);
  const dow = start.getDay();
  start.setDate(start.getDate() - ((dow + 1) % 7));
  const end = new Date(start); end.setDate(end.getDate() + 7);

  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, scheduled_at, duration_minutes, group:groups(name)')
    .gte('scheduled_at', start.toISOString())
    .lt('scheduled_at', end.toISOString())
    .order('scheduled_at');

  const byDay: Record<number, any[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  for (const s of (sessions ?? [])) byDay[new Date(s.scheduled_at).getDay()].push(s);

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto print-page">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 1cm; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print mb-4 flex items-center justify-between">
        <a href="/schedule" className="text-sm text-primary-700">← رجوع للجدول</a>
        <button onClick={undefined as any} className="text-sm px-4 py-2 rounded-card bg-primary-700 text-white"
          // @ts-expect-error inline
          {...{ 'onClick': 'window.print()' }}>طباعة</button>
      </div>

      <div className="border-b-2 border-primary-700 pb-3 mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">جدول الحصص الأسبوعي</h1>
          <p className="text-sm text-neutral-600 mt-1">{teacher.name_ar}</p>
        </div>
        <p className="text-sm text-neutral-600">
          {start.toLocaleDateString('ar-EG')} — {new Date(end.getTime() - 86400000).toLocaleDateString('ar-EG')}
        </p>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {[6,0,1,2,3,4,5].map(d => {
              const day = new Date(start); day.setDate(day.getDate() + ((d + 1) % 7));
              return (
                <th key={d} className="border border-neutral-300 bg-primary-50 p-2 text-primary-900">
                  {WD[d]}
                  <div className="text-xs font-normal text-neutral-500 mt-1">{day.getDate()}/{day.getMonth() + 1}</div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          <tr>
            {[6,0,1,2,3,4,5].map(d => (
              <td key={d} className="border border-neutral-300 align-top p-2 min-h-32" style={{ minHeight: 120 }}>
                {byDay[d].length === 0 ? (
                  <span className="text-xs text-neutral-300">—</span>
                ) : (
                  <ul className="space-y-1.5">
                    {byDay[d].map((s: any) => (
                      <li key={s.id} className="text-xs">
                        <div className="font-semibold text-primary-800">{s.group?.name ?? 'حصة'}</div>
                        <div className="text-neutral-600">
                          {new Date(s.scheduled_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          {' · '}
                          {s.duration_minutes}د
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <p className="text-xs text-neutral-400 mt-6 text-center">طُبع بواسطة منصة أستاذنا · ostazna.com</p>
    </div>
  );
}
