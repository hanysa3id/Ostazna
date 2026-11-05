// All datetime values are stored in UTC and rendered in Africa/Cairo.
// Date-only fields (payment_date, exam_date) use Cairo civil date semantics.

import { format, parseISO } from 'date-fns';
import { fromZonedTime, toZonedTime, format as formatTz } from 'date-fns-tz';
import { ar, enUS } from 'date-fns/locale';

export const TZ = 'Africa/Cairo';

export function formatDateTime(value: string | Date | null | undefined, locale: 'ar' | 'en' = 'ar', pattern = 'PPPp'): string {
  if (!value) return '—';
  try {
    const date = typeof value === 'string' ? parseISO(value) : value;
    if (isNaN(date.getTime())) return '—';
    return formatTz(toZonedTime(date, TZ), pattern, { timeZone: TZ, locale: locale === 'ar' ? ar : enUS });
  } catch {
    return '—';
  }
}

export function formatDate(value: string | Date | null | undefined, locale: 'ar' | 'en' = 'ar', pattern = 'PPP'): string {
  if (!value) return '—';
  try {
    const date = typeof value === 'string' ? parseISO(value) : value;
    if (isNaN(date.getTime())) return '—';
    return format(date, pattern, { locale: locale === 'ar' ? ar : enUS });
  } catch {
    return '—';
  }
}

export function cairoNow(): Date {
  return toZonedTime(new Date(), TZ);
}

// When user picks a date in Cairo civil time, convert to UTC for storage.
export function cairoLocalToUTC(localISO: string): Date {
  return fromZonedTime(localISO, TZ);
}
