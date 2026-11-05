import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { Noto_Kufi_Arabic, Plus_Jakarta_Sans } from 'next/font/google';
import { RegisterSW } from '@/components/shared/register-sw';
import './globals.css';

const notoKufi = Noto_Kufi_Arabic({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-noto-kufi',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta');
  return {
    title: { default: t('title'), template: `%s · ${t('brand')}` },
    description: t('description'),
    metadataBase: new URL(`https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'ostazna.com'}`),
    manifest: '/manifest.json',
    appleWebApp: { capable: true, title: t('brand'), statusBarStyle: 'default' },
  };
}

export const viewport: Viewport = {
  themeColor: '#1E3A5F',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={`${notoKufi.variable} ${jakarta.variable}`}>
      <body className={locale === 'ar' ? 'font-ar' : 'font-en'}>
        <NextIntlClientProvider messages={messages} locale={locale} timeZone="Africa/Cairo">
          {children}
          <RegisterSW />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
