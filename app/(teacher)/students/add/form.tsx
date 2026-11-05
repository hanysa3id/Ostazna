'use client';

import { useActionState } from 'react';
import { addStudentAction, type StudentActionState } from './actions';

const INITIAL: StudentActionState = {};

export function AddStudentForm() {
  const [state, formAction, pending] = useActionState(addStudentAction, INITIAL);

  return (
    <form action={formAction} className="space-y-4">
      <Field name="name_ar" label="الاسم بالعربية" required />
      <Field name="name_en" label="الاسم بالإنجليزية (اختياري)" />
      <div className="grid grid-cols-2 gap-3">
        <Field name="date_of_birth" label="تاريخ الميلاد" type="date" />
        <Field name="phone" label="هاتف الطالب" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field name="parent_name" label="اسم ولي الأمر" />
        <Field name="parent_phone" label="هاتف ولي الأمر" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">ملاحظات</label>
        <textarea
          name="notes" rows={3}
          className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-card px-3 py-2">{state.error}</p>
      )}

      <button
        type="submit" disabled={pending}
        className="w-full px-4 py-2.5 rounded-card bg-primary-700 text-white font-medium hover:bg-primary-800 disabled:opacity-60"
      >
        {pending ? '...' : 'حفظ'}
      </button>
    </form>
  );
}

function Field({ name, label, type = 'text', required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
      <input
        name={name} type={type} required={required}
        className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
      />
    </div>
  );
}
