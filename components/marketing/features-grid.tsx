'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { LucideIcon, Users, GraduationCap, CalendarClock, Wallet, Globe, Bell, FileText, ShieldCheck, BarChart3 } from 'lucide-react';
import type { SiteFeature } from '@/lib/dal/site-cms';

const ICONS: Record<string, LucideIcon> = {
  Users, GraduationCap, CalendarClock, Wallet, Globe, Bell, FileText, ShieldCheck, BarChart3,
};

export function PrimaryFeaturesGrid({ features }: { features: SiteFeature[] }) {
  const t = useTranslations('marketing.features');
  const locale = useLocale();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="text-xs font-semibold text-violet-600 tracking-wider uppercase">{t('eyebrow')}</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-primary-900">{t('title')}</h2>
          <p className="mt-4 text-primary-700/80">{t('subtitle')}</p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const Icon = ICONS[f.icon] ?? Users;
            return (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={`/features/${f.slug}`}
                  className="card-lift group relative h-full p-6 rounded-2xl bg-white border border-primary-100 overflow-hidden block"
                >
                  <div className={`absolute -top-12 -end-12 w-32 h-32 rounded-full bg-gradient-to-br ${f.tone} opacity-10 group-hover:opacity-30 transition`} />
                  <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${f.tone} text-white grid place-items-center mb-4 shadow-soft`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-primary-900 text-lg">{f.title}</h3>
                  <p className="mt-2 text-sm text-primary-700/80 leading-relaxed">{f.short_body}</p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 opacity-0 group-hover:opacity-100 group-hover:gap-2 transition-all">
                    {t('learn_more')} <Arrow className="w-3 h-3" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function SecondaryFeaturesGrid({ features }: { features: SiteFeature[] }) {
  const t = useTranslations('marketing.features');

  return (
    <section className="py-24 bg-mesh-cool relative">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="text-xs font-semibold text-cyan-700 tracking-wider uppercase">{t('secondary_eyebrow')}</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-primary-900">{t('secondary_title')}</h2>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const Icon = ICONS[f.icon] ?? Users;
            return (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="h-full p-5 rounded-2xl bg-white/70 backdrop-blur border border-white/60 card-lift"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 grid place-items-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-primary-900">{f.title}</h4>
                <p className="mt-1.5 text-sm text-primary-700/80 leading-relaxed">{f.short_body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
