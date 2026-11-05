'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Props = {
  factor: { id: string; status: string } | null;
  currentLevel: string | null;
};

export function TwoFactorPanel({ factor, currentLevel }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [enrollment, setEnrollment] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  function startEnroll() {
    setError(null);
    start(async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) { setError(error.message); return; }
      setEnrollment({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    });
  }

  function verify() {
    if (!enrollment) return;
    setError(null);
    start(async () => {
      const supabase = createClient();
      const { data: c, error: cErr } = await supabase.auth.mfa.challenge({ factorId: enrollment.id });
      if (cErr || !c) { setError(cErr?.message ?? 'فشل البدء.'); return; }
      const { error: vErr } = await supabase.auth.mfa.verify({
        factorId: enrollment.id, challengeId: c.id, code,
      });
      if (vErr) { setError(vErr.message); return; }
      setEnrollment(null); setCode('');
      router.refresh();
    });
  }

  function disable() {
    if (!factor) return;
    if (!confirm('سيتم إلغاء المصادقة الثنائية. متأكد؟')) return;
    start(async () => {
      const supabase = createClient();
      await supabase.auth.mfa.unenroll({ factorId: factor.id });
      router.refresh();
    });
  }

  if (factor && factor.status === 'verified') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-accent-700 bg-accent-500/10 border border-accent-500/30 rounded-card px-3 py-2">
          ✓ المصادقة الثنائية مفعّلة. مستوى الجلسة: <strong>{currentLevel}</strong>
        </p>
        <button onClick={disable} disabled={pending} className="text-xs text-red-600">إلغاء التفعيل</button>
      </div>
    );
  }

  if (enrollment) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-neutral-700">امسح الباركود بتطبيق المصادقة، ثم أدخل الكود المكوّن من 6 أرقام:</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={enrollment.qr} alt="QR" className="w-48 h-48 border border-neutral-200 rounded-card mx-auto" />
        <p className="text-xs text-neutral-500 text-center">أو أدخل المفتاح يدوياً: <code className="font-mono">{enrollment.secret}</code></p>
        <input
          value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000" inputMode="numeric"
          className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300 text-center font-mono text-lg tracking-widest"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button onClick={verify} disabled={pending || code.length !== 6}
            className="flex-1 px-4 py-2.5 rounded-card bg-accent-500 text-white disabled:opacity-60">تأكيد</button>
          <button onClick={() => setEnrollment(null)} disabled={pending}
            className="px-4 py-2.5 rounded-card border border-neutral-300">إلغاء</button>
        </div>
      </div>
    );
  }

  return (
    <button onClick={startEnroll} disabled={pending}
      className="px-4 py-2.5 rounded-card bg-primary-700 text-white text-sm disabled:opacity-60">
      {pending ? '...' : 'تفعيل المصادقة الثنائية'}
    </button>
  );
}
