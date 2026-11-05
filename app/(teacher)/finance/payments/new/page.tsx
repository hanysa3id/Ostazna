import { createClient } from '@/lib/supabase/server';
import { PaymentForm } from './form';

export const metadata = { title: 'تسجيل دفعة' };
export const dynamic = 'force-dynamic';

export default async function NewPaymentPage() {
  const supabase = await createClient();
  const { data: students } = await supabase
    .from('students')
    .select('id, name_ar')
    .is('archived_at', null)
    .order('name_ar');

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-primary-900 mb-6">تسجيل دفعة</h1>
      <div className="bg-white rounded-card border border-neutral-200 p-6">
        <PaymentForm students={students ?? []} />
      </div>
    </div>
  );
}
