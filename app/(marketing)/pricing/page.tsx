import { Check, Sparkles, X } from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { Reveal, RevealStagger, RevealItem } from '@/components/ui/reveal';
import { GridPattern } from '@/components/ui/bg-pattern';

const TIERS = [
  {
    key: 'free',    name: 'مجاني',    price: 0,    cap: 20,   highlight: false,
    blurb: 'ابدأ تجربتك بدون أي مخاطرة.',
    features: ['حتى ٢٠ طالب', 'إدارة كاملة للحضور والمدفوعات', 'موقع شخصي تلقائي', '٥٠ رسالة واتساب/شهر'],
  },
  {
    key: 'basic',   name: 'أساسي',    price: 300,  cap: 100,  highlight: false,
    blurb: 'للمدرس بعدد طلاب متوسط.',
    features: ['حتى ١٠٠ طالب', 'كل مزايا المجاني', '٢٠٠ رسالة واتساب/شهر', 'دعم بالإيميل خلال ٢٤ساعة'],
  },
  {
    key: 'pro',     name: 'احترافي',  price: 700,  cap: 500,  highlight: true,
    blurb: 'للمدرس الكامل التركيز.',
    features: ['حتى ٥٠٠ طالب', 'فواتير رسمية PDF', 'تقارير متقدّمة + Charts', 'Theme Builder كامل', '١٠٠٠ رسالة واتساب/شهر', 'دعم أولوية'],
  },
  {
    key: 'premium', name: 'بريميوم',  price: 1200, cap: null, highlight: false,
    blurb: 'كل المميزات بدون حدود.',
    features: ['طلاب بدون حد', 'كل الـ Add-ons مفعّلة', 'بوابة ولي الأمر', 'حساب مساعد/سكرتارية', 'دومين مخصص', 'مدير حساب مخصص'],
  },
];

const COMPARISON = [
  { feat: 'سقف الطلاب', free: '٢٠', basic: '١٠٠', pro: '٥٠٠', premium: '∞' },
  { feat: 'إدارة الحصص والحضور', free: true, basic: true, pro: true, premium: true },
  { feat: 'تسجيل المدفوعات', free: true, basic: true, pro: true, premium: true },
  { feat: 'موقع شخصي بـ Subdomain', free: true, basic: true, pro: true, premium: true },
  { feat: 'إشعارات المنصة + Web Push', free: true, basic: true, pro: true, premium: true },
  { feat: 'استيراد طلاب CSV', free: true, basic: true, pro: true, premium: true },
  { feat: 'الفواتير الرسمية PDF', free: false, basic: false, pro: true, premium: true },
  { feat: 'تقارير متقدّمة بـ Charts', free: false, basic: false, pro: true, premium: true },
  { feat: 'Theme Builder كامل', free: false, basic: false, pro: true, premium: true },
  { feat: 'الاختبارات الإلكترونية', free: false, basic: false, pro: false, premium: true },
  { feat: 'بوابة ولي الأمر', free: false, basic: false, pro: false, premium: true },
  { feat: 'حساب مساعد/سكرتارية', free: false, basic: false, pro: false, premium: true },
  { feat: 'دومين مخصص', free: false, basic: false, pro: false, premium: true },
  { feat: 'سقف رسائل واتساب/شهر', free: '٥٠', basic: '٢٠٠', pro: '١٠٠٠', premium: '∞' },
];

export default function PricingPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative pt-16 pb-12 overflow-hidden">
        <GridPattern />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs font-medium border border-violet-200">
              <Sparkles className="w-3.5 h-3.5" /> أسعار شفافة بالكامل
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-5 text-4xl sm:text-5xl font-bold text-primary-900">خطط بسيطة، <span className="text-gradient-cool">بدون مفاجآت</span></h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 text-lg text-primary-700/80">ابدأ مجاناً، طوّر اشتراكك حسب نمو طلابك. ألغ متى شئت.</p>
          </Reveal>
        </div>
      </section>

      {/* TIERS */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-6">
          <RevealStagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {TIERS.map(tier => (
              <RevealItem key={tier.key}>
                <div className={`relative h-full rounded-3xl p-6 flex flex-col card-lift transition ${
                  tier.highlight
                    ? 'border-2 border-violet-300 bg-white shadow-glow ring-1 ring-violet-100'
                    : 'border border-primary-100 bg-white'
                }`}>
                  {tier.highlight && (
                    <span className="absolute -top-3 start-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold text-white [background-image:var(--gradient-aurora)] shadow-glow uppercase tracking-wider">
                      الأكثر شعبية
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-primary-900">{tier.name}</h3>
                  <p className="mt-1 text-sm text-primary-500 min-h-10">{tier.blurb}</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-primary-900">{tier.price}</span>
                    <span className="text-sm text-primary-500">ج/شهر</span>
                  </div>

                  <ul className="mt-6 space-y-2.5 text-sm text-primary-800 flex-1">
                    {tier.features.map(f => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-accent-500/10 text-accent-600 grid place-items-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <GradientButton href="/register" variant={tier.highlight ? 'aurora' : 'outline'} className="mt-7 w-full">
                    اختر الخطة
                  </GradientButton>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="py-20 bg-mesh-cool">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="text-center mb-10">
            <h2 className="text-3xl font-bold text-primary-900">مقارنة الخطط</h2>
            <p className="mt-2 text-primary-700/80">كل ما تحصل عليه في كل خطة، مع التفاصيل الكاملة.</p>
          </Reveal>

          <Reveal>
            <div className="bg-white rounded-3xl border border-primary-100 overflow-hidden shadow-medium">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-primary-50/50">
                    <tr>
                      <th className="text-start px-5 py-4 font-semibold text-primary-900">الميزة</th>
                      <th className="px-5 py-4 font-semibold text-primary-900 text-center">مجاني</th>
                      <th className="px-5 py-4 font-semibold text-primary-900 text-center">أساسي</th>
                      <th className="px-5 py-4 font-semibold text-violet-700 text-center bg-violet-50/50">احترافي</th>
                      <th className="px-5 py-4 font-semibold text-primary-900 text-center">بريميوم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-50">
                    {COMPARISON.map((row, i) => (
                      <tr key={i} className="hover:bg-primary-50/30 transition">
                        <td className="px-5 py-3.5 text-primary-800 font-medium">{row.feat}</td>
                        <Cell v={row.free} />
                        <Cell v={row.basic} />
                        <Cell v={row.pro} highlight />
                        <Cell v={row.premium} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <h2 className="text-3xl font-bold text-primary-900">جاهز للبدء؟</h2>
            <p className="mt-3 text-primary-700/80">سجّل الآن مجاناً وابدأ في إدارة طلابك خلال دقائق.</p>
            <GradientButton href="/register" variant="aurora" size="lg" className="mt-7">
              ابدأ مجاناً
            </GradientButton>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function Cell({ v, highlight }: { v: string | boolean; highlight?: boolean }) {
  return (
    <td className={`px-5 py-3.5 text-center ${highlight ? 'bg-violet-50/30' : ''}`}>
      {typeof v === 'boolean' ? (
        v ? <Check className="w-5 h-5 text-accent-500 mx-auto" /> : <X className="w-4 h-4 text-primary-300 mx-auto" />
      ) : (
        <span className="font-medium text-primary-900">{v}</span>
      )}
    </td>
  );
}
