import { describe, expect, it } from 'vitest';
import { toArabicDigits, toWesternDigits, formatCurrencyEGP } from '../numerals';

describe('numerals', () => {
  it('converts Western to Arabic-Indic', () => {
    expect(toArabicDigits('1234567890')).toBe('١٢٣٤٥٦٧٨٩٠');
    expect(toArabicDigits(2026)).toBe('٢٠٢٦');
  });

  it('round-trips through Western', () => {
    expect(toWesternDigits('٠١٢٣٤٥٦٧٨٩')).toBe('0123456789');
  });

  it('formats EGP currency in Arabic locale', () => {
    const out = formatCurrencyEGP(1234.5, 'ar');
    expect(out).toMatch(/١٢٣٤|1,234|1234/); // engine-dependent grouping
    expect(out).toMatch(/ج\.م|EGP/);
  });
});
