import Link from 'next/link';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { Image, BarChart3, Layers, MessageSquare, HelpCircle, FileEdit, ExternalLink, type LucideIcon } from 'lucide-react';

export const metadata = { title: 'إدارة المحتوى' };
export const dynamic = 'force-dynamic';

export default async function CmsIndexPage() {
  const sb = createServiceRoleClient();
  const [
    { count: heroes }, { count: stats }, { count: features },
    { count: testimonials }, { count: faqs }, { count: pages },
  ] = await Promise.all([
    sb.from('site_hero_slides').select('id', { head: true, count: 'exact' }),
    sb.from('site_stats').select('id', { head: true, count: 'exact' }),
    sb.from('site_features').select('id', { head: true, count: 'exact' }),
    sb.from('site_testimonials').select('id', { head: true, count: 'exact' }),
    sb.from('site_faqs').select('id', { head: true, count: 'exact' }),
    sb.from('site_pages').select('id', { head: true, count: 'exact' }),
  ]);

  const cards: { href: string; icon: LucideIcon; title: string; desc: string; count: number; tone: string }[] = [
    { href: '/admin/cms/hero',         icon: Image,         title: 'الـ Hero / Sliders', desc: 'الشرائح المتحركة في أعلى الصفحة الرئيسية.', count: heroes ?? 0,       tone: 'from-violet-500 to-primary-500' },
    { href: '/admin/cms/stats',        icon: BarChart3,     title: 'الإحصائيات',         desc: '4 بطاقات الأرقام الكبيرة (تدعم الأرقام الحقيقية).',  count: stats ?? 0,        tone: 'from-cyan-500 to-primary-500' },
    { href: '/admin/cms/features',     icon: Layers,        title: 'المزايا',            desc: 'بطاقات المزايا + صفحاتها الداخلية.',         count: features ?? 0,     tone: 'from-accent-500 to-cyan-500' },
    { href: '/admin/cms/testimonials', icon: MessageSquare, title: 'آراء العملاء',       desc: 'تعليقات المدرسين بصورهم.',                 count: testimonials ?? 0, tone: 'from-secondary-500 to-accent-500' },
    { href: '/admin/cms/faqs',         icon: HelpCircle,    title: 'الأسئلة الشائعة',     desc: 'سؤال وجواب في أسفل الصفحة الرئيسية.',         count: faqs ?? 0,         tone: 'from-violet-500 to-cyan-500' },
    { href: '/admin/cms/pages',        icon: FileEdit,      title: 'صفحات مخصصة',         desc: 'أضف صفحات تسويقية جديدة بحرية.',          count: pages ?? 0,        tone: 'from-primary-500 to-violet-700' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-900">إدارة محتوى الموقع</h1>
          <p className="mt-2 text-primary-700/80">تحكّم كامل في كل ما يظهر للزوار. التغييرات تنعكس فوراً على الموقع العام.</p>
        </div>
        <Link href="/" target="_blank" className="text-sm px-4 py-2 rounded-card border border-primary-200 hover:bg-primary-50 inline-flex items-center gap-1.5">
          <ExternalLink className="w-3.5 h-3.5" /> فتح الموقع العام
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(c => (
          <Link key={c.href} href={c.href} className="card-lift group relative h-full p-6 rounded-2xl bg-white border border-primary-100 overflow-hidden">
            <div className={`absolute -top-12 -end-12 w-32 h-32 rounded-full bg-gradient-to-br ${c.tone} opacity-10 group-hover:opacity-30 transition`} />
            <div className="relative flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.tone} text-white grid place-items-center shadow-soft`}>
                <c.icon className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-primary-900 tabular-nums">{c.count}</span>
            </div>
            <h3 className="font-semibold text-primary-900 text-lg">{c.title}</h3>
            <p className="mt-1.5 text-sm text-primary-700/80 leading-relaxed">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
