'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { studentSchema } from '@/lib/validations/student';
import { createStudent } from '@/lib/dal/students';
import { getCurrentTeacher } from '@/lib/dal/teachers';
import { assertCanAddStudent, QuotaError } from '@/lib/quotas';

export type StudentActionState = { error?: string };

export async function addStudentAction(_prev: StudentActionState, formData: FormData): Promise<StudentActionState> {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { error: 'يلزم تسجيل الدخول.' };

  const parsed = studentSchema.safeParse({
    name_ar: formData.get('name_ar'),
    name_en: formData.get('name_en'),
    date_of_birth: formData.get('date_of_birth'),
    phone: formData.get('phone'),
    parent_name: formData.get('parent_name'),
    parent_phone: formData.get('parent_phone'),
    notes: formData.get('notes'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة.' };

  try {
    await assertCanAddStudent(teacher.id);
  } catch (err) {
    if (err instanceof QuotaError) return { error: err.message };
    return { error: 'تعذر التحقق من الخطة.' };
  }

  try {
    await createStudent(teacher.id, parsed.data);
  } catch (err) {
    console.error('[students/add] createStudent failed:', err);
    const msg = err instanceof Error ? err.message : 'سبب غير معروف';
    return { error: `تعذر حفظ الطالب: ${msg}` };
  }

  revalidatePath('/students');
  redirect('/students');
}
