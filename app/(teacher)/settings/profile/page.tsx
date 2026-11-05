import { getCurrentTeacher } from '@/lib/dal/teachers';
import { ProfileForm } from './form';

export const metadata = { title: 'الملف الشخصي' };
export const dynamic = 'force-dynamic';

export default async function ProfileSettingsPage() {
  const teacher = await getCurrentTeacher();
  if (!teacher) return null;

  return (
    <div className="max-w-xl space-y-5">
      <h1 className="text-2xl font-bold text-primary-900">الملف الشخصي</h1>
      <div className="bg-white rounded-card border border-neutral-200 p-6">
        <ProfileForm teacher={teacher} />
      </div>
    </div>
  );
}
