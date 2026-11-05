'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { HeroIllustration } from './hero-illustration';
import type { HeroSlide } from '@/lib/dal/site-cms';

const GRADIENT_MAP: Record<string, string> = {
  aurora: 'var(--gradient-aurora)',
  cool:   'var(--gradient-cool)',
};

export function HeroCarousel({
  slides,
  autoplayMs = 5500,
  showIndicators = true,
}: { slides: HeroSlide[]; autoplayMs?: number; showIndicators?: boolean }) {
  const t = useTranslations('marketing.hero');
  const tNav = useTranslations('nav');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const Forward = isAr ? ArrowLeft : ArrowRight;
  // In RTL the visual "previous" sits to the right; ChevronRight points right.
  const PrevIcon = isAr ? ChevronRight : ChevronLeft;
  const NextIcon = isAr ? ChevronLeft : ChevronRight;
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => setIdx(i => (i + 1) % Math.max(1, slides.length)), [slides.length]);
  const prev = useCallback(() => setIdx(i => (i - 1 + slides.length) % Math.max(1, slides.length)), [slides.length]);
  const go   = useCallback((n: number) => setIdx(n), []);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    timer.current = setInterval(next, autoplayMs);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [paused, autoplayMs, next, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-label="Hero carousel"
    >
      <div className="relative min-h-[560px] sm:min-h-[600px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[idx].id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="w-full grid lg:grid-cols-2 gap-10 items-center"
          >
            {/* Copy */}
            <div className="text-center lg:text-start">
              {slides[idx].badge && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-medium border border-violet-200">
                  <Sparkles className="w-3.5 h-3.5" />
                  {slides[idx].badge}
                </span>
              )}
              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-primary-900">
                {renderTitleWithHighlight(slides[idx].title, slides[idx].highlight)}
              </h1>
              {slides[idx].subtitle && (
                <p className="mt-6 text-lg text-primary-700/80 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {slides[idx].subtitle}
                </p>
              )}
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                {slides[idx].cta_label && slides[idx].cta_href && (
                  <GradientButton href={slides[idx].cta_href} variant="aurora" size="lg">
                    {slides[idx].cta_label}
                    <Forward className="w-4 h-4" />
                  </GradientButton>
                )}
                <GradientButton href="/pricing" variant="outline" size="lg">
                  {tNav('pricing')}
                </GradientButton>
              </div>

              <div className="mt-7 flex items-center justify-center lg:justify-start gap-5 text-xs text-primary-600 flex-wrap">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent-500" /> {t('trust_no_cc')}</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent-500" /> {t('trust_quick')}</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent-500" /> {t('trust_support')}</span>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <HeroIllustration
                gradient={GRADIENT_MAP[slides[idx].bg_gradient] ?? 'var(--gradient-aurora)'}
                imageUrl={slides[idx].image_url ?? undefined}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label={t('prev')}
            className="hidden md:grid place-items-center absolute top-1/2 -translate-y-1/2 -start-2 w-10 h-10 rounded-full glass shadow-medium hover:scale-110 transition text-primary-700 z-10"
          >
            <PrevIcon className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            aria-label={t('next')}
            className="hidden md:grid place-items-center absolute top-1/2 -translate-y-1/2 -end-2 w-10 h-10 rounded-full glass shadow-medium hover:scale-110 transition text-primary-700 z-10"
          >
            <NextIcon className="w-5 h-5" />
          </button>

          {showIndicators && (
            <div className="absolute bottom-2 start-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => go(i)}
                  aria-label={t('slide', { n: i + 1 })}
                  className={`h-1.5 rounded-full transition-all ${
                    i === idx
                      ? 'w-10 [background-image:var(--gradient-aurora)]'
                      : 'w-2.5 bg-primary-200 hover:bg-primary-300'
                  }`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function renderTitleWithHighlight(title: string, highlight: string | null) {
  if (!highlight) return title;
  const parts = title.split(highlight);
  if (parts.length < 2) return title;
  return (
    <>
      {parts[0]}
      <span className="text-gradient-cool">{highlight}</span>
      {parts.slice(1).join(highlight)}
    </>
  );
}
