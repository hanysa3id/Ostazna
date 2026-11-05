import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Sparkles, ShieldCheck, GraduationCap, BarChart3, CalendarClock, type LucideIcon } from 'lucide-react';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const tBrand = await getTranslations('brand');
  const t = await getTranslations('auth.hero_panel');

  const features: { icon: LucideIcon; t: string; d: string }[] = [
    { icon: GraduationCap, t: t('feature1_t'), d: t('feature1_d') },
    { icon: CalendarClock, t: t('feature2_t'), d: t('feature2_d') },
    { icon: BarChart3,     t: t('feature3_t'), d: t('feature3_d') },
    { icon: ShieldCheck,   t: t('feature4_t'), d: t('feature4_d') },
  ];

  return (
    <div className="min-h-dvh grid lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-10 bg-white">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 rounded-xl [background-image:var(--gradient-aurora)] grid place-items-center text-white font-bold shadow-glow">
              {tBrand('name').charAt(0)}
            </div>
            <span className="text-xl font-semibold text-primary-900">{tBrand('name')}</span>
          </Link>
          {children}
        </div>
      </div>

      <div className="hidden lg:block relative overflow-hidden [background-image:var(--gradient-cool)]">
        <div className="absolute inset-0 bg-dot-grid opacity-15" />
        <span className="blob bg-violet-400/40 w-96 h-96 -top-20 -start-20" />
        <span className="blob bg-cyan-400/40 w-80 h-80 bottom-10 -end-20 animate-float" />

        <div className="relative h-full flex flex-col justify-center p-12 text-white">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-dark text-xs w-max">
            <Sparkles className="w-3.5 h-3.5" /> {t('badge')}
          </span>
          <h2 className="mt-5 text-4xl font-bold leading-tight">
            {t('title_l1')}<br />{t('title_l2')}
          </h2>
          <p className="mt-4 text-white/80 leading-relaxed max-w-md">
            {t('subtitle')}
          </p>

          <ul className="mt-10 space-y-4 max-w-md">
            {features.map((it, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl glass-dark grid place-items-center shrink-0">
                  <it.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">{it.t}</div>
                  <div className="text-xs text-white/70 mt-0.5">{it.d}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
