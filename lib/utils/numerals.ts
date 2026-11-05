// Arabic-Indic ↔ Western digit conversion.
// Used in print/CMS surfaces; admin UIs keep Western digits for filtering clarity.

const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];

export function toArabicDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, d => AR_DIGITS[Number(d)]);
}

export function toWesternDigits(input: string): string {
  return input.replace(/[٠-٩]/g, d => String(AR_DIGITS.indexOf(d)));
}

export function formatCurrencyEGP(amount: number, locale: 'ar' | 'en' = 'ar'): string {
  const fmt = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
    style: 'currency', currency: 'EGP', maximumFractionDigits: 2,
  });
  return fmt.format(amount);
}
