import { AddStudentForm } from './form';

export const metadata = { title: 'إضافة طالب' };

export default function AddStudentPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-primary-900 mb-2">إضافة طالب</h1>
      <p className="text-sm text-neutral-500 mb-6">املأ بيانات الطالب الأساسية. يمكنك إضافة المزيد لاحقاً.</p>
      <div className="bg-white rounded-card border border-neutral-200 p-6">
        <AddStudentForm />
      </div>
    </div>
  );
}
