'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentTeacher } from '@/lib/dal/teachers';

export type ImportRow = {
  name_ar: string;
  name_en?: string;
  phone?: string;
  parent_name?: string;
  parent_phone?: string;
  date_of_birth?: string;
  notes?: string;
};

export type ImportResult = {
  inserted: number;
  errors: { row: number; message: string }[];
};

export async function importStudentsAction(rows: ImportRow[]): Promise<ImportResult> {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { inserted: 0, errors: [{ row: 0, message: 'يلزم تسجيل الدخول.' }] };

  const supabase = await createClient();
  const errors: { row: number; message: string }[] = [];
  const payload: any[] = [];

  rows.forEach((r, i) => {
    if (!r.name_ar || r.name_ar.trim().length < 2) {
      errors.push({ row: i + 2, message: 'name_ar مطلوب (حرفان على الأقل)' });
      return;
    }
    payload.push({
      teacher_id: teacher.id,
      name_ar: r.name_ar.trim(),
      name_en: r.name_en?.trim() || null,
      phone: r.phone?.trim() || null,
      parent_name: r.parent_name?.trim() || null,
      parent_phone: r.parent_phone?.trim() || null,
      date_of_birth: r.date_of_birth?.trim() || null,
      notes: r.notes?.trim() || null,
    });
  });

  if (payload.length === 0) return { inserted: 0, errors };

  // Insert in chunks of 100 (Postgres parameter limits + error isolation).
  let inserted = 0;
  for (let i = 0; i < payload.length; i += 100) {
    const chunk = payload.slice(i, i + 100);
    const { error, count } = await supabase
      .from('students')
      .insert(chunk, { count: 'exact' });
    if (error) {
      errors.push({ row: i + 2, message: error.message });
    } else {
      inserted += count ?? chunk.length;
    }
  }

  revalidatePath('/students');
  return { inserted, errors };
}
