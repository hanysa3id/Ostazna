import { createClient } from '@/lib/supabase/server';
import { addAssistantAction, removeAssistantAction, togglePermissionAction } from './actions';

export const metadata = { title: 'المساعدون' };
export const dynamic = 'force-dynamic';

const PERMISSIONS: { key: string; label: string }[] = [
  { key: 'attendance.write', label: 'تسجيل الحضور' },
  { key: 'payments.write', label: 'تسجيل المدفوعات' },
  { key: 'students.write', label: 'إضافة/تعديل الطلاب' },
  { key: 'notifications.send', label: 'إرسال إشعارات' },
  { key: 'reports.read', label: 'عرض التقارير' },
];

export default async function AssistantsPage() {
  const supabase = await createClient();
  const { data: assistants } = await supabase
    .from('assistants')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-2xl font-bold text-primary-900">المساعدون / السكرتارية</h1>
      <p className="text-sm text-neutral-600">
        أضف حسابات بصلاحيات محددة لمساعدتك في إدارة المنصة. الحساب يجب أن يسجّل أولاً عبر صفحة التسجيل العادية، ثم تربطه هنا ببريده.
      </p>

      <form action={addAssistantAction} className="bg-white rounded-card border border-neutral-200 p-4 grid sm:grid-cols-3 gap-2">
        <input name="name" required placeholder="الاسم" className="px-3 py-2 rounded-card border border-neutral-300" />
        <input name="email" type="email" required placeholder="البريد الإلكتروني" className="px-3 py-2 rounded-card border border-neutral-300" />
        <button className="px-4 py-2 rounded-card bg-primary-700 text-white text-sm">إضافة</button>
      </form>

      {(assistants ?? []).length === 0 ? (
        <p className="text-sm text-neutral-500">لم تُضف مساعدين بعد.</p>
      ) : (
        <ul className="space-y-3">
          {(assistants ?? []).map(a => (
            <li key={a.id} className="bg-white rounded-card border border-neutral-200 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-medium text-neutral-900">{a.name}</h3>
                  <p className="text-xs text-neutral-500">{a.email}</p>
                </div>
                <form action={removeAssistantAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className="text-xs text-red-600">إزالة</button>
                </form>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {PERMISSIONS.map(p => (
                  <form key={p.key} action={togglePermissionAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="key" value={p.key} />
                    <input
                      type="checkbox"
                      name="value"
                      defaultChecked={Boolean((a.permissions as any)?.[p.key])}
                      onChange={e => (e.currentTarget.form as HTMLFormElement).requestSubmit()}
                    />
                    <span>{p.label}</span>
                  </form>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
