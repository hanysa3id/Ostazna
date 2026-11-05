import { createClient } from '@/lib/supabase/server';
import { InvoiceForm } from './form';

export const metadata = { title: 'إصدار فاتورة' };
export const dynamic = 'force-dynamic';

export default async function NewInvoicePage() {
  const supabase = await createClient();
  const { data: students } = await supabase
    .from('students')
    .select('id, name_ar')
    .is('archived_at', null)
    .order('name_ar');

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-primary-900 mb-6">إصدار فاتورة</h1>
      <div className="bg-white rounded-card border border-neutral-200 p-6">
        <InvoiceForm students={students ?? []} />
      </div>
    </div>
  );
}
