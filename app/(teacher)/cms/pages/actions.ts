'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentTeacher } from '@/lib/dal/teachers';

export async function createPageAction(formData: FormData) {
  const teacher = await getCurrentTeacher();
  if (!teacher) return;

  const title_ar = String(formData.get('title_ar') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
  if (!title_ar || !slug) return;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cms_pages')
    .insert({ teacher_id: teacher.id, title_ar, slug, page_type: 'custom' })
    .select('id')
    .single();
  if (error || !data) return;

  revalidatePath('/cms/pages');
  redirect(`/cms/pages/${data.id}`);
}

export async function savePageAction(formData: FormData) {
  const teacher = await getCurrentTeacher();
  if (!teacher) return;
  const id = String(formData.get('id'));
  const title_ar = String(formData.get('title_ar') ?? '');
  const title_en = String(formData.get('title_en') ?? '');
  const content_ar = String(formData.get('content_ar') ?? '');
  const is_published = formData.get('is_published') === 'on';

  const supabase = await createClient();
  await supabase
    .from('cms_pages')
    .update({
      title_ar, title_en: title_en || null,
      content_ar: [{ type: 'rich_text', html: content_ar }],
      is_published,
    })
    .eq('id', id);

  revalidatePath('/cms/pages');
  revalidatePath(`/cms/pages/${id}`);
}

export async function deletePageAction(formData: FormData) {
  const id = String(formData.get('id'));
  const supabase = await createClient();
  await supabase.from('cms_pages').delete().eq('id', id);
  revalidatePath('/cms/pages');
  redirect('/cms/pages');
}
