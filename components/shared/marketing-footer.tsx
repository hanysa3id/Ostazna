import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Facebook, Youtube, Instagram, Twitter } from 'lucide-react';

export async function MarketingFooter() {
  const tBrand = await getTranslations('brand');
  const tNav = await getTranslations('nav');
  const tFooter = await getTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-20 border-t border-primary-100 bg-gradient-to-b from-white to-primary-50/40">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-6 py-14 grid gap-10 md:grid-cols-5 text-sm">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl [background-image:var(--gradient-aurora)] grid place-items-center text-white font-bold shadow-glow">
              {tBrand('name').charAt(0)}
            </div>
            <span className="text-lg font-semibold text-primary-900">{tBrand('name')}</span>
          </div>
          <p className="text-primary-700/80 leading-relaxed max-w-sm">
            {tFooter('about')}
          </p>
          <div className="mt-5 flex items-center gap-3">
            {[Facebook, Youtube, Instagram, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full bg-white border border-primary-100 grid place-items-center text-primary-600 hover:text-violet-600 hover:border-violet-200 transition" aria-label="social">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-primary-900 mb-3">{tFooter('platform')}</h4>
          <ul className="space-y-2 text-primary-700">
            <li><Link href="/" className="hover:text-violet-600 transition">{tNav('home')}</Link></li>
            <li><Link href="/pricing" className="hover:text-violet-600 transition">{tNav('pricing')}</Link></li>
            <li><Link href="/#features" className="hover:text-violet-600 transition">{tNav('features')}</Link></li>
            <li><Link href="/#faq" className="hover:text-violet-600 transition">{tNav('faq')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-primary-900 mb-3">{tFooter('legal')}</h4>
          <ul className="space-y-2 text-primary-700">
            <li><Link href="/privacy" className="hover:text-violet-600 transition">{tFooter('privacy')}</Link></li>
            <li><Link href="/terms" className="hover:text-violet-600 transition">{tFooter('terms')}</Link></li>
            <li><Link href="/refund-policy" className="hover:text-violet-600 transition">{tFooter('refund')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-primary-900 mb-3">{tFooter('contact')}</h4>
          <ul className="space-y-2 text-primary-700">
            <li>support@{tBrand('domain')}</li>
            <li className="text-primary-500 text-xs">{tFooter('support_24h')}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-100 py-5 text-center text-xs text-primary-500">
        © {year} {tBrand('name')}. {tFooter('rights')} {tFooter('made_with_love')} 🇪🇬
      </div>
    </footer>
  );
}
