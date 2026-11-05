'use client';

import { motion } from 'framer-motion';
import { CalendarClock, Users, TrendingUp, GraduationCap, BookOpen, BarChart3 } from 'lucide-react';

/**
 * Hero illustration: floating glass-morphism cards on a gradient backdrop.
 * Supports a custom gradient or an image override via `imageUrl`.
 */
export function HeroIllustration({
  gradient = 'var(--gradient-aurora)',
  imageUrl,
}: { gradient?: string; imageUrl?: string }) {
  return (
    <div className="relative h-[420px] sm:h-[480px] w-full">
      {/* Gradient or image back-plate */}
      <div
        className="absolute inset-0 rounded-[2rem] shadow-glow overflow-hidden"
        style={{ backgroundImage: gradient }}
      >
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="w-full h-full object-cover opacity-90 mix-blend-overlay" />
        )}
      </div>

      <span className="blob bg-cyan-300/60 w-40 h-40 -top-6 start-10" />
      <span className="blob bg-violet-300/60 w-32 h-32 bottom-10 end-6" />

      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="absolute top-8 start-6 w-56 glass rounded-2xl p-4 shadow-large"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-accent-500/15 text-accent-600 grid place-items-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-xs text-primary-700 font-medium">إيرادات الشهر</span>
        </div>
        <div className="text-2xl font-bold text-primary-900">12,450 <span className="text-xs font-normal text-primary-500">ج</span></div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-[10px] text-accent-600 font-semibold">▲ 18%</span>
          <span className="text-[10px] text-primary-500">عن الشهر السابق</span>
        </div>
        <div className="mt-3 flex items-end gap-1 h-8">
          {[40, 60, 35, 75, 50, 90, 70].map((h, i) => (
            <motion.span
              key={i}
              initial={{ height: 0 }} animate={{ height: `${h}%` }}
              transition={{ delay: 0.6 + i * 0.05, duration: 0.5 }}
              className="flex-1 bg-gradient-to-t from-primary-500 to-violet-500 rounded-sm"
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
        className="absolute top-20 end-6 w-60 glass rounded-2xl p-4 shadow-large"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 grid place-items-center">
            <CalendarClock className="w-4 h-4" />
          </div>
          <span className="text-xs text-primary-700 font-medium">حصص اليوم</span>
        </div>
        <ul className="space-y-2 text-xs">
          {[
            { time: '٠٤:٠٠', name: 'الثانوية - رياضيات', tone: 'bg-cyan-500' },
            { time: '٠٦:٠٠', name: 'الإعدادي - فيزياء', tone: 'bg-violet-500' },
            { time: '٠٨:٣٠', name: 'مراجعة - كيمياء', tone: 'bg-accent-500' },
          ].map((s, i) => (
            <motion.li key={i}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-2"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${s.tone}`} />
              <span className="text-primary-500 font-mono w-12">{s.time}</span>
              <span className="text-primary-800 truncate">{s.name}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        className="absolute bottom-8 start-1/2 -translate-x-1/2 w-72 glass rounded-2xl p-4 shadow-large"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 grid place-items-center">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs text-primary-700 font-medium">الطلاب النشطون</span>
          </div>
          <span className="text-[10px] text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">+12 هذا الشهر</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-3xl font-bold text-primary-900">87</div>
          <div className="flex -space-x-2">
            {['#7c3aed','#06b6d4','#10b981','#f59e0b','#1f5a8d'].map((c, i) => (
              <div key={i} className="w-7 h-7 rounded-full ring-2 ring-white" style={{ backgroundColor: c }} />
            ))}
            <div className="w-7 h-7 rounded-full ring-2 ring-white bg-white text-[10px] grid place-items-center text-primary-700 font-semibold">+82</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute top-1/2 start-1/2 w-3 h-3"
        animate={{ rotate: 360 }}
        transition={{ duration: 24, ease: 'linear', repeat: Infinity }}
      >
        <span className="absolute -top-32 -start-1 w-10 h-10 rounded-full glass grid place-items-center text-primary-700">
          <GraduationCap className="w-5 h-5" />
        </span>
      </motion.div>
      <motion.div
        className="absolute top-1/2 start-1/2 w-3 h-3"
        animate={{ rotate: -360 }}
        transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
      >
        <span className="absolute -top-40 start-32 w-9 h-9 rounded-full glass grid place-items-center text-violet-600">
          <BookOpen className="w-4 h-4" />
        </span>
        <span className="absolute -bottom-24 -start-32 w-9 h-9 rounded-full glass grid place-items-center text-cyan-600">
          <BarChart3 className="w-4 h-4" />
        </span>
      </motion.div>
    </div>
  );
}
