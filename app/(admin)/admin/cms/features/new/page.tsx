import Link from 'next/link';
import { FeatureForm } from '../feature-form';

export const metadata = { title: 'ميزة جديدة' };

export default function NewFeaturePage() {
  return (
    <div className="max-w-3xl space-y-5">
      <Link href="/admin/cms/features" className="text-sm text-primary-700 hover:text-violet-600">← العودة</Link>
      <h1 className="text-2xl font-bold text-primary-900">إضافة ميزة جديدة</h1>
      <FeatureForm />
    </div>
  );
}
