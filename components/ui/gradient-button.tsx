'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'aurora' | 'outline' | 'glass';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary-700 text-white hover:bg-primary-800 shadow-soft',
  aurora:
    'text-white shadow-glow [background-image:var(--gradient-aurora)] hover:brightness-110',
  outline: 'border border-primary-200 text-primary-800 hover:bg-primary-50 bg-white',
  glass: 'glass text-primary-900 hover:bg-white/80',
};

type Props = {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

export function GradientButton({
  variant = 'primary',
  size = 'md',
  href,
  className,
  children,
  ...props
}: Props) {
  const sizeClass = size === 'sm' ? 'text-xs px-3 py-1.5' : size === 'lg' ? 'text-base px-6 py-3' : 'text-sm px-4 py-2.5';
  const cls = cn(
    'btn-shine inline-flex items-center justify-center gap-2 rounded-pill font-medium transition transform-gpu hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300',
    VARIANTS[variant],
    sizeClass,
    className,
  );

  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button className={cls} {...props}>{children}</button>;
}
