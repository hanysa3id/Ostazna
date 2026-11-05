'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Star, Quote } from 'lucide-react';
import type { SiteTestimonial } from '@/lib/dal/site-cms';

const BG_TONES = [
  'from-violet-50/70 to-violet-100/30',
  'from-cyan-50/70 to-cyan-100/30',
  'from-accent-50/70 to-accent-100/30',
  'from-primary-50/70 to-primary-100/30',
  'from-amber-50/70 to-amber-100/30',
  'from-rose-50/70 to-rose-100/30',
];

const RING_TONES = [
  'ring-violet-200',
  'ring-cyan-200',
  'ring-accent-200',
  'ring-primary-200',
  'ring-amber-200',
  'ring-rose-200',
];

export function TestimonialsSection({ testimonials }: { testimonials: SiteTestimonial[] }) {
  const tx = useTranslations('marketing.testimonials');
  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 relative overflow-hidden">
      <span className="blob bg-violet-300/30 w-96 h-96 -top-20 -start-20" />
      <span className="blob bg-cyan-300/30 w-80 h-80 bottom-0 -end-20" />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="text-xs font-semibold text-secondary-600 tracking-wider uppercase">{tx('eyebrow')}</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-primary-900">
            {tx('title_prefix')} <span className="text-gradient-cool">{tx('title_brand')}</span>
          </h2>
          <p className="mt-3 text-primary-700/80">{tx('subtitle')}</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 6).map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6 }}
              className="group relative"
            >
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${BG_TONES[i % BG_TONES.length]} backdrop-blur-sm`} />

              <div className="relative h-full p-7 rounded-3xl border border-white/60 backdrop-blur-md bg-white/40 shadow-soft transition group-hover:shadow-large">
                <Quote className="absolute top-5 end-5 w-8 h-8 text-primary-200 opacity-60" />

                <div className="flex items-center gap-1 text-secondary-500 mb-4">
                  {Array.from({ length: item.rating }).map((_, n) => (
                    <Star key={n} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <p className="text-primary-900 leading-relaxed text-[15px] min-h-24">
                  &ldquo;{item.body}&rdquo;
                </p>

                <div className="mt-6 flex items-center gap-3 pt-5 border-t border-white/60">
                  {item.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.avatar_url}
                      alt={item.name}
                      className={`w-12 h-12 rounded-full object-cover ring-2 ${RING_TONES[i % RING_TONES.length]} ring-offset-2 ring-offset-white/40`}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full [background-image:var(--gradient-aurora)] text-white font-bold grid place-items-center text-lg">
                      {item.name.trim()[0]}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-primary-900 text-sm">{item.name}</div>
                    {item.role && <div className="text-xs text-primary-600">{item.role}</div>}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
