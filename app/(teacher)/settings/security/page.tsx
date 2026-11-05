import { createClient } from '@/lib/supabase/server';
import { getCurrentTeacher } from '@/lib/dal/teachers';
import { TwoFactorPanel } from './two-factor';
import { PushToggle } from '@/components/shared/push-toggle';

export const metadata = { title: 'الأمان' };
export const dynamic = 'force-dynamic';

export default async function SecurityPage() {
  const teacher = await getCurrentTeacher();
  const supabase = await createClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const totp = factors?.totp?.[0] ?? null;
  const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-primary-900">الأمان</h1>

      <section className="bg-white rounded-card border border-neutral-200 p-6">
        <h2 className="font-semibold mb-2">المصادقة الثنائية (2FA)</h2>
        <p className="text-sm text-neutral-600 mb-4">
          أضف طبقة حماية إضافية باستخدام تطبيق مصادقة (Google Authenticator / Authy / 1Password).
        </p>
        <TwoFactorPanel
          factor={totp ? { id: totp.id, status: totp.status } : null}
          currentLevel={aal.data?.currentLevel ?? null}
        />
      </section>

      {teacher && (
        <section className="bg-white rounded-card border border-neutral-200 p-6">
          <h2 className="font-semibold mb-2">إشعارات الموبايل</h2>
          <p className="text-sm text-neutral-600 mb-4">
            تستقبل إشعارات الحصص والمدفوعات حتى لو كانت المنصة مغلقة.
          </p>
          <PushToggle
            teacherId={teacher.id}
            vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null}
          />
        </section>
      )}

      <section className="bg-white rounded-card border border-neutral-200 p-6">
        <h2 className="font-semibold mb-2">كلمة المرور</h2>
        <p className="text-sm text-neutral-600">
          لتغيير كلمة المرور، اضغط <strong>نسيت كلمة المرور</strong> من شاشة الدخول.
        </p>
      </section>
    </div>
  );
}
