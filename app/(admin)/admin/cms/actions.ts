'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';

async function ensureAdmin() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user || (user.app_metadata as any)?.role !== 'super_admin') {
    throw new Error('forbidden');
  }
}

// Marketing pages are now `force-dynamic`, so revalidatePath is mostly a safety net.
function bumpAll() {
  revalidatePath('/', 'layout');
  revalidatePath('/');
  revalidatePath('/pricing');
  revalidatePath('/features/[slug]', 'page');
  revalidatePath('/p/[slug]', 'page');
}

function logFailure(stage: string, error: any) {
  // eslint-disable-next-line no-console
  console.error(`[admin/cms] ${stage} FAILED:`, JSON.stringify({
    message: error?.message,
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
  }, null, 2));
}

// ============ HERO SLIDES ============
export async function saveHeroSlideAction(formData: FormData) {
  await ensureAdmin();
  const sb = createServiceRoleClient();
  const id = (formData.get('id') as string) || null;
  const payload: any = {
    badge:       (formData.get('badge') as string) || null,
    title:       String(formData.get('title') ?? '').trim(),
    highlight:   (formData.get('highlight') as string) || null,
    subtitle:    (formData.get('subtitle') as string) || null,
    cta_label:   (formData.get('cta_label') as string) || null,
    cta_href:    (formData.get('cta_href') as string) || null,
    image_url:   (formData.get('image_url') as string) || null,
    bg_gradient: (formData.get('bg_gradient') as string) || 'aurora',
    is_active:   formData.get('is_active') === 'on',
    order_index: Number(formData.get('order_index') ?? 0),
  };
  if (!payload.title) throw new Error('Title is required');

  const { error } = id
    ? await sb.from('site_hero_slides').update(payload).eq('id', id)
    : await sb.from('site_hero_slides').insert(payload);
  if (error) { logFailure('saveHeroSlide', error); throw new Error(`فشل الحفظ: ${error.message}`); }

  bumpAll();
  redirect('/admin/cms/hero');
}

export async function deleteHeroSlideAction(formData: FormData) {
  await ensureAdmin();
  const sb = createServiceRoleClient();
  const { error } = await sb.from('site_hero_slides').delete().eq('id', String(formData.get('id')));
  if (error) { logFailure('deleteHeroSlide', error); throw new Error(error.message); }
  bumpAll();
  redirect('/admin/cms/hero');
}

// ============ STATS ============
export async function saveStatAction(formData: FormData) {
  await ensureAdmin();
  const sb = createServiceRoleClient();
  const id = (formData.get('id') as string) || null;
  const payload: any = {
    label:       String(formData.get('label') ?? '').trim(),
    value:       Number(formData.get('value') ?? 0),
    suffix:      (formData.get('suffix') as string) || null,
    source:      (formData.get('source') as string) || 'manual',
    is_active:   formData.get('is_active') === 'on',
    order_index: Number(formData.get('order_index') ?? 0),
  };
  if (!payload.label) throw new Error('Label is required');

  const { error } = id
    ? await sb.from('site_stats').update(payload).eq('id', id)
    : await sb.from('site_stats').insert(payload);
  if (error) { logFailure('saveStat', error); throw new Error(`فشل الحفظ: ${error.message}`); }

  bumpAll();
  redirect('/admin/cms/stats');
}

export async function deleteStatAction(formData: FormData) {
  await ensureAdmin();
  const sb = createServiceRoleClient();
  const { error } = await sb.from('site_stats').delete().eq('id', String(formData.get('id')));
  if (error) { logFailure('deleteStat', error); throw new Error(error.message); }
  bumpAll();
  redirect('/admin/cms/stats');
}

// ============ FEATURES ============
function parseJSON<T>(raw: FormDataEntryValue | null, fallback: T): T {
  try { return JSON.parse(String(raw ?? '')) as T; } catch { return fallback; }
}

export async function saveFeatureAction(formData: FormData) {
  await ensureAdmin();
  const sb = createServiceRoleClient();
  const id = (formData.get('id') as string) || null;
  const payload: any = {
    slug:           String(formData.get('slug') ?? '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    icon:           String(formData.get('icon') ?? 'Users'),
    tone:           (formData.get('tone') as string) || 'from-primary-500 to-violet-500',
    title:          String(formData.get('title') ?? '').trim(),
    short_body:     String(formData.get('short_body') ?? '').trim(),
    is_primary:     formData.get('is_primary') === 'on',
    is_active:      formData.get('is_active') === 'on',
    order_index:    Number(formData.get('order_index') ?? 0),
    hero_subtitle:  (formData.get('hero_subtitle') as string) || null,
    long_body:      (formData.get('long_body') as string) || null,
    highlights:     parseJSON(formData.get('highlights'), []),
    examples:       parseJSON(formData.get('examples'), []),
    faq:            parseJSON(formData.get('faq'), []),
    cta_label:      (formData.get('cta_label') as string) || 'ابدأ مجاناً',
    cta_href:       (formData.get('cta_href') as string) || '/register',
    seo_title:      (formData.get('seo_title') as string) || null,
    seo_desc:       (formData.get('seo_desc') as string) || null,
  };
  if (!payload.title || !payload.slug) throw new Error('Title + slug required');

  const { error } = id
    ? await sb.from('site_features').update(payload).eq('id', id)
    : await sb.from('site_features').insert(payload);
  if (error) { logFailure('saveFeature', error); throw new Error(`فشل الحفظ: ${error.message}`); }

  bumpAll();
  redirect('/admin/cms/features');
}

export async function deleteFeatureAction(formData: FormData) {
  await ensureAdmin();
  const sb = createServiceRoleClient();
  const { error } = await sb.from('site_features').delete().eq('id', String(formData.get('id')));
  if (error) { logFailure('deleteFeature', error); throw new Error(error.message); }
  bumpAll();
  redirect('/admin/cms/features');
}

// ============ TESTIMONIALS ============
export async function saveTestimonialAction(formData: FormData) {
  await ensureAdmin();
  const sb = createServiceRoleClient();
  const id = (formData.get('id') as string) || null;
  const payload: any = {
    name:        String(formData.get('name') ?? '').trim(),
    role:        (formData.get('role') as string) || null,
    body:        String(formData.get('body') ?? '').trim(),
    avatar_url:  (formData.get('avatar_url') as string) || null,
    rating:      Math.max(1, Math.min(5, Number(formData.get('rating') ?? 5))),
    is_active:   formData.get('is_active') === 'on',
    order_index: Number(formData.get('order_index') ?? 0),
  };
  if (!payload.name || !payload.body) throw new Error('Name + body required');

  const { error } = id
    ? await sb.from('site_testimonials').update(payload).eq('id', id)
    : await sb.from('site_testimonials').insert(payload);
  if (error) { logFailure('saveTestimonial', error); throw new Error(`فشل الحفظ: ${error.message}`); }

  bumpAll();
  redirect('/admin/cms/testimonials');
}

export async function deleteTestimonialAction(formData: FormData) {
  await ensureAdmin();
  const sb = createServiceRoleClient();
  const { error } = await sb.from('site_testimonials').delete().eq('id', String(formData.get('id')));
  if (error) { logFailure('deleteTestimonial', error); throw new Error(error.message); }
  bumpAll();
  redirect('/admin/cms/testimonials');
}

// ============ FAQs ============
export async function saveFaqAction(formData: FormData) {
  await ensureAdmin();
  const sb = createServiceRoleClient();
  const id = (formData.get('id') as string) || null;
  const payload: any = {
    question:    String(formData.get('question') ?? '').trim(),
    answer:      String(formData.get('answer') ?? '').trim(),
    is_active:   formData.get('is_active') === 'on',
    order_index: Number(formData.get('order_index') ?? 0),
  };
  if (!payload.question || !payload.answer) throw new Error('Question + answer required');

  const { error } = id
    ? await sb.from('site_faqs').update(payload).eq('id', id)
    : await sb.from('site_faqs').insert(payload);
  if (error) { logFailure('saveFaq', error); throw new Error(`فشل الحفظ: ${error.message}`); }

  bumpAll();
  redirect('/admin/cms/faqs');
}

export async function deleteFaqAction(formData: FormData) {
  await ensureAdmin();
  const sb = createServiceRoleClient();
  const { error } = await sb.from('site_faqs').delete().eq('id', String(formData.get('id')));
  if (error) { logFailure('deleteFaq', error); throw new Error(error.message); }
  bumpAll();
  redirect('/admin/cms/faqs');
}

// ============ PAGES ============
export async function savePageAction(formData: FormData) {
  await ensureAdmin();
  const sb = createServiceRoleClient();
  const id = (formData.get('id') as string) || null;
  const payload: any = {
    slug:         String(formData.get('slug') ?? '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    title:        String(formData.get('title') ?? '').trim(),
    hero_kicker:  (formData.get('hero_kicker') as string) || null,
    body:         String(formData.get('body') ?? ''),
    is_published: formData.get('is_published') === 'on',
    show_in_nav:  formData.get('show_in_nav') === 'on',
    seo_title:    (formData.get('seo_title') as string) || null,
    seo_desc:     (formData.get('seo_desc') as string) || null,
  };
  if (!payload.title || !payload.slug) throw new Error('Title + slug required');

  const { error } = id
    ? await sb.from('site_pages').update(payload).eq('id', id)
    : await sb.from('site_pages').insert(payload);
  if (error) { logFailure('savePage', error); throw new Error(`فشل الحفظ: ${error.message}`); }

  bumpAll();
  redirect('/admin/cms/pages');
}

export async function deletePageAction(formData: FormData) {
  await ensureAdmin();
  const sb = createServiceRoleClient();
  const { error } = await sb.from('site_pages').delete().eq('id', String(formData.get('id')));
  if (error) { logFailure('deletePage', error); throw new Error(error.message); }
  bumpAll();
  redirect('/admin/cms/pages');
}
