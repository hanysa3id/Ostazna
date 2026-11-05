'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

export function ForgotForm() {
  const t = useTranslations('auth.forgot');
  const tErr = useTranslations('auth.errors');
  const tCommon = useTranslations('common');
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') ?? '');

    start(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
      });
      if (error) setError(tErr('generic'));
      else setDone(true);
    });
  }

  if (done) {
    return (
      <p className="text-sm text-neutral-700 bg-accent-500/10 border border-accent-500/30 rounded-card px-4 py-3">
        {t('sent')}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">{t('email')}</label>
        <input
          id="email" name="email" type="email" required autoComplete="email"
          className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit" disabled={pending}
        className="w-full px-4 py-2.5 rounded-card bg-primary-700 text-white font-medium hover:bg-primary-800 disabled:opacity-60"
      >
        {pending ? tCommon('loading') : t('submit')}
      </button>
    </form>
  );
}
