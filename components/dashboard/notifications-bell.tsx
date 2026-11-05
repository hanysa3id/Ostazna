'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function NotificationsBell({ teacherId, initialCount }: { teacherId: string; initialCount: number }) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifs:${teacherId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `teacher_id=eq.${teacherId}` },
        () => setCount(c => c + 1)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [teacherId]);

  return (
    <Link
      href="/notifications"
      onClick={() => setCount(0)}
      className="relative p-2 rounded-card hover:bg-neutral-100 text-neutral-600"
      aria-label="الإشعارات"
    >
      <Bell className="w-4 h-4" />
      {count > 0 && (
        <span className="absolute -top-0.5 -end-0.5 min-w-4 h-4 px-1 bg-red-600 text-white text-[10px] rounded-full grid place-items-center font-medium">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
