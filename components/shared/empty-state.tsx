import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

export function EmptyState({
  icon: Icon,
  title,
  description,
  primary,
  secondary,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <div className="p-10 text-center bg-white rounded-card border border-dashed border-neutral-300">
      <div className="mx-auto w-14 h-14 rounded-full bg-primary-100 text-primary-700 grid place-items-center mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h2 className="font-semibold text-neutral-900">{title}</h2>
      {description && <p className="text-sm text-neutral-600 mt-1 max-w-md mx-auto">{description}</p>}
      {(primary || secondary) && (
        <div className="mt-5 flex items-center justify-center gap-2">
          {primary && (
            <Link href={primary.href} className="text-sm px-4 py-2 rounded-card bg-primary-700 text-white">
              {primary.label}
            </Link>
          )}
          {secondary && (
            <Link href={secondary.href} className="text-sm px-4 py-2 rounded-card border border-neutral-300">
              {secondary.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
