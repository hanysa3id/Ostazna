import { notFound } from 'next/navigation';
import { Reveal } from '@/components/ui/reveal';
import { GridPattern } from '@/components/ui/bg-pattern';
import { getPageBySlug, getPublishedPages } from '@/lib/dal/site-cms';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return { title: 'صفحة غير موجودة' };
  return {
    title: page.seo_title ?? page.title,
    description: page.seo_desc ?? undefined,
  };
}

export default async function CustomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  return (
    <>
      <section className="relative overflow-hidden pt-16 pb-12">
        <GridPattern />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          {page.hero_kicker && (
            <Reveal>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-medium border border-violet-200">
                {page.hero_kicker}
              </span>
            </Reveal>
          )}
          <Reveal delay={0.1}>
            <h1 className="mt-5 text-4xl sm:text-5xl font-bold text-primary-900">{page.title}</h1>
          </Reveal>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <article
              className="prose prose-neutral max-w-none text-primary-800"
              dangerouslySetInnerHTML={{ __html: page.body }}
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
