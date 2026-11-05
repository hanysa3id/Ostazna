import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const TONES: Record<string, { iconBg: string; gradient: string }> = {
  primary: { iconBg: 'bg-primary-100 text-primary-700',  gradient: 'from-primary-500 to-violet-500' },
  accent:  { iconBg: 'bg-accent-500/15 text-accent-600', gradient: 'from-accent-500 to-cyan-500' },
  warn:    { iconBg: 'bg-amber-100 text-amber-700',      gradient: 'from-amber-400 to-secondary-500' },
  cyan:    { iconBg: 'bg-cyan-100 text-cyan-700',        gradient: 'from-cyan-500 to-primary-500' },
  muted:   { iconBg: 'bg-primary-50 text-primary-500',   gradient: 'from-primary-300 to-primary-400' },
};

export function StatCard({
  label, value, icon: Icon, tone = 'muted', trend,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: keyof typeof TONES;
  trend?: { value: string; positive?: boolean };
}) {
  const t = TONES[tone];
  return (
    <div className="group relative p-5 bg-white rounded-2xl border border-primary-100 shadow-soft card-lift overflow-hidden">
      <div className={cn('absolute -top-10 -end-10 w-28 h-28 rounded-full bg-gradient-to-br opacity-10 group-hover:opacity-25 transition', t.gradient)} />
      <div className={cn('relative w-11 h-11 rounded-xl grid place-items-center mb-4', t.iconBg)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-xs text-primary-500">{label}</div>
      <div className="text-2xl font-bold text-primary-900 mt-1">{value}</div>
      {trend && (
        <div className={cn('mt-1.5 text-[11px] font-semibold', trend.positive ? 'text-accent-600' : 'text-danger-600')}>
          {trend.positive ? '▲' : '▼'} {trend.value}
        </div>
      )}
    </div>
  );
}
