import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { RegisterForm } from './register-form';
import { GoogleButton } from '../google-button';

export async function generateMetadata() {
  const t = await getTranslations('auth.register');
  return { title: t('title') };
}

export default async function RegisterPage() {
  const t = await getTranslations('auth.register');
  const tLogin = await getTranslations('auth.login');

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-3xl font-bold text-primary-900">{t('title')}</h1>
      <p className="mt-2 text-primary-700/80 text-sm">{t('subtitle')}</p>

      <div className="mt-7">
        <GoogleButton label={tLogin('with_google')} />
        <div className="my-6 flex items-center gap-3 text-xs text-primary-400">
          <div className="flex-1 h-px bg-primary-100" />
          <span>{tLogin('or')}</span>
          <div className="flex-1 h-px bg-primary-100" />
        </div>

        <RegisterForm />
      </div>

      <p className="mt-7 text-sm text-center text-primary-700">
        {t('have_account')}{' '}
        <Link href="/login" className="text-violet-600 font-medium hover:underline">
          {t('login_link')}
        </Link>
      </p>
    </div>
  );
}
