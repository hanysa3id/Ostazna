import Link from 'next/link';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { FileText, Filter } from 'lucide-react';

export const metadata = { title: 'سجل التدقيق' };
export const dynamic = 'force-dynamic';

const ACTION_TONES: Record<string, string> = {
  INSERT: 'bg-accent-500/10 text-accent-700',
  UPDATE: 'bg-cyan-50      text-cyan-700',
  DELETE: 'bg-red-50       text-red-700',
  IMPERSONATE_START: 'bg-amber-50 text-amber-700',
  IMPERSONATE_END:   'bg-neutral-100 text-neutral-700',
};

const ACTIONS = ['INSERT', 'UPDATE', 'DELETE', 'IMPERSONATE_START', 'IMPERSONATE_END'];
const ENTITIES = [
  'students', 'groups', 'sessions', 'attendance', 'payments',
  'subscriptions', 'teachers', 'invoices', 'expenses', 'exams', 'assistants',
];

export default async function AdminAuditLogsPage({
  searchParams,
}: { searchParams: Promise<{ action?: string; entity?: string; teacher?: string; from?: string }> }) {
  const { action, entity, teacher, from } = await searchParams;
  const sb = createServiceRoleClient();

  let q = sb
    .from('audit_logs')
    .select('id, created_at, action, entity_type, entity_id, actor_id, teacher_id, old_values, new_values')
    .order('created_at', { ascending: false });

  if (action && action !== 'all') q = q.eq('action', action);
  if (entity && entity !== 'all') q = q.eq('entity_type', entity);
  if (teacher) q = q.eq('teacher_id', teacher);
  if (from)   q = q.gte('created_at', from);

  const { data: logs } = await q.limit(200);

  const actorIds = Array.from(new Set((logs ?? []).map(l => l.actor_id).filter(Boolean))) as string[];
  const teacherIds = Array.from(new Set((logs ?? []).map(l => l.teacher_id).filter(Boolean))) as string[];

  const [usersRes, teachersRes] = await Promise.all([
    actorIds.length > 0 ? sb.auth.admin.listUsers() : Promise.resolve({ data: { users: [] } } as any),
    teacherIds.length > 0
      ? sb.from('teachers').select('id, name_ar').in('id', teacherIds)
      : Promise.resolve({ data: [] } as any),
  ]);

  const userMap = new Map<string, string>(
    ((usersRes?.data?.users ?? []) as any[]).map(u => [u.id, u.email ?? u.id.slice(0, 8)])
  );
  const teacherMap = new Map<string, string>(
    ((teachersRes?.data ?? []) as any[]).map(t => [t.id, t.name_ar])
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-primary-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-violet-600" /> سجل التدقيق
        </h1>
        <p className="mt-1 text-sm text-primary-700/80">آخر 200 عملية تطابق الفلاتر — لكل عملية تفاصيل JSON قابلة للنسخ.</p>
      </div>

      <form method="get" className="bg-white rounded-2xl border border-primary-100 p-4 grid sm:grid-cols-5 gap-3">
        <div>
          <label className="text-[10px] text-primary-500 block mb-1">العملية</label>
          <select name="action" defaultValue={action ?? 'all'} className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm">
            <option value="all">الكل</option>
            {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-primary-500 block mb-1">الكيان</label>
          <select name="entity" defaultValue={entity ?? 'all'} className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm">
            <option value="all">الكل</option>
            {ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-primary-500 block mb-1">معرّف المدرس</label>
          <input name="teacher" defaultValue={teacher ?? ''} placeholder="UUID" className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm font-mono text-xs" />
        </div>
        <div>
          <label className="text-[10px] text-primary-500 block mb-1">من تاريخ</label>
          <input name="from" type="date" defaultValue={from ?? ''} className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm" />
        </div>
        <div className="flex items-end">
          <button className="w-full px-4 py-2 rounded-card bg-primary-700 text-white text-sm inline-flex items-center justify-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> تطبيق
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-primary-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary-50/40 text-primary-700">
            <tr>
              <th className="text-start px-4 py-3 font-medium w-44">الوقت</th>
              <th className="text-start px-4 py-3 font-medium">العملية</th>
              <th className="text-start px-4 py-3 font-medium">الكيان</th>
              <th className="text-start px-4 py-3 font-medium">المنفذ</th>
              <th className="text-start px-4 py-3 font-medium">المدرس</th>
              <th className="text-end   px-4 py-3 font-medium">التفاصيل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-50">
            {(logs ?? []).map(l => (
              <tr key={l.id} className="hover:bg-primary-50/30 transition align-top">
                <td className="px-4 py-3 text-xs text-primary-600 font-mono">
                  {l.created_at ? new Date(l.created_at).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${ACTION_TONES[l.action] ?? 'bg-neutral-100 text-neutral-700'}`}>
                    {l.action}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <code className="text-xs bg-primary-50 px-1.5 py-0.5 rounded">{l.entity_type}</code>
                  {l.entity_id && <div className="text-[10px] text-primary-400 mt-0.5 font-mono">{l.entity_id.slice(0, 8)}</div>}
                </td>
                <td className="px-4 py-3 text-xs text-primary-600">{l.actor_id ? (userMap.get(l.actor_id) ?? l.actor_id.slice(0, 8)) : '—'}</td>
                <td className="px-4 py-3 text-xs">
                  {l.teacher_id ? (
                    <Link href={`/admin/teachers/${l.teacher_id}`} className="text-violet-600 hover:underline">
                      {teacherMap.get(l.teacher_id) ?? l.teacher_id.slice(0, 8)}
                    </Link>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-end">
                  {(l.old_values || l.new_values) && (
                    <details className="text-end">
                      <summary className="text-[10px] text-violet-600 cursor-pointer hover:underline">JSON</summary>
                      <pre className="text-[9px] text-start mt-2 p-2 bg-primary-50 rounded font-mono overflow-x-auto max-w-md">
                        {JSON.stringify({ old: l.old_values, new: l.new_values }, null, 2)}
                      </pre>
                    </details>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(logs ?? []).length === 0 && (
          <div className="p-10 text-center text-primary-500 text-sm">لا توجد سجلات.</div>
        )}
      </div>
    </div>
  );
}
