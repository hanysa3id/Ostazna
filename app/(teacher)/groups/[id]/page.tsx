import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatCurrencyEGP } from '@/lib/utils/numerals';
import { GroupForm } from '../group-form';
import { archiveGroupAction, addStudentToGroupAction, removeStudentFromGroupAction } from '../actions';

export const dynamic = 'force-dynamic';

const WD = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: group }, { data: ay }, { data: grades }, { data: subjects }, members, candidates] = await Promise.all([
    supabase.from('groups').select('*').eq('id', id).maybeSingle(),
    supabase.from('academic_years').select('id, name').eq('is_current', true).maybeSingle(),
    supabase.from('grades').select('id, name'),
    supabase.from('subjects').select('id, name_ar'),
    supabase
      .from('student_groups')
      .select('student:students(id, name_ar, parent_phone)')
      .eq('group_id', id)
      .is('left_at', null),
    supabase.from('students').select('id, name_ar').is('archived_at', null).order('name_ar'),
  ]);

  if (!group) notFound();

  const memberIds = new Set((members.data ?? []).map((r: any) => r.student?.id));
  const available = (candidates.data ?? []).filter(s => !memberIds.has(s.id));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">{group.name}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {group.pricing === 'monthly'
              ? `${formatCurrencyEGP(Number(group.price_monthly ?? 0))} / شهر`
              : `${formatCurrencyEGP(Number(group.price_per_session ?? 0))} / حصة`}
          </p>
        </div>
        <form action={archiveGroupAction}>
          <input type="hidden" name="id" value={group.id} />
          <button className="text-xs px-3 py-1.5 rounded-card border border-red-200 text-red-700 hover:bg-red-50">أرشفة</button>
        </form>
      </div>

      <section className="bg-white rounded-card border border-neutral-200 p-6">
        <h2 className="font-semibold mb-3">المواعيد الأسبوعية</h2>
        {(group.schedule?.slots ?? []).length === 0 ? (
          <p className="text-sm text-neutral-500">لم تُضف مواعيد بعد.</p>
        ) : (
          <ul className="text-sm divide-y divide-neutral-100">
            {(group.schedule?.slots ?? []).map((slot: any, i: number) => (
              <li key={i} className="py-2 flex items-center justify-between">
                <span>{WD[slot.weekday]} — {slot.time}</span>
                <span className="text-neutral-500">{slot.duration_minutes} دقيقة</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-white rounded-card border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">طلاب المجموعة ({(members.data ?? []).length})</h2>
        </div>

        {(members.data ?? []).length === 0 ? (
          <p className="text-sm text-neutral-500 mb-4">لا يوجد طلاب بعد في هذه المجموعة.</p>
        ) : (
          <ul className="divide-y divide-neutral-100 mb-4">
            {(members.data ?? []).map((row: any) => (
              <li key={row.student.id} className="py-2 flex items-center justify-between text-sm">
                <Link href={`/students/${row.student.id}`} className="text-primary-700 hover:underline">{row.student.name_ar}</Link>
                <form action={removeStudentFromGroupAction}>
                  <input type="hidden" name="group_id" value={group.id} />
                  <input type="hidden" name="student_id" value={row.student.id} />
                  <button className="text-xs text-red-600">إزالة</button>
                </form>
              </li>
            ))}
          </ul>
        )}

        {available.length > 0 && (
          <form action={addStudentToGroupAction} className="flex gap-2">
            <input type="hidden" name="group_id" value={group.id} />
            <select name="student_id" required className="flex-1 px-3 py-2 rounded-card border border-neutral-300 text-sm">
              <option value="">اختر طالباً لإضافته</option>
              {available.map(s => <option key={s.id} value={s.id}>{s.name_ar}</option>)}
            </select>
            <button className="text-sm px-4 rounded-card bg-primary-700 text-white">إضافة</button>
          </form>
        )}
      </section>

      <section className="bg-white rounded-card border border-neutral-200 p-6">
        <h2 className="font-semibold mb-3">تعديل البيانات</h2>
        <GroupForm
          academicYear={ay}
          grades={grades ?? []}
          subjects={subjects ?? []}
          initial={{
            id: group.id,
            name: group.name,
            grade_id: group.grade_id,
            subject_id: group.subject_id,
            pricing: group.pricing,
            price_monthly: group.price_monthly,
            price_per_session: group.price_per_session,
            schedule: group.schedule,
          }}
        />
      </section>
    </div>
  );
}
