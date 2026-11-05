export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-neutral-300 border-t-primary-700"
      style={{ width: size, height: size }}
      aria-label="Loading"
    />
  );
}

export function PageSpinner() {
  return (
    <div className="grid place-items-center py-20">
      <Spinner size={28} />
    </div>
  );
}
