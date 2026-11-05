import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LoginForm } from './login-form';
import { GoogleButton } from '../google-button';

export async function generateMetadata() {
  const t = await getTranslations('auth.login');
  return { title: t('title') };
}

export default async function LoginPage({
  searchParams,
}: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const t = await getTranslations('auth.login');
  const { next, error } = await searchParams;

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-3xl font-bold text-primary-900">{t('title')}</h1>
      <p className="mt-2 text-primary-700/80 text-sm">{t('subtitle')}</p>

      <div className="mt-7">
        <GoogleButton label={t('with_google')} />
        <div className="my-6 flex items-center gap-3 text-xs text-primary-400">
          <div className="flex-1 h-px bg-primary-100" />
          <span>{t('or')}</span>
          <div className="flex-1 h-px bg-primary-100" />
        </div>

        <LoginForm next={next} initialError={error} />
      </div>

      <p className="mt-7 text-sm text-center text-primary-700">
        {t('no_account')}{' '}
        <Link href="/register" className="text-violet-600 font-medium hover:underline">
          {t('register_link')}
        </Link>
      </p>
    </div>
  );
}
