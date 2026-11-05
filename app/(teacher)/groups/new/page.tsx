import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { GroupForm } from '../group-form';

export const metadata = { title: 'مجموعة جديدة' };
export const dynamic = 'force-dynamic';

export default async function NewGroupPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: ay }, { data: grades }, { data: subjects }] = await Promise.all([
    supabase.from('academic_years').select('id, name').eq('is_current', true).maybeSingle(),
    supabase.from('grades').select('id, name'),
    supabase.from('subjects').select('id, name_ar'),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-primary-900 mb-2">مجموعة جديدة</h1>
      <p className="text-sm text-neutral-500 mb-6">أنشئ مجموعة وحدد جدولها وتسعيرها.</p>
      <div className="bg-white rounded-card border border-neutral-200 p-6">
        <GroupForm
          academicYear={ay}
          grades={grades ?? []}
          subjects={subjects ?? []}
        />
      </div>
    </div>
  );
}
