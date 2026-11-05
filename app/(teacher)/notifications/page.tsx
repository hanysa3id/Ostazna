import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils/dates';

export const metadata = { title: 'الإشعارات' };
export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-900">الإشعارات</h1>
        <Link href="/notifications/new" className="text-sm px-4 py-2 rounded-card bg-primary-700 text-white">إرسال إشعار</Link>
      </div>

      {(items ?? []).length === 0 ? (
        <div className="p-10 text-center bg-white rounded-card border border-dashed border-neutral-300">
          <p className="text-neutral-600">لا توجد إشعارات بعد.</p>
        </div>
      ) : (
        <div className="bg-white rounded-card border border-neutral-200 divide-y divide-neutral-100">
          {(items ?? []).map(n => (
            <div key={n.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-medium text-neutral-900">{n.title}</h3>
                <span className="text-xs text-neutral-400">{formatDateTime(n.created_at)}</span>
              </div>
              <p className="mt-1 text-sm text-neutral-600 whitespace-pre-line">{n.body}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                <span className="px-2 py-0.5 rounded bg-neutral-100">{n.channel}</span>
                <span className="px-2 py-0.5 rounded bg-neutral-100">{n.target_type}</span>
                <span className="px-2 py-0.5 rounded bg-neutral-100">{n.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
