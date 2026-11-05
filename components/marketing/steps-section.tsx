'use client';

import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { GraduationCap, Users, TrendingUp, ArrowLeft, ArrowRight, type LucideIcon } from 'lucide-react';
import Link from 'next/link';

type Step = {
  n: number; key: 'step1' | 'step2' | 'step3';
  icon: LucideIcon; color: string; href: string;
};

const STEPS: Step[] = [
  { n: 1, key: 'step1', icon: GraduationCap, color: 'from-violet-500 to-primary-700', href: '/register' },
  { n: 2, key: 'step2', icon: Users,         color: 'from-cyan-500 to-primary-500',   href: '/features/students' },
  { n: 3, key: 'step3', icon: TrendingUp,    color: 'from-accent-500 to-cyan-500',    href: '/features/finance' },
];

export function StepsSection() {
  const t = useTranslations('marketing.steps');
  const locale = useLocale();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="text-xs font-semibold text-accent-600 tracking-wider uppercase">{t('eyebrow')}</span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-primary-900">{t('title')}</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          <svg className="hidden md:block absolute top-12 start-[16%] end-[16%] w-[68%] h-px -z-10" preserveAspectRatio="none">
            <defs>
              <linearGradient id="step-line" x1="0" x2="1">
                <stop offset="0%"   stopColor="#a78bfa" />
                <stop offset="50%"  stopColor="#67e8f9" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
            <line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="url(#step-line)" strokeWidth="2" strokeDasharray="6 6" />
          </svg>

          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="group relative"
            >
              <Link href={s.href} className="block text-center cursor-pointer">
                <motion.div
                  whileHover={{ scale: 1.08, rotate: -3 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                  className="relative inline-grid place-items-center w-28 h-28 mx-auto"
                >
                  <span className={`absolute inset-0 rounded-full bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-100 blur-xl transition duration-500`} />
                  <div className="relative w-24 h-24 rounded-full bg-white shadow-large border border-primary-100 grid place-items-center transition-all group-hover:shadow-glow group-hover:border-violet-200">
                    <s.icon className={`w-9 h-9 text-primary-700 group-hover:text-violet-700 transition-colors`} />

                    <motion.span
                      whileHover={{ scale: 1.15 }}
                      className={`absolute -top-1 -end-1 w-9 h-9 rounded-full bg-gradient-to-br ${s.color} text-white text-sm font-bold grid place-items-center shadow-glow`}
                    >
                      {s.n}
                    </motion.span>

                    <span className={`absolute inset-0 rounded-full bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-30 group-hover:animate-ping`} />
                  </div>
                </motion.div>

                <h3 className="mt-5 font-semibold text-primary-900 text-lg group-hover:text-violet-700 transition-colors">
                  {t(`${s.key}.title`)}
                </h3>
                <p className="mt-2 text-sm text-primary-700/80 leading-relaxed max-w-xs mx-auto">{t(`${s.key}.body`)}</p>

                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 opacity-70 group-hover:opacity-100 group-hover:gap-2.5 transition-all"
                >
                  {t(`${s.key}.cta`)}
                  <Arrow className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                </motion.span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
