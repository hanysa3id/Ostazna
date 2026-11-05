// wa.me deep links — free, no API. Cap enforcement happens server-side in lib/quotas.ts.
// Egyptian phone normalization: strip leading 0, prefix 20 (+20).

export function normalizeEgyptPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('20')) return digits;        // already E.164 fragment
  if (digits.startsWith('0')) return '20' + digits.slice(1);
  if (digits.length === 10 && digits.startsWith('1')) return '20' + digits;
  return digits;
}

export function buildWaLink(phone: string, message: string): string | null {
  const normalized = normalizeEgyptPhone(phone);
  if (!normalized) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

// Default reminder template for late payments.
export function latePaymentMessage(opts: {
  studentName: string;
  amountEGP: number;
  monthLabel: string;
  teacherName: string;
}): string {
  return [
    `السلام عليكم،`,
    `${opts.studentName} عليه مستحق ${opts.amountEGP} جنيه عن شهر ${opts.monthLabel}.`,
    `يرجى التواصل لتسوية المبلغ. شكراً لكم.`,
    ``,
    `${opts.teacherName}`,
  ].join('\n');
}
