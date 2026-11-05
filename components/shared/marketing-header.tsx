import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LocaleSwitcher } from './locale-switcher';
import { GradientButton } from '@/components/ui/gradient-button';
import { getPublishedPages } from '@/lib/dal/site-cms';

export async function MarketingHeader() {
  const t = await getTranslations('nav');
  const tBrand = await getTranslations('brand');
  const pages = await getPublishedPages();
  const navPages = pages.filter(p => p.show_in_nav).slice(0, 4);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b border-primary-100/60">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-10 h-10 rounded-xl [background-image:var(--gradient-aurora)] grid place-items-center text-white font-bold shadow-glow transition-transform group-hover:scale-105">
            <span>أ</span>
            <span className="absolute -inset-0.5 rounded-xl ring-2 ring-violet-400/30 animate-pulse-soft" />
          </div>
          <div className="leading-tight">
            <span className="text-lg font-semibold text-primary-900 block">{tBrand('name')}</span>
            <span className="text-[10px] text-primary-500 hidden sm:block">{tBrand('tagline')}</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          <Link href="/" className="text-primary-800 hover:text-violet-600 transition-colors">{t('home')}</Link>
          <Link href="/pricing" className="text-primary-800 hover:text-violet-600 transition-colors">{t('pricing')}</Link>
          <Link href="/#features" className="text-primary-800 hover:text-violet-600 transition-colors">{t('features')}</Link>
          <Link href="/#faq" className="text-primary-800 hover:text-violet-600 transition-colors">{t('faq')}</Link>
          {navPages.map(p => (
            <Link key={p.id} href={`/p/${p.slug}`} className="text-primary-800 hover:text-violet-600 transition-colors">
              {p.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <Link href="/login" className="text-sm text-primary-800 hover:text-violet-600 px-3 py-2">{t('login')}</Link>
          <GradientButton href="/register" variant="aurora" size="sm">
            {t('register')}
          </GradientButton>
        </div>
      </div>
    </header>
  );
}
