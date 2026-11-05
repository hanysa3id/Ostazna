import { getTranslations } from 'next-intl/server';
import { ForgotForm } from './forgot-form';

export async function generateMetadata() {
  const t = await getTranslations('auth.forgot');
  return { title: t('title') };
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations('auth.forgot');
  return (
    <>
      <h1 className="text-2xl font-bold text-primary-900 mb-2">{t('title')}</h1>
      <p className="text-sm text-neutral-500 mb-6">{t('subtitle')}</p>
      <ForgotForm />
    </>
  );
}
