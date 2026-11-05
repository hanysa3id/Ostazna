import { describe, expect, it } from 'vitest';
import { normalizeEgyptPhone, buildWaLink } from '../wa';

describe('normalizeEgyptPhone', () => {
  it('strips leading 0 and prefixes 20', () => {
    expect(normalizeEgyptPhone('01012345678')).toBe('201012345678');
  });
  it('keeps existing 20 prefix', () => {
    expect(normalizeEgyptPhone('201012345678')).toBe('201012345678');
  });
  it('returns null for empty', () => {
    expect(normalizeEgyptPhone('')).toBeNull();
    expect(normalizeEgyptPhone('---')).toBeNull();
  });
});

describe('buildWaLink', () => {
  it('builds an encoded wa.me URL', () => {
    const url = buildWaLink('01012345678', 'مرحبا');
    expect(url).toContain('wa.me/201012345678');
    expect(url).toContain('text=');
  });
});
