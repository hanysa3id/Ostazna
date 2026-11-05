import Link from 'next/link';
import { listStudents } from '@/lib/dal/students';
import { ExportStudentsButton } from './export-button';
import { StudentsTable } from './students-table';

export const metadata = { title: 'الطلاب' };
export const dynamic = 'force-dynamic';

export default async function StudentsPage({
  searchParams,
}: { searchParams: Promise<{ q?: string; archived?: string }> }) {
  const { q, archived } = await searchParams;
  const isArchived = archived === '1';
  const students = await listStudents({ search: q, archived: isArchived });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-primary-900">
          {isArchived ? 'الطلاب المؤرشفون' : 'الطلاب'} ({students.length})
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <ExportStudentsButton students={students as any[]} />
          <Link href="/students/import" className="text-sm px-4 py-2 rounded-card border border-neutral-300 hover:bg-neutral-50">استيراد CSV</Link>
          <Link href="/students/add" className="text-sm px-4 py-2 rounded-card bg-primary-700 text-white">إضافة طالب</Link>
        </div>
      </div>

      <form className="flex items-center gap-2" method="get">
        <input
          name="q" defaultValue={q ?? ''} placeholder="ابحث بالاسم..."
          className="flex-1 px-3.5 py-2.5 rounded-card border border-neutral-300"
        />
        {isArchived && <input type="hidden" name="archived" value="1" />}
        <button className="text-sm px-4 py-2 rounded-card border border-neutral-300">بحث</button>
      </form>

      <div className="flex items-center gap-3 text-xs">
        <Link href="/students" className={`px-2 py-1 rounded ${!isArchived ? 'bg-primary-100 text-primary-700' : 'text-neutral-600'}`}>النشطون</Link>
        <Link href="/students?archived=1" className={`px-2 py-1 rounded ${isArchived ? 'bg-primary-100 text-primary-700' : 'text-neutral-600'}`}>المؤرشفون</Link>
      </div>

      <StudentsTable students={students as any[]} archived={isArchived} />
    </div>
  );
}
