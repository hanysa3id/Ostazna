import { createClient } from '@/lib/supabase/server';
import { getCurrentTeacher } from '@/lib/dal/teachers';
import { ThemeForm } from './form';

export const metadata = { title: 'الثيم' };
export const dynamic = 'force-dynamic';

export default async function ThemePage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) return null;
  const supabase = await createClient();
  let { data: settings } = await supabase
    .from('cms_settings')
    .select('*')
    .eq('teacher_id', teacher.id)
    .maybeSingle();

  if (!settings) {
    const { data: created } = await supabase
      .from('cms_settings')
      .insert({ teacher_id: teacher.id })
      .select()
      .single();
    settings = created;
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-2xl font-bold text-primary-900">الثيم والألوان</h1>
      <div className="bg-white rounded-card border border-neutral-200 p-6">
        <ThemeForm teacherId={teacher.id} settings={settings ?? {}} />
      </div>
    </div>
  );
}
