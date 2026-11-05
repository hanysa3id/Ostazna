import { getImpersonating } from '@/lib/impersonation';
import { endImpersonationAction } from '@/app/(admin)/admin/teachers/[id]/actions';

export async function ImpersonationBanner() {
  const c = await getImpersonating();
  if (!c) return null;
  return (
    <div className="bg-amber-500 text-white text-sm px-6 py-2 flex items-center justify-between">
      <span>وضع <strong>المنتحل</strong>: أنت تستعرض حساب مدرس آخر بصلاحيات Super Admin.</span>
      <form action={endImpersonationAction}>
        <button className="text-xs px-3 py-1 rounded bg-white/20 hover:bg-white/30">إنهاء الجلسة</button>
      </form>
    </div>
  );
}
