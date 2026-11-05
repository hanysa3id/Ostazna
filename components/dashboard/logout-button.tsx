'use client';

import { useTransition } from 'react';
import { LogOut } from 'lucide-react';
import { logoutAction } from '@/lib/auth/actions';

export function LogoutButton() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      onClick={() => start(() => logoutAction())}
      disabled={pending}
      className="p-2 rounded-card hover:bg-neutral-100 text-neutral-600"
      aria-label="تسجيل الخروج"
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
}
