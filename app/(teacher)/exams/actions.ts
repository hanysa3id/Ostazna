'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentTeacher } from '@/lib/dal/teachers';

export type ExamState = { error?: string };

export async function createExamAction(_prev: ExamState, formData: FormData): Promise<ExamState> {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { error: 'يلزم تسجيل الدخول.' };

  const title = String(formData.get('title') ?? '').trim();
  if (title.length < 2) return { error: 'العنوان مطلوب.' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('exams')
    .insert({
      teacher_id: teacher.id,
      title,
      description: (formData.get('description') as string) || null,
      duration_minutes: Number(formData.get('duration_minutes') ?? 60),
      total_marks: Number(formData.get('total_marks') ?? 100),
      pass_marks: Number(formData.get('pass_marks') ?? 50),
      starts_at: (formData.get('starts_at') as string) || null,
      ends_at: (formData.get('ends_at') as string) || null,
    })
    .select('id')
    .single();
  if (error || !data) return { error: `تعذر الإنشاء: ${error?.message}` };

  revalidatePath('/exams');
  redirect(`/exams/${data.id}`);
}

export async function publishExamAction(formData: FormData) {
  const id = String(formData.get('id'));
  const supabase = await createClient();
  await supabase.from('exams').update({ status: 'published' }).eq('id', id);
  revalidatePath(`/exams/${id}`);
  revalidatePath('/exams');
}

export async function addQuestionAction(formData: FormData) {
  const teacher = await getCurrentTeacher();
  if (!teacher) return;
  const exam_id = String(formData.get('exam_id'));
  const type = formData.get('type') as 'mcq' | 'true_false' | 'short_answer' | 'essay';
  const question_text = String(formData.get('question_text') ?? '').trim();
  const marks = Number(formData.get('marks') ?? 1);

  let options: any = null;
  let correct: any = null;
  if (type === 'mcq') {
    const opts = ['a', 'b', 'c', 'd']
      .map(k => String(formData.get(`opt_${k}`) ?? '').trim())
      .filter(Boolean);
    options = opts;
    correct = String(formData.get('mcq_correct') ?? '');
  } else if (type === 'true_false') {
    correct = formData.get('tf_correct') === 'true';
  } else if (type === 'short_answer') {
    correct = String(formData.get('short_correct') ?? '');
  }

  if (!question_text) return;

  const supabase = await createClient();
  const { count } = await supabase.from('questions').select('id', { head: true, count: 'exact' }).eq('exam_id', exam_id);
  await supabase.from('questions').insert({
    teacher_id: teacher.id,
    exam_id, type, question_text, marks,
    options, correct_answer: correct,
    order_index: (count ?? 0) + 1,
  });
  revalidatePath(`/exams/${exam_id}`);
}

export async function deleteQuestionAction(formData: FormData) {
  const id = String(formData.get('id'));
  const exam_id = String(formData.get('exam_id'));
  const supabase = await createClient();
  await supabase.from('questions').delete().eq('id', id);
  revalidatePath(`/exams/${exam_id}`);
}
