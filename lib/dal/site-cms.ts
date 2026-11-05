import { createServiceRoleClient } from '@/lib/supabase/server';

// All read functions use the service-role client because the marketing site is public
// and we don't want a logged-out user's RLS context to interfere.
//
// We deliberately DO NOT use `unstable_cache` here — the dataset is small (a few rows
// per table), and admin edits should be visible immediately. Page-level ISR via
// `export const revalidate` on the route still gives us most of the cache benefit,
// and `revalidatePath('/', 'layout')` from admin actions invalidates it cleanly.

export type HeroSlide = {
  id: string;
  badge: string | null;
  title: string;
  highlight: string | null;
  subtitle: string | null;
  cta_label: string | null;
  cta_href: string | null;
  image_url: string | null;
  bg_gradient: string;
  is_active: boolean;
  order_index: number;
};

export type SiteStat = {
  id: string;
  label: string;
  value: number;
  suffix: string | null;
  source: 'manual' | 'live_teachers' | 'live_students' | 'live_uptime';
  is_active: boolean;
  order_index: number;
};

export type SiteFeature = {
  id: string;
  slug: string;
  icon: string;
  tone: string;
  title: string;
  short_body: string;
  is_primary: boolean;
  is_active: boolean;
  order_index: number;
  hero_subtitle: string | null;
  long_body: string | null;
  highlights: { title: string; desc: string; icon: string }[];
  examples: { title: string; desc: string; image_url?: string }[];
  faq: { q: string; a: string }[];
  cta_label: string;
  cta_href: string;
  seo_title: string | null;
  seo_desc: string | null;
};

export type SiteTestimonial = {
  id: string;
  name: string;
  role: string | null;
  body: string;
  avatar_url: string | null;
  rating: number;
  is_active: boolean;
  order_index: number;
};

export type SiteFaq = {
  id: string;
  question: string;
  answer: string;
  is_active: boolean;
  order_index: number;
};

export type SitePage = {
  id: string;
  slug: string;
  title: string;
  hero_kicker: string | null;
  body: string;
  is_published: boolean;
  show_in_nav: boolean;
  seo_title: string | null;
  seo_desc: string | null;
};

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const sb = createServiceRoleClient();
  const { data, error } = await sb
    .from('site_hero_slides')
    .select('*')
    .eq('is_active', true)
    .order('order_index');
  if (error) {
    console.error('[site-cms] getHeroSlides:', error.message);
    return [];
  }
  return (data ?? []) as HeroSlide[];
}

export async function getStats(): Promise<SiteStat[]> {
  const sb = createServiceRoleClient();
  const { data: configured, error } = await sb
    .from('site_stats')
    .select('*')
    .eq('is_active', true)
    .order('order_index');
  if (error) { console.error('[site-cms] getStats:', error.message); return []; }
  if (!configured || configured.length === 0) return [];

  const resolved = await Promise.all(
    configured.map(async (s: any) => {
      try {
        if (s.source === 'live_teachers') {
          const { count } = await sb.from('teachers').select('id', { head: true, count: 'exact' });
          return { ...s, value: Math.max(s.value, count ?? 0) };
        }
        if (s.source === 'live_students') {
          const { count } = await sb
            .from('students')
            .select('id', { head: true, count: 'exact' })
            .is('archived_at', null);
          return { ...s, value: Math.max(s.value, count ?? 0) };
        }
      } catch (err) {
        console.error('[site-cms] live stat resolve:', err);
      }
      return s;
    })
  );
  return resolved as SiteStat[];
}

export async function getFeatures(opts: { primary?: boolean } = {}): Promise<SiteFeature[]> {
  const sb = createServiceRoleClient();
  let q = sb.from('site_features').select('*').eq('is_active', true);
  if (opts.primary !== undefined) q = q.eq('is_primary', opts.primary);
  const { data, error } = await q.order('order_index');
  if (error) { console.error('[site-cms] getFeatures:', error.message); return []; }
  return (data ?? []) as SiteFeature[];
}

export async function getFeatureBySlug(slug: string): Promise<SiteFeature | null> {
  const sb = createServiceRoleClient();
  const { data, error } = await sb
    .from('site_features')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  if (error) { console.error('[site-cms] getFeatureBySlug:', error.message); return null; }
  return (data as SiteFeature) ?? null;
}

export async function getTestimonials(): Promise<SiteTestimonial[]> {
  const sb = createServiceRoleClient();
  const { data, error } = await sb
    .from('site_testimonials')
    .select('*')
    .eq('is_active', true)
    .order('order_index');
  if (error) { console.error('[site-cms] getTestimonials:', error.message); return []; }
  return (data ?? []) as SiteTestimonial[];
}

export async function getFaqs(): Promise<SiteFaq[]> {
  const sb = createServiceRoleClient();
  const { data, error } = await sb
    .from('site_faqs')
    .select('*')
    .eq('is_active', true)
    .order('order_index');
  if (error) { console.error('[site-cms] getFaqs:', error.message); return []; }
  return (data ?? []) as SiteFaq[];
}

export async function getPublishedPages(): Promise<SitePage[]> {
  const sb = createServiceRoleClient();
  const { data, error } = await sb
    .from('site_pages')
    .select('id, slug, title, hero_kicker, body, is_published, show_in_nav, seo_title, seo_desc')
    .eq('is_published', true)
    .order('title');
  if (error) { console.error('[site-cms] getPublishedPages:', error.message); return []; }
  return (data ?? []) as SitePage[];
}

export async function getPageBySlug(slug: string): Promise<SitePage | null> {
  const sb = createServiceRoleClient();
  const { data, error } = await sb
    .from('site_pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (error) { console.error('[site-cms] getPageBySlug:', error.message); return null; }
  return (data as SitePage) ?? null;
}
