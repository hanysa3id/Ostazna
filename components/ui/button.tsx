import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-card font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 disabled:opacity-60 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary-700 text-white hover:bg-primary-800',
        secondary: 'bg-secondary-500 text-primary-900 hover:bg-secondary-600',
        accent: 'bg-accent-500 text-white hover:bg-accent-600',
        outline: 'border border-neutral-300 text-neutral-800 hover:bg-neutral-50',
        ghost: 'text-neutral-700 hover:bg-neutral-100',
      },
      size: {
        sm: 'text-xs px-3 py-1.5',
        md: 'text-sm px-4 py-2.5',
        lg: 'text-base px-5 py-3',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = 'Button';
