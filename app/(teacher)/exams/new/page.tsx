import { ExamForm } from './form';

export const metadata = { title: 'اختبار جديد' };

export default function NewExamPage() {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-primary-900 mb-6">اختبار جديد</h1>
      <div className="bg-white rounded-card border border-neutral-200 p-6">
        <ExamForm />
      </div>
    </div>
  );
}
