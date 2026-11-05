import { notFound } from 'next/navigation';
import { getStudent } from '@/lib/dal/students';
import { EditStudentForm } from './form';

export const metadata = { title: 'تعديل الطالب' };
export const dynamic = 'force-dynamic';

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let student;
  try { student = await getStudent(id); } catch { notFound(); }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-primary-900 mb-6">تعديل: {student.name_ar}</h1>
      <div className="bg-white rounded-card border border-neutral-200 p-6">
        <EditStudentForm student={student} />
      </div>
    </div>
  );
}
