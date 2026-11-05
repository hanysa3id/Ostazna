import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { FeatureForm } from '../feature-form';
import { deleteFeatureAction } from '../../actions';

export const metadata = { title: 'تعديل ميزة' };
export const dynamic = 'force-dynamic';

export default async function EditFeaturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = createServiceRoleClient();
  const { data: f } = await sb.from('site_features').select('*').eq('id', id).maybeSingle();
  if (!f) notFound();

  return (
    <div className="max-w-3xl space-y-5">
      <Link href="/admin/cms/features" className="text-sm text-primary-700 hover:text-violet-600">← العودة</Link>
      <h1 className="text-2xl font-bold text-primary-900">تعديل: {f.title}</h1>

      <FeatureForm initial={f} />

      <form action={deleteFeatureAction} className="text-end">
        <input type="hidden" name="id" value={f.id} />
        <button className="text-xs text-red-600">حذف الميزة</button>
      </form>
    </div>
  );
}
