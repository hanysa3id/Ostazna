import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Users as UsersIcon, Wallet, CalendarClock, MessageCircle, KeyRound, Trash2, ExternalLink } from 'lucide-react';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { formatCurrencyEGP } from '@/lib/utils/numerals';
import { formatDate } from '@/lib/utils/dates';
import {
  confirmSubscriptionAction, setStatusAction, impersonateAction,
  resetPasswordAction, deleteTeacherAction,
} from './actions';
import { grantAddonAction, revokeAddonAction } from '../../addons/actions';

export const dynamic = 'force-dynamic';

export default async function AdminTeacherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = createServiceRoleClient();

  const [
    { data: teacher },
    { data: plan },
    { data: plans },
    { data: subs },
    { count: studentsCount },
    { count: groupsCount },
    { count: sessionsCount },
    { data: paymentsAgg },
    { data: addons },
    { data: teacherAddons },
    { count: waSent },
  ] = await Promise.all([
    sb.from('teachers').select('*').eq('id', id).maybeSingle(),
    sb.from('teachers').select('current_plan_id').eq('id', id).maybeSingle()
      .then(r => sb.from('plans').select('name_ar, price_egp').eq('id', r.data?.current_plan_id ?? '').maybeSingle()),
    sb.from('plans').select('*').eq('is_active', true).order('price_egp'),
    sb.from('subscriptions').select('*').eq('teacher_id', id).order('starts_at', { ascending: false }).limit(20),
    sb.from('students').select('id', { head: true, count: 'exact' }).eq('teacher_id', id).is('archived_at', null),
    sb.from('groups').select('id', { head: true, count: 'exact' }).eq('teacher_id', id).is('archived_at', null),
    sb.from('sessions').select('id', { head: true, count: 'exact' }).eq('teacher_id', id),
    sb.from('payments').select('amount').eq('teacher_id', id),
    sb.from('addons').select('*').eq('is_active', true).order('name_ar'),
    sb.from('teacher_addons').select('*, addon:addons(name_ar, key)').eq('teacher_id', id),
    sb.from('wa_send_log').select('id', { head: true, count: 'exact' }).eq('teacher_id', id),
  ]);

  if (!teacher) notFound();

  const totalRevenue = (paymentsAgg ?? []).reduce((s: number, p: any) => s + Number(p.amount), 0);
  const enabledAddonIds = new Set((teacherAddons ?? []).map((a: any) => a.addon_id));
  const availableAddons = (addons ?? []).filter(a => !enabledAddonIds.has(a.id));

  return (
    <div className="space-y-6">
      <Link href="/admin/teachers" className="inline-flex items-center gap-1 text-sm text-primary-700 hover:text-violet-600">
        <ArrowRight className="w-4 h-4" /> كل المدرسين
      </Link>

      {/* HERO */}
      <div className="bg-white rounded-2xl border border-primary-100 p-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          {teacher.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={teacher.avatar_url} alt="" className="w-16 h-16 rounded-2xl object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-2xl [background-image:var(--gradient-aurora)] text-white grid place-items-center text-2xl font-bold shadow-glow">
              {teacher.name_ar?.[0] ?? teacher.email[0]}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-primary-900">{teacher.name_ar}</h1>
            <div className="text-sm text-primary-600">{teacher.email}</div>
            {teacher.phone && <div className="text-xs text-primary-500 mt-1">{teacher.phone}</div>}
            {teacher.subdomain && (
              <a href={`http://${teacher.subdomain}.ostazna.com`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 mt-2 text-xs text-violet-600 hover:underline font-mono">
                <ExternalLink className="w-3 h-3" /> {teacher.subdomain}.ostazna.com
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <form action={impersonateAction}>
            <input type="hidden" name="teacher_id" value={teacher.id} />
            <button className="text-xs px-3 py-2 rounded-card bg-amber-500 text-white inline-flex items-center gap-1.5">
              دخول كهذا المدرس
            </button>
          </form>
          <span className={`text-xs px-3 py-1 rounded-full ${
            teacher.current_status === 'active' ? 'bg-accent-500/10 text-accent-700' :
            teacher.current_status === 'trial'  ? 'bg-cyan-50 text-cyan-700' :
            teacher.current_status === 'frozen' ? 'bg-amber-50 text-amber-700' :
                                                  'bg-neutral-100 text-neutral-700'
          }`}>
            {teacher.current_status}
          </span>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat icon={UsersIcon} label="الطلاب" value={String(studentsCount ?? 0)} tone="from-primary-500 to-violet-500" />
        <Stat icon={CalendarClock} label="المجموعات" value={String(groupsCount ?? 0)} tone="from-cyan-500 to-primary-500" />
        <Stat icon={CalendarClock} label="إجمالي الحصص" value={String(sessionsCount ?? 0)} tone="from-violet-500 to-cyan-500" />
        <Stat icon={Wallet} label="إجمالي الإيرادات" value={formatCurrencyEGP(totalRevenue)} tone="from-accent-500 to-cyan-500" />
        <Stat icon={MessageCircle} label="رسائل WA المُرسلة" value={String(waSent ?? 0)} tone="from-secondary-500 to-accent-500" />
      </div>

      {/* CURRENT PLAN */}
      {(plan as any)?.data?.name_ar && (
        <div className="bg-violet-50 border border-violet-100 rounded-card p-4 text-sm text-violet-900">
          الخطة الحالية: <strong>{(plan as any).data.name_ar}</strong> ({(plan as any).data.price_egp} ج/شهر)
        </div>
      )}

      {/* ACTIVATE SUBSCRIPTION */}
      <section className="p-5 bg-white rounded-2xl border border-primary-100">
        <h2 className="font-semibold text-primary-900 mb-3">تفعيل / تجديد اشتراك</h2>
        <form action={confirmSubscriptionAction} className="grid gap-3 sm:grid-cols-4">
          <input type="hidden" name="teacher_id" value={teacher.id} />
          <select name="plan_id" required className="px-3 py-2 rounded-card border border-primary-200 text-sm">
            {(plans ?? []).map(p => (
              <option key={p.id} value={p.id}>{p.name_ar} — {p.price_egp} ج</option>
            ))}
          </select>
          <input name="months" type="number" min={1} max={12} defaultValue={1} placeholder="شهور" className="px-3 py-2 rounded-card border border-primary-200 text-sm" />
          <select name="payment_method" className="px-3 py-2 rounded-card border border-primary-200 text-sm">
            <option value="cash">نقدي</option>
            <option value="bank_transfer">تحويل بنكي</option>
            <option value="wallet">محفظة</option>
            <option value="other">أخرى</option>
          </select>
          <button className="px-4 py-2 rounded-card bg-accent-500 text-white text-sm font-medium">تفعيل</button>
        </form>
      </section>

      {/* STATUS */}
      <section className="p-5 bg-white rounded-2xl border border-primary-100">
        <h2 className="font-semibold text-primary-900 mb-3">تغيير الحالة</h2>
        <form action={setStatusAction} className="flex items-center gap-3">
          <input type="hidden" name="teacher_id" value={teacher.id} />
          <select name="status" defaultValue={teacher.current_status} className="px-3 py-2 rounded-card border border-primary-200 text-sm">
            <option value="trial">تجريبي</option>
            <option value="active">نشط</option>
            <option value="frozen">مجمّد</option>
            <option value="archived">مؤرشف</option>
          </select>
          <button className="px-4 py-2 rounded-card border border-primary-200 text-sm">تحديث</button>
        </form>
      </section>

      {/* ADDONS */}
      <section className="p-5 bg-white rounded-2xl border border-primary-100">
        <h2 className="font-semibold text-primary-900 mb-3">الـ Add-ons المُفعّلة</h2>

        {(teacherAddons ?? []).length === 0 ? (
          <p className="text-sm text-primary-500 mb-4">لا توجد add-ons مفعّلة لهذا المدرس.</p>
        ) : (
          <ul className="space-y-2 mb-4">
            {(teacherAddons ?? []).map((ta: any) => (
              <li key={ta.id} className="flex items-center justify-between p-3 bg-violet-50/40 rounded-card">
                <div>
                  <div className="text-sm font-medium text-primary-900">{ta.addon?.name_ar}</div>
                  <div className="text-xs text-primary-500">
                    من {ta.active_from} {ta.active_until ? `إلى ${ta.active_until}` : '· دائم'}
                  </div>
                </div>
                <form action={revokeAddonAction}>
                  <input type="hidden" name="teacher_id" value={teacher.id} />
                  <input type="hidden" name="addon_id" value={ta.addon_id} />
                  <button className="text-xs text-red-600">إزالة</button>
                </form>
              </li>
            ))}
          </ul>
        )}

        {availableAddons.length > 0 && (
          <form action={grantAddonAction} className="grid sm:grid-cols-3 gap-2 pt-3 border-t border-primary-100">
            <input type="hidden" name="teacher_id" value={teacher.id} />
            <select name="addon_id" required className="px-3 py-2 rounded-card border border-primary-200 text-sm">
              <option value="">— اختر add-on —</option>
              {availableAddons.map(a => <option key={a.id} value={a.id}>{a.name_ar}</option>)}
            </select>
            <input name="months" type="number" min={0} max={36} defaultValue={1} placeholder="شهور (0 = دائم)" className="px-3 py-2 rounded-card border border-primary-200 text-sm" />
            <button className="px-4 py-2 rounded-card bg-violet-600 text-white text-sm">تفعيل</button>
          </form>
        )}
      </section>

      {/* SUBSCRIPTION HISTORY */}
      <section className="p-5 bg-white rounded-2xl border border-primary-100">
        <h2 className="font-semibold text-primary-900 mb-3">سجل الاشتراكات ({(subs ?? []).length})</h2>
        {(subs ?? []).length === 0 ? (
          <p className="text-sm text-primary-500">لا يوجد سجل بعد.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-primary-500 text-xs">
              <tr>
                <th className="text-start pb-2">من</th>
                <th className="text-start pb-2">إلى</th>
                <th className="text-start pb-2">الحالة</th>
                <th className="text-start pb-2">الطريقة</th>
                <th className="text-end pb-2">المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-50">
              {(subs ?? []).map(s => (
                <tr key={s.id}>
                  <td className="py-2">{formatDate(s.starts_at)}</td>
                  <td className="py-2">{formatDate(s.ends_at)}</td>
                  <td className="py-2">{s.status}</td>
                  <td className="py-2 text-primary-600 text-xs">{s.payment_method ?? '—'}</td>
                  <td className="py-2 text-end font-medium">{s.amount_paid_egp ? formatCurrencyEGP(s.amount_paid_egp) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* DANGER ZONE */}
      <section className="p-5 bg-red-50/50 rounded-2xl border border-red-200">
        <h2 className="font-semibold text-red-700 mb-3">منطقة الخطر</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <form action={resetPasswordAction} className="bg-white rounded-card border border-primary-100 p-4">
            <h3 className="font-medium text-primary-900 inline-flex items-center gap-1.5"><KeyRound className="w-4 h-4 text-amber-600" /> إعادة كلمة المرور</h3>
            <p className="text-xs text-primary-600 mt-1 mb-3">يُرسل للمدرس رابط إعادة تعيين على بريده.</p>
            <input type="hidden" name="teacher_id" value={teacher.id} />
            <button className="text-xs px-3 py-1.5 rounded-card border border-amber-300 text-amber-700 hover:bg-amber-50">إرسال الرابط</button>
          </form>

          <form action={deleteTeacherAction} className="bg-white rounded-card border border-red-200 p-4">
            <h3 className="font-medium text-red-700 inline-flex items-center gap-1.5"><Trash2 className="w-4 h-4" /> حذف نهائي</h3>
            <p className="text-xs text-primary-600 mt-1 mb-3">يحذف الحساب وكل البيانات (طلاب، حصص، مدفوعات...) — لا يمكن التراجع.</p>
            <input type="hidden" name="teacher_id" value={teacher.id} />
            <input name="confirm" placeholder="اكتب DELETE للتأكيد" className="w-full px-2 py-1.5 rounded border border-red-200 text-xs mb-2 font-mono" />
            <button className="text-xs px-3 py-1.5 rounded-card bg-red-600 text-white">حذف الحساب نهائياً</button>
          </form>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: string }) {
  return (
    <div className="p-4 bg-white rounded-2xl border border-primary-100">
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tone} text-white grid place-items-center mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-xs text-primary-500">{label}</div>
      <div className="text-xl font-bold text-primary-900 mt-1 tabular-nums">{value}</div>
    </div>
  );
}
