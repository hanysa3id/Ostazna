'use client';

import { useActionState, useState } from 'react';
import { editStudentAction, type EditState } from './actions';

const INITIAL: EditState = {};

type CustomField = { key: string; value: string };

export function EditStudentForm({ student }: { student: any }) {
  const [state, formAction, pending] = useActionState(editStudentAction, INITIAL);

  const initialFields: CustomField[] = Object.entries(student.custom_fields ?? {})
    .map(([key, value]) => ({ key, value: String(value) }));
  const [fields, setFields] = useState<CustomField[]>(initialFields);

  function addField() { setFields(f => [...f, { key: '', value: '' }]); }
  function updateField(i: number, patch: Partial<CustomField>) {
    setFields(f => f.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  }
  function removeField(i: number) { setFields(f => f.filter((_, j) => j !== i)); }

  const customFieldsJSON = JSON.stringify(
    fields.reduce<Record<string, string>>((acc, f) => {
      const k = f.key.trim();
      if (k) acc[k] = f.value;
      return acc;
    }, {})
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={student.id} />
      <input type="hidden" name="custom_fields" value={customFieldsJSON} />

      <Field name="name_ar" label="الاسم بالعربية" defaultValue={student.name_ar} required />
      <Field name="name_en" label="الاسم بالإنجليزية" defaultValue={student.name_en ?? ''} />

      <div className="grid grid-cols-2 gap-3">
        <Field name="date_of_birth" type="date" label="تاريخ الميلاد" defaultValue={student.date_of_birth ?? ''} />
        <Field name="phone" label="هاتف الطالب" defaultValue={student.phone ?? ''} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field name="parent_name" label="اسم ولي الأمر" defaultValue={student.parent_name ?? ''} />
        <Field name="parent_phone" label="هاتف ولي الأمر" defaultValue={student.parent_phone ?? ''} />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">ملاحظات</label>
        <textarea name="notes" defaultValue={student.notes ?? ''} rows={3}
          className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-neutral-700">حقول مخصصة</label>
          <button type="button" onClick={addField} className="text-xs text-primary-700">+ حقل</button>
        </div>
        {fields.length === 0 ? (
          <p className="text-xs text-neutral-500">لم تُضف حقول بعد.</p>
        ) : (
          <div className="space-y-2">
            {fields.map((f, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={f.key} onChange={e => updateField(i, { key: e.target.value })}
                  placeholder="اسم الحقل" className="flex-1 px-2 py-1.5 rounded border border-neutral-300 text-sm"
                />
                <input
                  value={f.value} onChange={e => updateField(i, { value: e.target.value })}
                  placeholder="القيمة" className="flex-1 px-2 py-1.5 rounded border border-neutral-300 text-sm"
                />
                <button type="button" onClick={() => removeField(i)} className="text-xs text-red-600 px-2">×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {state.error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-card px-3 py-2">{state.error}</p>}

      <button type="submit" disabled={pending} className="w-full px-4 py-2.5 rounded-card bg-primary-700 text-white font-medium disabled:opacity-60">
        {pending ? '...' : 'حفظ التعديلات'}
      </button>
    </form>
  );
}

function Field({ name, label, type = 'text', defaultValue, required }: { name: string; label: string; type?: string; defaultValue?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
      <input name={name} type={type} defaultValue={defaultValue} required={required}
        className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300" />
    </div>
  );
}
