import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatDateTime } from '@/lib/utils/dates';

export const metadata = { title: 'الاختبارات' };
export const dynamic = 'force-dynamic';

const STATUS: Record<string, { label: string; cls: string }> = {
  draft: { label: 'مسودة', cls: 'bg-neutral-100 text-neutral-700' },
  published: { label: 'منشور', cls: 'bg-accent-500/10 text-accent-700' },
  closed: { label: 'مغلق', cls: 'bg-neutral-200 text-neutral-700' },
};

export default async function ExamsPage() {
  const supabase = await createClient();
  const { data: exams } = await supabase
    .from('exams')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-900">الاختبارات</h1>
        <Link href="/exams/new" className="text-sm px-4 py-2 rounded-card bg-primary-700 text-white">اختبار جديد</Link>
      </div>

      {(exams ?? []).length === 0 ? (
        <div className="p-10 text-center bg-white rounded-card border border-dashed border-neutral-300">
          <p className="text-neutral-600">لا توجد اختبارات بعد.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(exams ?? []).map(e => (
            <Link key={e.id} href={`/exams/${e.id}`} className="p-5 bg-white rounded-card border border-neutral-200 hover:border-primary-300">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-primary-900">{e.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded ${STATUS[e.status]?.cls ?? ''}`}>
                  {STATUS[e.status]?.label}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">{e.duration_minutes} دقيقة · {e.total_marks} درجة</p>
              {e.starts_at && <p className="text-xs text-neutral-500 mt-1">{formatDateTime(e.starts_at)}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
