import { notFound } from 'next/navigation';
import { getStudent } from '@/lib/dal/students';
import { LinkAccountForm } from './form';

export const metadata = { title: 'ربط حساب الطالب' };
export const dynamic = 'force-dynamic';

export default async function LinkAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let student;
  try { student = await getStudent(id); } catch { notFound(); }

  return (
    <div className="max-w-xl space-y-5">
      <h1 className="text-2xl font-bold text-primary-900">ربط حساب الطالب</h1>
      <p className="text-sm text-neutral-700">
        لو سجّل الطالب <strong>{student.name_ar}</strong> حساباً على المنصة بنفسه، اربط حسابه ببياناته هنا.
        أدخل البريد الذي سجّل به ليتم الربط فوراً.
      </p>
      <div className="bg-white rounded-card border border-neutral-200 p-6">
        <LinkAccountForm studentId={student.id} currentLinked={!!student.user_id} />
      </div>
    </div>
  );
}
