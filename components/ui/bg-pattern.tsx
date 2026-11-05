// Decorative SVG patterns + animated blobs.

export function GridPattern({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`absolute inset-0 -z-10 h-full w-full stroke-primary-200/40 [mask-image:radial-gradient(60%_60%_at_50%_30%,white,transparent)] ${className}`}
    >
      <defs>
        <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M.5 48V.5H48" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

export function Blobs() {
  return (
    <>
      <span className="blob bg-primary-400/40 w-96 h-96 -top-24 -start-24 animate-float" />
      <span className="blob bg-violet-500/30 w-80 h-80 top-1/3 -end-32 animate-float" style={{ animationDelay: '1s' }} />
      <span className="blob bg-cyan-500/25 w-72 h-72 bottom-0 start-1/4 animate-float" style={{ animationDelay: '2s' }} />
    </>
  );
}

export function Sparkle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2l2.39 6.96L21 11.34l-6.61 2.39L12 21l-2.39-6.27L3 11.34l6.61-2.38z" />
    </svg>
  );
}
