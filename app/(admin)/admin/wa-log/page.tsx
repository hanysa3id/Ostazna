import Link from 'next/link';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { MessageCircle, TrendingUp } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/dates';

export const metadata = { title: 'سجل الواتساب' };
export const dynamic = 'force-dynamic';

export default async function WaLogPage({
  searchParams,
}: { searchParams: Promise<{ teacher?: string; from?: string }> }) {
  const { teacher, from } = await searchParams;
  const sb = createServiceRoleClient();

  let q = sb
    .from('wa_send_log')
    .select('id, recipient_phone, template, sent_at, teacher_id')
    .order('sent_at', { ascending: false });

  if (teacher) q = q.eq('teacher_id', teacher);
  if (from)   q = q.gte('sent_at', from);

  const { data: logs } = await q.limit(200);

  // Top senders this month
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const { data: thisMonth } = await sb
    .from('wa_send_log')
    .select('teacher_id')
    .gte('sent_at', monthStart.toISOString());

  const senderCounts = (thisMonth ?? []).reduce<Record<string, number>>((acc, r: any) => {
    acc[r.teacher_id] = (acc[r.teacher_id] ?? 0) + 1;
    return acc;
  }, {});
  const topIds = Object.entries(senderCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => e[0]);
  const { data: topTeachers } = topIds.length > 0
    ? await sb.from('teachers').select('id, name_ar').in('id', topIds)
    : { data: [] };
  const topTeacherMap = new Map((topTeachers ?? []).map((t: any) => [t.id, t.name_ar]));

  const totalThisMonth = (thisMonth ?? []).length;

  // Teacher names for the table
  const teacherIds = Array.from(new Set((logs ?? []).map(l => l.teacher_id))) as string[];
  const { data: teachers } = teacherIds.length > 0
    ? await sb.from('teachers').select('id, name_ar').in('id', teacherIds)
    : { data: [] };
  const teacherMap = new Map<string, string>(
    ((teachers ?? []) as any[]).map(t => [t.id, t.name_ar])
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-900 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-violet-600" /> سجل الواتساب
        </h1>
        <p className="mt-1 text-sm text-primary-700/80">كل ضغطة على زر تذكير واتساب يُسجّل هنا للرقابة وتطبيق سقوف الخطط.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="p-5 bg-white rounded-2xl border border-primary-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-cyan-500 text-white grid place-items-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-xs text-primary-500">إجمالي رسائل هذا الشهر</div>
          <div className="text-3xl font-bold text-primary-900 mt-1 tabular-nums">{totalThisMonth}</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-primary-100">
          <h3 className="font-semibold text-primary-900 mb-3 text-sm">أكثر المرسلين هذا الشهر</h3>
          {topIds.length === 0 ? (
            <p className="text-xs text-primary-500">لا يوجد بعد.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {topIds.map(id => (
                <li key={id} className="flex items-center justify-between">
                  <Link href={`/admin/teachers/${id}`} className="text-primary-800 hover:text-violet-700">
                    {topTeacherMap.get(id) ?? id.slice(0, 8)}
                  </Link>
                  <span className="font-mono text-xs text-violet-700">{senderCounts[id]} رسالة</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Filters */}
      <form method="get" className="bg-white rounded-2xl border border-primary-100 p-4 grid sm:grid-cols-3 gap-3">
        <input name="teacher" defaultValue={teacher ?? ''} placeholder="معرّف المدرس (UUID)" className="px-3 py-2 rounded-card border border-primary-200 text-sm font-mono text-xs" />
        <input name="from" type="date" defaultValue={from ?? ''} className="px-3 py-2 rounded-card border border-primary-200 text-sm" />
        <button className="px-4 py-2 rounded-card bg-primary-700 text-white text-sm">تطبيق</button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-primary-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary-50/40 text-primary-700">
            <tr>
              <th className="text-start px-4 py-3 font-medium">الوقت</th>
              <th className="text-start px-4 py-3 font-medium">المدرس</th>
              <th className="text-start px-4 py-3 font-medium">الرقم</th>
              <th className="text-start px-4 py-3 font-medium">القالب</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-50">
            {(logs ?? []).map(l => (
              <tr key={l.id} className="hover:bg-primary-50/30 transition">
                <td className="px-4 py-3 text-xs text-primary-600">{formatDateTime(l.sent_at)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/teachers/${l.teacher_id}`} className="text-violet-600 hover:underline text-xs">
                    {teacherMap.get(l.teacher_id) ?? l.teacher_id.slice(0, 8)}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{l.recipient_phone}</td>
                <td className="px-4 py-3 text-xs">
                  {l.template ? <code className="bg-primary-50 px-1.5 py-0.5 rounded">{l.template}</code> : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(logs ?? []).length === 0 && (
          <div className="p-10 text-center text-primary-500 text-sm">لا توجد رسائل بعد.</div>
        )}
      </div>
    </div>
  );
}
