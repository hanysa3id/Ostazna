import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const SUPPORTED = ['ar', 'en'] as const;
export type Locale = (typeof SUPPORTED)[number];
export const DEFAULT_LOCALE: Locale = 'ar';

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (SUPPORTED as readonly string[]).includes(value);
}

async function resolveLocale(): Promise<Locale> {
  // Arabic is the platform default. Only switch when the user has explicitly
  // chosen another locale via the LocaleSwitcher (which sets NEXT_LOCALE cookie).
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  if (isLocale(cookieLocale)) return cookieLocale;
  return DEFAULT_LOCALE;
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  const messages = (await import(`./messages/${locale}.json`)).default;
  return { locale, messages, timeZone: 'Africa/Cairo' };
});
