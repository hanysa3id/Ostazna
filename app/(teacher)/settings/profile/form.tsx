'use client';

import { useActionState, useState } from 'react';
import { ImageUploader } from '@/components/shared/image-uploader';
import { saveProfileAction, type ProfileState } from './actions';
import type { TeacherRow } from '@/lib/dal/teachers';

const INITIAL: ProfileState = {};

export function ProfileForm({ teacher }: { teacher: TeacherRow }) {
  const [state, formAction, pending] = useActionState(saveProfileAction, INITIAL);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(teacher.avatar_url);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="avatar_url" value={avatarUrl ?? ''} />

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">الصورة الشخصية</label>
        <ImageUploader
          bucket="avatars"
          teacherId={teacher.id}
          entity="profile"
          initialUrl={avatarUrl ?? undefined}
          onUploaded={(url) => setAvatarUrl(url || null)}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Field name="name_ar" label="الاسم بالعربية" defaultValue={teacher.name_ar} required />
        <Field name="name_en" label="الاسم بالإنجليزية" defaultValue={teacher.name_en ?? ''} />
      </div>
      <Field name="phone" label="رقم الهاتف" defaultValue={teacher.phone ?? ''} />

      {state.error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-card px-3 py-2">{state.error}</p>}
      {state.ok && <p className="text-sm text-accent-700 bg-accent-500/10 border border-accent-500/20 rounded-card px-3 py-2">حُفظ بنجاح.</p>}

      <button type="submit" disabled={pending} className="w-full px-4 py-2.5 rounded-card bg-primary-700 text-white font-medium disabled:opacity-60">
        {pending ? '...' : 'حفظ'}
      </button>
    </form>
  );
}

function Field({ name, label, defaultValue, required }: { name: string; label: string; defaultValue?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
      <input name={name} defaultValue={defaultValue} required={required}
        className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none" />
    </div>
  );
}
