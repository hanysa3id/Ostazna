import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function SubdomainLayout({
  children, params,
}: { children: React.ReactNode; params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  const supabase = await createClient();

  const [{ data: teacher }, { data: settings }, { data: pages }] = await Promise.all([
    supabase.from('teachers').select('id, name_ar, name_en, avatar_url, phone, subdomain').eq('subdomain', subdomain).maybeSingle(),
    supabase.from('cms_settings').select('*').eq('teacher_id', (await supabase.from('teachers').select('id').eq('subdomain', subdomain).maybeSingle()).data?.id ?? '').maybeSingle(),
    supabase.from('cms_pages').select('slug, title_ar').eq('is_published', true).order('order_index'),
  ]);
  if (!teacher) notFound();

  const t = settings?.theme_config ?? { primary: '#1E3A5F', secondary: '#F5A623', accent: '#2ECC71' };

  return (
    <div className="min-h-dvh bg-bg" style={{ ['--theme-primary' as any]: t.primary, ['--theme-secondary' as any]: t.secondary, ['--theme-accent' as any]: t.accent }}>
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center gap-4">
          {settings?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : teacher.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={teacher.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div
              className="w-12 h-12 rounded-full grid place-items-center font-bold text-white"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              {teacher.name_ar?.[0]}
            </div>
          )}
          <div className="flex-1">
            <h1 className="font-semibold text-lg" style={{ color: 'var(--theme-primary)' }}>{teacher.name_ar}</h1>
            {teacher.name_en && <p className="text-xs text-neutral-500">{teacher.name_en}</p>}
          </div>
          <nav className="hidden sm:flex items-center gap-4 text-sm">
            <Link href="/" className="text-neutral-700 hover:underline">الرئيسية</Link>
            {(pages ?? []).map(p => (
              <Link key={p.slug} href={`/${p.slug}`} className="text-neutral-700 hover:underline">{p.title_ar}</Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
      <footer className="mt-10 border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-6 text-xs text-neutral-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} {teacher.name_ar}</span>
          <div className="flex items-center gap-3">
            {settings?.social_links?.facebook && <a href={settings.social_links.facebook} target="_blank" rel="noopener">فيسبوك</a>}
            {settings?.social_links?.youtube && <a href={settings.social_links.youtube} target="_blank" rel="noopener">يوتيوب</a>}
            {settings?.social_links?.instagram && <a href={settings.social_links.instagram} target="_blank" rel="noopener">إنستجرام</a>}
            {settings?.social_links?.whatsapp && <a href={`https://wa.me/${settings.social_links.whatsapp}`} target="_blank" rel="noopener">واتساب</a>}
          </div>
        </div>
      </footer>
    </div>
  );
}
