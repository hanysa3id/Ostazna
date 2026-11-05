// Reusable form field primitives for the CMS editor pages.
// Server-component-friendly (no client hooks).

export function Field({
  name, label, type = 'text', defaultValue, required, placeholder, hint,
}: {
  name: string; label: string; type?: string; defaultValue?: string;
  required?: boolean; placeholder?: string; hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-primary-900 mb-1.5">{label}</label>
      <input
        id={name} name={name} type={type} defaultValue={defaultValue}
        required={required} placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-card border border-primary-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition"
      />
      {hint && <p className="mt-1 text-xs text-primary-500">{hint}</p>}
    </div>
  );
}

export function TextArea({
  name, label, defaultValue, rows = 3, placeholder, hint, mono,
}: {
  name: string; label: string; defaultValue?: string; rows?: number;
  placeholder?: string; hint?: string; mono?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-primary-900 mb-1.5">{label}</label>
      <textarea
        id={name} name={name} rows={rows} defaultValue={defaultValue} placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 rounded-card border border-primary-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition ${mono ? 'font-mono text-xs' : ''}`}
      />
      {hint && <p className="mt-1 text-xs text-primary-500">{hint}</p>}
    </div>
  );
}

export function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm text-primary-800">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="w-4 h-4 rounded border-primary-300 text-violet-600 focus:ring-violet-400" />
      {label}
    </label>
  );
}

export function Select({
  name, label, options, defaultValue, hint,
}: {
  name: string; label: string; options: { value: string; label: string }[];
  defaultValue?: string; hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-primary-900 mb-1.5">{label}</label>
      <select
        id={name} name={name} defaultValue={defaultValue}
        className="w-full px-3 py-2.5 rounded-card border border-primary-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {hint && <p className="mt-1 text-xs text-primary-500">{hint}</p>}
    </div>
  );
}
