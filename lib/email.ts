// Transactional email helper. Uses Resend if RESEND_API_KEY is set; otherwise no-op.
// Add RESEND_API_KEY and RESEND_FROM to .env.local to enable.

type SendArgs = { to: string; subject: string; html: string; from?: string };

export async function sendEmail({ to, subject, html, from }: SendArgs): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[email/no-op] would send "${subject}" → ${to}`);
    return { ok: true };
  }

  const sender = from ?? process.env.RESEND_FROM ?? 'Ostazna <hello@ostazna.com>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${key}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ from: sender, to, subject, html }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error('[email] resend failed:', body);
    return { ok: false, error: body };
  }
  return { ok: true };
}

export function welcomeEmailHtml(name: string): string {
  return `
    <div dir="rtl" style="font-family: 'Tahoma', sans-serif; line-height: 1.7; color: #1a1a2e; max-width: 560px; margin: 0 auto;">
      <div style="background: #1E3A5F; color: white; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">أهلاً ${name} في أستاذنا 👋</h1>
      </div>
      <div style="background: white; padding: 24px; border: 1px solid #eee; border-top: 0; border-radius: 0 0 12px 12px;">
        <p>أكرمنا الله بتسجيلك في منصة <strong>أستاذنا</strong>.</p>
        <p>الخطوات التالية:</p>
        <ol>
          <li>أكمل بياناتك الأساسية من شاشة الإعداد.</li>
          <li>أضف أول مجموعة وأول طالب.</li>
          <li>اضبط جدولك الأسبوعي ليتم توليد الحصص تلقائياً.</li>
        </ol>
        <p style="text-align: center; margin: 24px 0;">
          <a href="https://ostazna.com/dashboard" style="background: #1E3A5F; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">انتقل للوحة التحكم</a>
        </p>
        <p style="font-size: 12px; color: #888;">إذا لم تكن أنت من أنشأ هذا الحساب، تجاهل هذه الرسالة.</p>
      </div>
    </div>
  `;
}
