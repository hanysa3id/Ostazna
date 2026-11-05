import { getCurrentTeacher } from '@/lib/dal/teachers';
import { saveCustomDomainAction } from './actions';

export const metadata = { title: 'الدومين المخصص' };
export const dynamic = 'force-dynamic';

export default async function CustomDomainPage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  return (
    <div className="max-w-xl space-y-5">
      <h1 className="text-2xl font-bold text-primary-900">الدومين المخصص</h1>

      <div className="bg-white rounded-card border border-neutral-200 p-6 space-y-4">
        <p className="text-sm text-neutral-700">
          يمكنك ربط دومينك الخاص (مثل <code>www.example.com</code>) بموقعك على المنصة.
        </p>

        <ol className="text-sm space-y-2 text-neutral-700 list-decimal ms-5">
          <li>أنشئ سجل CNAME في إعدادات الدومين عندك يشير إلى: <code className="font-mono bg-neutral-100 px-1.5 rounded">{teacher.subdomain ?? '<subdomain>'}.ostazna.com</code></li>
          <li>أضف الدومين هنا في الحقل بالأسفل.</li>
          <li>سيُصدر شهادة SSL تلقائياً خلال دقائق.</li>
        </ol>

        <form action={saveCustomDomainAction} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">دومينك</label>
            <input
              name="custom_domain"
              defaultValue={teacher.custom_domain ?? ''}
              placeholder="www.example.com"
              className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300 font-mono"
            />
          </div>
          <button className="px-4 py-2.5 rounded-card bg-primary-700 text-white">حفظ</button>
        </form>

        {teacher.custom_domain && (
          <div className="text-xs bg-amber-50 border border-amber-200 rounded-card px-3 py-2 text-amber-800">
            بعد الحفظ، انتظر دقائق ثم زر <a href={`https://${teacher.custom_domain}`} target="_blank" rel="noopener" className="underline">{teacher.custom_domain}</a> للتأكد.
          </div>
        )}
      </div>
    </div>
  );
}
