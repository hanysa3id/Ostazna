import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { addQuestionAction, deleteQuestionAction, publishExamAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: exam }, { data: questions }, { data: submissions }] = await Promise.all([
    supabase.from('exams').select('*').eq('id', id).maybeSingle(),
    supabase.from('questions').select('*').eq('exam_id', id).order('order_index'),
    supabase.from('exam_submissions').select('id, score, submitted_at, student:students(name_ar)').eq('exam_id', id),
  ]);
  if (!exam) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">{exam.title}</h1>
          <p className="text-sm text-neutral-500 mt-1">{exam.duration_minutes} د · {exam.total_marks} درجة · النجاح {exam.pass_marks}</p>
        </div>
        {exam.status === 'draft' && (
          <form action={publishExamAction}>
            <input type="hidden" name="id" value={exam.id} />
            <button className="text-sm px-4 py-2 rounded-card bg-accent-500 text-white">نشر</button>
          </form>
        )}
      </div>

      <section className="bg-white rounded-card border border-neutral-200 p-5">
        <h2 className="font-semibold mb-4">الأسئلة ({(questions ?? []).length})</h2>

        {(questions ?? []).length > 0 && (
          <ol className="space-y-3 mb-6">
            {(questions ?? []).map((q: any, i: number) => (
              <li key={q.id} className="border border-neutral-200 rounded-card p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-xs text-neutral-500 mb-1">س{i + 1} · {q.type} · {q.marks} درجة</div>
                    <div className="font-medium text-neutral-900">{q.question_text}</div>
                    {q.type === 'mcq' && (
                      <ul className="mt-2 text-sm text-neutral-700 space-y-1">
                        {(q.options ?? []).map((opt: string, j: number) => (
                          <li key={j}>{['أ','ب','ج','د'][j]}. {opt}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <form action={deleteQuestionAction}>
                    <input type="hidden" name="id" value={q.id} />
                    <input type="hidden" name="exam_id" value={exam.id} />
                    <button className="text-xs text-red-600">حذف</button>
                  </form>
                </div>
              </li>
            ))}
          </ol>
        )}

        <details>
          <summary className="cursor-pointer text-primary-700 text-sm">+ إضافة سؤال</summary>
          <AddQuestionForm examId={exam.id} />
        </details>
      </section>

      <section className="bg-white rounded-card border border-neutral-200 p-5">
        <h2 className="font-semibold mb-3">إجابات الطلاب ({(submissions ?? []).length})</h2>
        {(submissions ?? []).length === 0 ? (
          <p className="text-sm text-neutral-500">لم يحل أحد الاختبار بعد.</p>
        ) : (
          <ul className="text-sm divide-y divide-neutral-100">
            {(submissions ?? []).map((s: any) => (
              <li key={s.id} className="py-2 flex items-center justify-between">
                <span>{s.student?.name_ar}</span>
                <span className="font-medium">{s.score ?? '—'} / {exam.total_marks}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function AddQuestionForm({ examId }: { examId: string }) {
  return (
    <form action={addQuestionAction} className="mt-3 space-y-3 p-4 bg-neutral-50 rounded-card">
      <input type="hidden" name="exam_id" value={examId} />
      <div className="grid grid-cols-2 gap-3">
        <select name="type" className="px-3 py-2 rounded-card border border-neutral-300 text-sm">
          <option value="mcq">اختيار من متعدد</option>
          <option value="true_false">صح / خطأ</option>
          <option value="short_answer">إجابة قصيرة</option>
          <option value="essay">مقال (تصحيح يدوي)</option>
        </select>
        <input name="marks" type="number" min={1} defaultValue={1} className="px-3 py-2 rounded-card border border-neutral-300 text-sm" placeholder="الدرجة" />
      </div>
      <textarea name="question_text" required rows={2} placeholder="نص السؤال" className="w-full px-3 py-2 rounded-card border border-neutral-300 text-sm" />

      <details>
        <summary className="text-xs cursor-pointer text-neutral-600">خيارات MCQ (اختياري)</summary>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['a','b','c','d'].map((k, i) => (
            <input key={k} name={`opt_${k}`} placeholder={['أ','ب','ج','د'][i]} className="px-3 py-1.5 rounded border border-neutral-300 text-sm" />
          ))}
          <select name="mcq_correct" className="col-span-2 px-3 py-1.5 rounded border border-neutral-300 text-sm">
            <option value="">— الإجابة الصحيحة —</option>
            <option value="0">أ</option>
            <option value="1">ب</option>
            <option value="2">ج</option>
            <option value="3">د</option>
          </select>
        </div>
      </details>

      <details>
        <summary className="text-xs cursor-pointer text-neutral-600">صح/خطأ (إجابة)</summary>
        <select name="tf_correct" className="mt-2 px-3 py-1.5 rounded border border-neutral-300 text-sm">
          <option value="true">صح</option>
          <option value="false">خطأ</option>
        </select>
      </details>

      <details>
        <summary className="text-xs cursor-pointer text-neutral-600">إجابة قصيرة (مرجعية)</summary>
        <input name="short_correct" placeholder="نص الإجابة الصحيحة" className="mt-2 w-full px-3 py-1.5 rounded border border-neutral-300 text-sm" />
      </details>

      <button className="px-4 py-2 rounded-card bg-primary-700 text-white text-sm">إضافة السؤال</button>
    </form>
  );
}
