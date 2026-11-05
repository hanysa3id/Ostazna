import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function SubdomainSlugPage({
  params,
}: { params: Promise<{ subdomain: string; slug: string }> }) {
  const { subdomain, slug } = await params;
  const supabase = await createClient();
  const { data: teacher } = await supabase
    .from('teachers')
    .select('id')
    .eq('subdomain', subdomain)
    .maybeSingle();
  if (!teacher) notFound();

  const { data: page } = await supabase
    .from('cms_pages')
    .select('title_ar, content_ar')
    .eq('teacher_id', teacher.id)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (!page) notFound();

  const html = (page.content_ar as any[])?.[0]?.html ?? '';
  return (
    <article className="prose prose-neutral max-w-none">
      <h1 style={{ color: 'var(--theme-primary)' }}>{page.title_ar}</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
