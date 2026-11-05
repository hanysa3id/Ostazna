'use client';

import { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { Globe } from 'lucide-react';

export function LocaleSwitcher() {
  const current = useLocale();
  const [pending, start] = useTransition();

  function setLocale(next: 'ar' | 'en') {
    start(() => {
      // Persist for 1 year. SameSite=Lax for cross-page navigation.
      document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
      // Hard reload so server re-renders with the new locale immediately.
      window.location.reload();
    });
  }

  const next: 'ar' | 'en' = current === 'ar' ? 'en' : 'ar';
  const nextLabel = next === 'ar' ? 'العربية' : 'English';
  const currentLabel = current === 'ar' ? 'AR' : 'EN';

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      disabled={pending}
      title={`Switch to ${nextLabel}`}
      aria-label={`Switch to ${nextLabel}`}
      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-pill border border-primary-200 bg-white hover:bg-primary-50 hover:border-violet-300 text-primary-800 transition disabled:opacity-60"
    >
      <Globe className="w-3.5 h-3.5" />
      <span className="font-semibold tracking-wide">{currentLabel}</span>
    </button>
  );
}
