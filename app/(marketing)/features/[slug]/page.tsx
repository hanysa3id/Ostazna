import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle2, type LucideIcon } from 'lucide-react';
import {
  Users, GraduationCap, CalendarClock, Wallet, Globe, Bell, FileText, ShieldCheck,
  BarChart3, Upload, Search, Archive, User, Repeat, LayoutGrid, Printer, Palette, Link as LinkIcon,
  TrendingUp, AlertTriangle,
} from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { Reveal } from '@/components/ui/reveal';
import { GridPattern, Blobs } from '@/components/ui/bg-pattern';
import { getFeatureBySlug, getFeatures } from '@/lib/dal/site-cms';

const ICONS: Record<string, LucideIcon> = {
  Users, GraduationCap, CalendarClock, Wallet, Globe, Bell, FileText, ShieldCheck,
  BarChart3, Upload, Search, Archive, User, Repeat, LayoutGrid, Printer, Palette, Link: LinkIcon,
  TrendingUp, AlertTriangle,
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = await getFeatureBySlug(slug);
  if (!f) return { title: 'الميزة غير موجودة' };
  return {
    title: f.seo_title ?? f.title,
    description: f.seo_desc ?? f.short_body,
  };
}

export default async function FeaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const feature = await getFeatureBySlug(slug);
  if (!feature) notFound();

  const allFeatures = await getFeatures({ primary: true });
  const others = allFeatures.filter(f => f.slug !== slug).slice(0, 3);

  const Icon = ICONS[feature.icon] ?? Users;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden pt-12 pb-20">
        <GridPattern />
        <Blobs />

        <div className="relative mx-auto max-w-5xl px-6">
          <Reveal>
            <Link href="/#features" className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-violet-600 mb-8">
              <ArrowRight className="w-4 h-4" /> العودة للمزايا
            </Link>
          </Reveal>

          <div className="grid lg:grid-cols-[auto,1fr] gap-8 items-center">
            <Reveal>
              <div className={`relative w-24 h-24 rounded-3xl bg-gradient-to-br ${feature.tone} text-white grid place-items-center shadow-glow`}>
                <Icon className="w-12 h-12" />
                <span className="absolute -inset-1 rounded-3xl border border-white/40 animate-pulse-soft" />
              </div>
            </Reveal>

            <div>
              <Reveal delay={0.1}>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-medium border border-violet-200">
                  <Sparkles className="w-3.5 h-3.5" /> ميزة أساسية
                </span>
              </Reveal>
              <Reveal delay={0.15}>
                <h1 className="mt-4 text-4xl sm:text-5xl font-bold text-primary-900">{feature.title}</h1>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="mt-3 text-lg text-primary-700/80">{feature.hero_subtitle ?? feature.short_body}</p>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="mt-6 flex flex-wrap gap-3">
                  <GradientButton href={feature.cta_href} variant="aurora" size="lg">
                    {feature.cta_label}
                    <ArrowLeft className="w-4 h-4" />
                  </GradientButton>
                  <GradientButton href="/pricing" variant="outline" size="lg">
                    اطّلع على الأسعار
                  </GradientButton>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* LONG DESCRIPTION */}
      {feature.long_body && (
        <section className="py-12">
          <div className="mx-auto max-w-3xl px-6">
            <Reveal>
              <div className="prose prose-neutral max-w-none text-primary-800 text-lg leading-relaxed">
                <p>{feature.long_body}</p>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* HIGHLIGHTS */}
      {feature.highlights.length > 0 && (
        <section className="py-20 bg-mesh-cool relative">
          <div className="mx-auto max-w-7xl px-6">
            <Reveal className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-semibold text-cyan-700 tracking-wider uppercase">المزايا الرئيسية</span>
              <h2 className="mt-2 text-3xl font-bold text-primary-900">ماذا ستحصل عليه</h2>
            </Reveal>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {feature.highlights.map((h, i) => {
                const HIcon = ICONS[h.icon] ?? CheckCircle2;
                return (
                  <Reveal key={i} delay={i * 0.08}>
                    <div className="h-full p-5 rounded-2xl bg-white border border-primary-100 card-lift">
                      <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-700 grid place-items-center mb-3">
                        <HIcon className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-primary-900">{h.title}</h3>
                      <p className="mt-1.5 text-sm text-primary-700/80 leading-relaxed">{h.desc}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* EXAMPLES */}
      {feature.examples.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-6">
            <Reveal className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-semibold text-violet-600 tracking-wider uppercase">استخدامات حقيقية</span>
              <h2 className="mt-2 text-3xl font-bold text-primary-900">أمثلة من الواقع</h2>
            </Reveal>

            <div className="space-y-6">
              {feature.examples.map((ex, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div className={`grid gap-6 lg:grid-cols-2 items-center ${i % 2 === 1 ? 'lg:[direction:rtl]' : ''}`}>
                    <div>
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${feature.tone} text-white grid place-items-center font-bold mb-4`}>
                        {i + 1}
                      </div>
                      <h3 className="text-2xl font-bold text-primary-900">{ex.title}</h3>
                      <p className="mt-3 text-primary-700/80 leading-relaxed">{ex.desc}</p>
                    </div>
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-mesh-cool border border-primary-100 grid place-items-center">
                      {ex.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ex.image_url} alt={ex.title} className="w-full h-full object-cover" />
                      ) : (
                        <Icon className="w-20 h-20 text-primary-200" />
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MINI FAQ */}
      {feature.faq.length > 0 && (
        <section className="py-20 bg-mesh-cool">
          <div className="mx-auto max-w-3xl px-6">
            <Reveal className="text-center mb-10">
              <h2 className="text-3xl font-bold text-primary-900">أسئلة شائعة</h2>
            </Reveal>
            <div className="space-y-3">
              {feature.faq.map((q, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <details className="group rounded-2xl bg-white border border-primary-100 overflow-hidden">
                    <summary className="cursor-pointer p-5 flex items-center justify-between gap-4 select-none">
                      <span className="font-semibold text-primary-900">{q.q}</span>
                      <span className="w-8 h-8 rounded-full bg-primary-50 text-primary-700 grid place-items-center text-lg group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <div className="px-5 pb-5 text-primary-700/80 leading-relaxed text-sm">{q.a}</div>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="relative rounded-3xl overflow-hidden p-10 sm:p-14 text-center [background-image:var(--gradient-aurora)] shadow-large">
              <div className="absolute inset-0 bg-dot-grid opacity-20" />
              <span className="blob bg-cyan-300/40 w-72 h-72 -top-20 -start-20" />
              <span className="blob bg-violet-300/40 w-72 h-72 bottom-0 -end-20" />

              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold text-white">جرّب {feature.title} الآن</h2>
                <p className="mt-3 text-white/80 max-w-lg mx-auto">حساب مجاني خلال دقيقة، بدون بطاقة ائتمان.</p>
                <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
                  <GradientButton href={feature.cta_href} variant="glass" size="lg">
                    {feature.cta_label}
                    <ArrowLeft className="w-4 h-4" />
                  </GradientButton>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* OTHER FEATURES */}
      {others.length > 0 && (
        <section className="pb-24">
          <div className="mx-auto max-w-7xl px-6">
            <Reveal className="text-center mb-10">
              <h2 className="text-2xl font-bold text-primary-900">اكتشف ميزات أخرى</h2>
            </Reveal>
            <div className="grid gap-5 sm:grid-cols-3">
              {others.map((o, i) => {
                const OIcon = ICONS[o.icon] ?? Users;
                return (
                  <Reveal key={o.id} delay={i * 0.08}>
                    <Link href={`/features/${o.slug}`} className="card-lift block h-full p-5 rounded-2xl bg-white border border-primary-100 group">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${o.tone} text-white grid place-items-center mb-3`}>
                        <OIcon className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-primary-900">{o.title}</h3>
                      <p className="mt-1.5 text-sm text-primary-700/80 line-clamp-2">{o.short_body}</p>
                      <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-violet-600 font-medium opacity-0 group-hover:opacity-100 transition">
                        اعرف أكثر <ArrowLeft className="w-3 h-3" />
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
