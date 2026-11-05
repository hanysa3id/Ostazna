'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Users, GraduationCap, Activity, Headphones, type LucideIcon } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import type { SiteStat } from '@/lib/dal/site-cms';

const ICONS: Record<string, LucideIcon> = {
  live_teachers: Users,
  live_students: GraduationCap,
  live_uptime:   Activity,
  manual:        Headphones,
};

const ACCENT: Record<number, { ring: string; bar: string; chip: string; text: string }> = {
  0: { ring: 'ring-primary-200', bar: 'from-primary-500 to-violet-500',  chip: 'bg-violet-100 text-violet-700',  text: 'text-violet-700' },
  1: { ring: 'ring-cyan-200',    bar: 'from-cyan-500 to-primary-500',    chip: 'bg-cyan-100 text-cyan-700',      text: 'text-cyan-700' },
  2: { ring: 'ring-accent-200',  bar: 'from-accent-500 to-cyan-500',     chip: 'bg-accent-500/15 text-accent-700', text: 'text-accent-700' },
  3: { ring: 'ring-secondary-200', bar: 'from-secondary-500 to-accent-500', chip: 'bg-amber-100 text-amber-700', text: 'text-amber-700' },
};

export function StatsSection({ stats }: { stats: SiteStat[] }) {
  const t = useTranslations('marketing.stats');
  if (stats.length === 0) return null;

  return (
    <section className="relative py-16">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-100 text-cyan-700 text-xs font-medium border border-cyan-200">
            <Activity className="w-3.5 h-3.5" /> {t('badge')}
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-primary-900">
            {t('title')} <span className="text-gradient-cool">{t('title_highlight')}</span>
          </h2>
          <p className="mt-3 text-primary-700/80">{t('subtitle')}</p>
        </div>

        {/* Stat cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.slice(0, 4).map((s, i) => {
            const a = ACCENT[i] ?? ACCENT[0];
            const Icon = ICONS[s.source] ?? ICONS.manual;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="relative group p-6 rounded-3xl bg-white border border-primary-100 shadow-soft overflow-hidden card-lift"
              >
                {/* Top gradient bar */}
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${a.bar}`} />

                {/* Decorative big number watermark */}
                <span className="absolute -bottom-6 -end-2 text-[120px] font-black text-primary-50 leading-none select-none pointer-events-none">
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* Icon + chip */}
                <div className="relative flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.bar} text-white grid place-items-center shadow-glow`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {s.source !== 'manual' && (
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${a.chip} flex items-center gap-1`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {t('live')}
                    </span>
                  )}
                </div>

                {/* Number */}
                <div className="relative">
                  <div className="text-5xl font-bold text-primary-900 tabular-nums leading-none">
                    <AnimatedCounter to={s.value} suffix={s.suffix ?? ''} />
                  </div>
                  <div className="mt-3 text-sm text-primary-700 font-medium">{s.label}</div>
                </div>

                {/* Bottom progress hint */}
                <div className="relative mt-5 pt-4 border-t border-primary-50">
                  <div className="h-1.5 bg-primary-50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 + i * 0.1 }}
                      className={`h-full bg-gradient-to-r ${a.bar} rounded-full`}
                    />
                  </div>
                  <div className={`mt-2 text-[10px] ${a.text} font-semibold`}>
                    {s.source === 'live_teachers' && t('growth_teachers')}
                    {s.source === 'live_students' && t('growth_students')}
                    {s.source === 'live_uptime'   && t('uptime')}
                    {s.source === 'manual'        && t('support_response')}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 text-center"
        >
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white border border-primary-100 shadow-soft">
            <div className="flex -space-x-2">
              {['#7c3aed','#06b6d4','#10b981','#f59e0b','#1f5a8d'].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full ring-2 ring-white" style={{ backgroundColor: c }} />
              ))}
            </div>
            <span className="text-sm text-primary-800">
              {t('trust_prefix')} <strong className="text-violet-700">{t('trust_count')}</strong> {t('trust_suffix')}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
