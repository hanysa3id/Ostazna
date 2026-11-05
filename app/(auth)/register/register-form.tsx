'use client';

import { useActionState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { registerAction, type AuthState } from '@/lib/auth/actions';
import { GradientButton } from '@/components/ui/gradient-button';

const INITIAL: AuthState = {};

export function RegisterForm() {
  const t = useTranslations('auth.register');
  const tErr = useTranslations('auth.errors');
  const [state, formAction, pending] = useActionState(registerAction, INITIAL);

  return (
    <form action={formAction} className="space-y-4">
      <Field name="name" label={t('name')} icon={User} required minLength={2} />
      <Field name="email" type="email" label={t('email')} icon={Mail} required autoComplete="email" />
      <div>
        <Field name="password" type="password" label={t('password')} icon={Lock} required minLength={8} autoComplete="new-password" />
        <p className="mt-1.5 text-xs text-primary-500">{t('password_hint')}</p>
      </div>

      {state.error && (
        <p className="text-sm text-danger-600 bg-red-50 border border-red-100 rounded-card px-3 py-2.5">
          {tErr(state.error as any)}
        </p>
      )}

      <GradientButton variant="aurora" className="w-full" disabled={pending} size="lg">
        {pending ? t('submitting') : t('submit')}
      </GradientButton>

      <p className="text-xs text-primary-500 text-center">
        {t.rich('terms_agree', {
          terms: (chunks) => <a href="/terms" className="text-violet-600 hover:underline">{chunks}</a>,
          privacy: (chunks) => <a href="/privacy" className="text-violet-600 hover:underline">{chunks}</a>,
        })}
      </p>
    </form>
  );
}

function Field({
  name, label, type = 'text', icon: Icon, required, autoComplete, minLength,
}: { name: string; label: string; type?: string; icon: any; required?: boolean; autoComplete?: string; minLength?: number }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium text-primary-900">{label}</label>
      <div className="relative">
        <Icon className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-primary-400" />
        <input
          id={name} name={name} type={type} required={required} autoComplete={autoComplete} minLength={minLength}
          className="w-full ps-10 pe-3.5 py-3 rounded-card border border-primary-200 bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition placeholder-primary-300"
        />
      </div>
    </div>
  );
}
