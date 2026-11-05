import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function SubdomainHome({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  const supabase = await createClient();
  const { data: teacher } = await supabase
    .from('teachers')
    .select('id, name_ar, phone')
    .eq('subdomain', subdomain)
    .maybeSingle();

  const { data: home } = await supabase
    .from('cms_pages')
    .select('content_ar')
    .eq('teacher_id', teacher?.id ?? '')
    .eq('page_type', 'home')
    .eq('is_published', true)
    .maybeSingle();

  const html = (home?.content_ar as any[])?.[0]?.html;

  if (html) {
    return <article className="prose prose-neutral max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <div className="text-center py-16">
      <h2 className="text-3xl font-bold" style={{ color: 'var(--theme-primary)' }}>أهلاً بكم</h2>
      <p className="mt-3 text-neutral-600">{teacher?.name_ar} يقدّم خدمات تعليمية متميزة.</p>
      {teacher?.phone && (
        <a
          href={`tel:${teacher.phone}`}
          className="mt-6 inline-block px-5 py-2.5 rounded-card text-white"
          style={{ backgroundColor: 'var(--theme-primary)' }}
        >
          تواصل: {teacher.phone}
        </a>
      )}
    </div>
  );
}
