import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { GradientButton } from '@/components/ui/gradient-button';
import { Reveal } from '@/components/ui/reveal';
import { GridPattern, Blobs } from '@/components/ui/bg-pattern';
import { HeroCarousel } from '@/components/marketing/hero-carousel';
import { StatsSection } from '@/components/marketing/stats-section';
import { PrimaryFeaturesGrid, SecondaryFeaturesGrid } from '@/components/marketing/features-grid';
import { StepsSection } from '@/components/marketing/steps-section';
import { TestimonialsSection } from '@/components/marketing/testimonials-section';
import {
  getHeroSlides, getStats, getFeatures, getTestimonials, getFaqs,
} from '@/lib/dal/site-cms';

// Always render fresh so admin CMS edits show immediately on next request.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [locale, tFaq, tCta, slides, stats, primary, secondary, testimonials, faqs] = await Promise.all([
    getLocale(),
    getTranslations('marketing.faq'),
    getTranslations('marketing.cta_footer'),
    getHeroSlides(),
    getStats(),
    getFeatures({ primary: true }),
    getFeatures({ primary: false }),
    getTestimonials(),
    getFaqs(),
  ]);

  const ArrowForward = locale === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden pt-12 pb-20">
        <GridPattern />
        <Blobs />
        <div className="relative mx-auto max-w-7xl px-6">
          <HeroCarousel slides={slides} />
        </div>
      </section>

      {/* STATS */}
      <StatsSection stats={stats} />

      {/* PRIMARY FEATURES */}
      <PrimaryFeaturesGrid features={primary} />

      {/* SECONDARY FEATURES */}
      <SecondaryFeaturesGrid features={secondary} />

      {/* HOW IT WORKS */}
      <StepsSection />

      {/* TESTIMONIALS */}
      <TestimonialsSection testimonials={testimonials} />

      {/* FAQ */}
      <section id="faq" className="py-24">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal className="text-center mb-12">
            <span className="text-xs font-semibold text-violet-600 tracking-wider uppercase">{tFaq('eyebrow')}</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-primary-900">{tFaq('title')}</h2>
          </Reveal>

          <div className="space-y-3">
            {faqs.map((f, i) => (
              <Reveal key={f.id} delay={i * 0.05}>
                <details className="group rounded-2xl bg-white border border-primary-100 overflow-hidden hover:border-violet-200 transition">
                  <summary className="cursor-pointer p-5 flex items-center justify-between gap-4 select-none">
                    <span className="font-semibold text-primary-900">{f.question}</span>
                    <span className="w-8 h-8 rounded-full bg-primary-50 text-primary-700 grid place-items-center text-lg group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-5 pb-5 text-primary-700/80 leading-relaxed text-sm">{f.answer}</div>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="relative rounded-3xl overflow-hidden p-10 sm:p-16 text-center [background-image:var(--gradient-aurora)] shadow-large">
              <div className="absolute inset-0 bg-dot-grid opacity-20" />
              <span className="blob bg-cyan-300/40 w-72 h-72 -top-20 -start-20" />
              <span className="blob bg-violet-300/40 w-72 h-72 bottom-0 -end-20" />

              <div className="relative">
                <h2 className="text-3xl sm:text-5xl font-bold text-white">{tCta('title')}</h2>
                <p className="mt-4 text-white/80 max-w-lg mx-auto">{tCta('subtitle')}</p>
                <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
                  <GradientButton href="/register" variant="glass" size="lg">
                    {tCta('primary')}
                    <ArrowForward className="w-4 h-4" />
                  </GradientButton>
                  <a href="#features" className="text-white/80 text-sm hover:text-white px-4 py-2">{tCta('explore')}</a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
