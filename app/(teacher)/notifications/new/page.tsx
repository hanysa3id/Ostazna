import { createClient } from '@/lib/supabase/server';
import { NotificationForm } from './form';

export const metadata = { title: 'إرسال إشعار' };
export const dynamic = 'force-dynamic';

export default async function NewNotificationPage() {
  const supabase = await createClient();
  const [{ data: groups }, { data: students }] = await Promise.all([
    supabase.from('groups').select('id, name').is('archived_at', null).order('name'),
    supabase.from('students').select('id, name_ar, parent_phone').is('archived_at', null).order('name_ar'),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-primary-900 mb-6">إرسال إشعار</h1>
      <div className="bg-white rounded-card border border-neutral-200 p-6">
        <NotificationForm groups={groups ?? []} students={students ?? []} />
      </div>
    </div>
  );
}
