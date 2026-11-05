'use client';

import { useEffect } from 'react';

/**
 * Last-resort error boundary that wraps the entire app, including the root layout.
 * Renders its own <html> and <body> because at this level, the app's layout has failed.
 * Required by Next.js 15 to handle layout-level errors gracefully.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[global-error]', error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body style={{
        margin: 0, padding: 24, fontFamily: 'system-ui, sans-serif',
        background: '#f6f8fc', color: '#0a2238', minHeight: '100vh',
        display: 'grid', placeItems: 'center',
      }}>
        <div style={{
          maxWidth: 480, background: 'white', padding: 24, borderRadius: 16,
          border: '1px solid #fee', boxShadow: '0 4px 12px rgba(0,0,0,.06)', textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: '#fee',
            color: '#c00', display: 'grid', placeItems: 'center', margin: '0 auto 12px',
            fontSize: 24,
          }}>⚠</div>
          <h1 style={{ margin: 0, fontSize: 20, color: '#c00' }}>حدث خطأ غير متوقع</h1>
          <p style={{ marginTop: 12, color: '#555', fontSize: 14, lineHeight: 1.6 }}>
            {error?.message || 'يرجى إعادة المحاولة أو العودة للرئيسية.'}
          </p>
          {error?.digest && (
            <p style={{ marginTop: 8, fontSize: 11, color: '#999', fontFamily: 'monospace' }}>
              digest: {error.digest}
            </p>
          )}
          <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => reset()}
              style={{
                padding: '10px 20px', borderRadius: 12, background: '#18476f', color: 'white',
                border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500,
              }}
            >
              إعادة المحاولة
            </button>
            <a href="/" style={{
              padding: '10px 20px', borderRadius: 12, background: 'white', color: '#18476f',
              border: '1px solid #ccc', textDecoration: 'none', fontSize: 14,
            }}>الرئيسية</a>
          </div>
        </div>
      </body>
    </html>
  );
}
