'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { loginAction, type AuthState } from '@/lib/auth/actions';
import { GradientButton } from '@/components/ui/gradient-button';

const INITIAL: AuthState = {};

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const t = useTranslations('auth.login');
  const tErr = useTranslations('auth.errors');
  const [state, formAction, pending] = useActionState(loginAction, INITIAL);

  const errorKey = state.error ?? initialError;

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}

      <Field
        name="email" type="email" required autoComplete="email"
        label={t('email')} icon={Mail} placeholder="you@example.com"
      />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-primary-900">{t('password')}</label>
          <Link href="/forgot-password" className="text-xs text-violet-600 hover:underline">{t('forgot')}</Link>
        </div>
        <InputWithIcon
          id="password" name="password" type="password" required minLength={8} autoComplete="current-password"
          icon={Lock}
        />
      </div>

      {errorKey && (
        <p className="text-sm text-danger-600 bg-red-50 border border-red-100 rounded-card px-3 py-2.5">
          {tErr(errorKey as any)}
        </p>
      )}

      <GradientButton variant="aurora" className="w-full" disabled={pending} size="lg">
        {pending ? t('submitting') : t('submit')}
      </GradientButton>
    </form>
  );
}

function Field({
  name, type = 'text', required, autoComplete, label, icon: Icon, placeholder,
}: { name: string; type?: string; required?: boolean; autoComplete?: string; label: string; icon: any; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium text-primary-900">{label}</label>
      <InputWithIcon id={name} name={name} type={type} required={required} autoComplete={autoComplete} icon={Icon} placeholder={placeholder} />
    </div>
  );
}

function InputWithIcon({ icon: Icon, ...props }: any) {
  return (
    <div className="relative">
      <Icon className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-primary-400 pointer-events-none" />
      <input
        {...props}
        className="w-full ps-10 pe-3.5 py-3 rounded-card border border-primary-200 bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition placeholder-primary-300"
      />
    </div>
  );
}
