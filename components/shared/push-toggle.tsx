'use client';

import { useEffect, useState, useTransition } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { savePushSubscription, removePushSubscription } from '@/app/(teacher)/settings/security/push-actions';

export function PushToggle({ teacherId, vapidPublicKey }: { teacherId: string; vapidPublicKey: string | null }) {
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ok = 'serviceWorker' in navigator && 'PushManager' in window && Notification.permission !== 'denied';
    setSupported(ok);
    if (ok) {
      navigator.serviceWorker.ready.then(reg => reg.pushManager.getSubscription())
        .then(sub => setEnabled(!!sub));
    }
  }, []);

  function urlBase64ToUint8Array(base64: string): Uint8Array {
    const padding = '='.repeat((4 - base64.length % 4) % 4);
    const b = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(b);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }

  async function enable() {
    setError(null);
    if (!vapidPublicKey) { setError('VAPID public key not configured.'); return; }
    start(async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          // Cast through ArrayBuffer for the BufferSource constraint.
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey).buffer as ArrayBuffer,
        });
        const json = sub.toJSON() as any;
        await savePushSubscription({
          endpoint: sub.endpoint,
          p256dh: json.keys?.p256dh ?? '',
          auth: json.keys?.auth ?? '',
          userAgent: navigator.userAgent,
        });
        setEnabled(true);
      } catch (err: any) { setError(err?.message ?? 'تعذر التفعيل.'); }
    });
  }

  async function disable() {
    start(async () => {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setEnabled(false);
    });
  }

  if (!supported) {
    return <p className="text-sm text-neutral-500">المتصفح لا يدعم الإشعارات أو تم رفضها.</p>;
  }

  return (
    <div className="space-y-2">
      <button
        onClick={enabled ? disable : enable}
        disabled={pending}
        className={`px-4 py-2.5 rounded-card text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60 ${
          enabled ? 'bg-neutral-100 text-neutral-700' : 'bg-primary-700 text-white'
        }`}
      >
        {enabled ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
        {pending ? '...' : enabled ? 'إيقاف الإشعارات' : 'تفعيل إشعارات الموبايل'}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
