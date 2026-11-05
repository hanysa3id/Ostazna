import { createServiceRoleClient } from '@/lib/supabase/server';
import { CreditCard, Phone, Mail, MessageCircle, Settings as SettingsIcon } from 'lucide-react';
import { savePaymentMethodsAction, saveBrandingAction } from './actions';

export const metadata = { title: 'إعدادات المنصة' };
export const dynamic = 'force-dynamic';

export default async function PlatformSettingsPage() {
  const sb = createServiceRoleClient();
  const { data: rows } = await sb.from('platform_settings').select('*');

  const settings = (rows ?? []).reduce<Record<string, any>>((acc, r) => {
    acc[r.key] = r.value;
    return acc;
  }, {});

  const pay = settings.payment_methods ?? {};
  const brand = settings.platform_branding ?? {};
  const wa = settings.whatsapp_caps ?? {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-900 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-violet-600" /> إعدادات المنصة
        </h1>
        <p className="mt-1 text-sm text-primary-700/80">إعدادات تنطبق على المنصة بالكامل.</p>
      </div>

      {/* PAYMENT METHODS */}
      <form action={savePaymentMethodsAction} className="bg-white rounded-2xl border border-primary-100 p-6 space-y-4">
        <h2 className="font-semibold text-primary-900 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-violet-600" /> طرق الدفع للاشتراك
        </h2>
        <p className="text-xs text-primary-500">تظهر للمدرس عند بدء الاشتراك. التأكيد يدوي حالياً.</p>

        <div className="space-y-4">
          <div className="border border-primary-100 rounded-xl p-3">
            <label className="flex items-center gap-2 text-sm font-medium text-primary-900">
              <input type="checkbox" name="cash_enabled" defaultChecked={pay.cash?.enabled} className="w-4 h-4" />
              نقدي / تحويل يدوي
            </label>
          </div>

          <div className="border border-primary-100 rounded-xl p-3 space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-primary-900">
              <input type="checkbox" name="bank_enabled" defaultChecked={pay.bank?.enabled} className="w-4 h-4" />
              تحويل بنكي
            </label>
            <input name="bank_iban" defaultValue={pay.bank?.iban ?? ''} placeholder="IBAN / رقم الحساب" className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm font-mono" />
          </div>

          <div className="border border-primary-100 rounded-xl p-3 space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-primary-900">
              <input type="checkbox" name="wallet_enabled" defaultChecked={pay.wallet?.enabled} className="w-4 h-4" />
              محفظة إلكترونية (Vodafone Cash / InstaPay)
            </label>
            <input name="wallet_number" defaultValue={pay.wallet?.number ?? ''} placeholder="رقم المحفظة" className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm font-mono" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-primary-700 mb-1">تعليمات الدفع (تظهر للمدرس)</label>
          <textarea name="instructions_ar" defaultValue={pay.instructions_ar ?? ''} rows={2} className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm" />
        </div>

        <button className="px-5 py-2.5 rounded-card bg-primary-700 text-white text-sm">حفظ طرق الدفع</button>
      </form>

      {/* BRANDING */}
      <form action={saveBrandingAction} className="bg-white rounded-2xl border border-primary-100 p-6 space-y-4">
        <h2 className="font-semibold text-primary-900 flex items-center gap-2">
          <Phone className="w-4 h-4 text-violet-600" /> بيانات الدعم
        </h2>

        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-primary-700 mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> بريد الدعم</label>
            <input name="support_email" type="email" defaultValue={brand.support_email ?? ''} className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-primary-700 mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> هاتف الدعم</label>
            <input name="support_phone" defaultValue={brand.support_phone ?? ''} className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-primary-700 mb-1 flex items-center gap-1"><MessageCircle className="w-3 h-3" /> واتساب الدعم</label>
            <input name="support_whatsapp" defaultValue={brand.support_whatsapp ?? ''} placeholder="201012345678" className="w-full px-3 py-2 rounded-card border border-primary-200 text-sm font-mono" />
          </div>
        </div>

        <button className="px-5 py-2.5 rounded-card bg-primary-700 text-white text-sm">حفظ بيانات الدعم</button>
      </form>

      {/* WA CAPS (read-only summary; tier caps live on plans table) */}
      <div className="bg-white rounded-2xl border border-primary-100 p-6">
        <h2 className="font-semibold text-primary-900 mb-3 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-violet-600" /> سقوف رسائل واتساب
        </h2>
        <p className="text-xs text-primary-500 mb-3">السقوف الحقيقية تُحفظ في جدول <code>plans</code> (احرّرها من <a className="text-violet-600 hover:underline" href="/admin/plans">صفحة الخطط</a>).</p>
        <div className="grid grid-cols-4 gap-3 text-sm">
          {Object.entries(wa).map(([tier, val]) => (
            <div key={tier} className="text-center p-3 bg-primary-50/50 rounded-xl">
              <div className="text-xs text-primary-500 uppercase">{tier}</div>
              <div className="text-2xl font-bold text-primary-900 mt-1">{val === null ? '∞' : String(val)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
