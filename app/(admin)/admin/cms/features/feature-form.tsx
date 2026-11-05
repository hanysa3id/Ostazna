'use client';

import { useState } from 'react';
import { Field, TextArea, Toggle, Select } from '@/components/admin/cms-form-fields';
import { saveFeatureAction } from '../actions';

const ICON_NAMES = [
  'Users','GraduationCap','CalendarClock','Wallet','Globe','Bell','FileText','ShieldCheck',
  'BarChart3','Upload','Search','Archive','User','Repeat','LayoutGrid','Printer','Palette','Link',
  'TrendingUp','AlertTriangle',
];

const TONES = [
  'from-primary-500 to-violet-500',
  'from-cyan-500 to-primary-500',
  'from-accent-500 to-cyan-500',
  'from-violet-500 to-primary-700',
  'from-secondary-500 to-accent-500',
  'from-violet-500 to-cyan-500',
  'from-primary-500 to-cyan-500',
  'from-accent-500 to-primary-500',
];

type Highlight = { title: string; desc: string; icon: string };
type Example   = { title: string; desc: string; image_url?: string };
type Faq       = { q: string; a: string };

export function FeatureForm({ initial }: { initial?: any }) {
  const [highlights, setHighlights] = useState<Highlight[]>(initial?.highlights ?? []);
  const [examples,   setExamples]   = useState<Example[]>(initial?.examples ?? []);
  const [faq,        setFaq]        = useState<Faq[]>(initial?.faq ?? []);
  const [tone,       setTone]       = useState<string>(initial?.tone ?? TONES[0]);

  return (
    <form action={saveFeatureAction} className="bg-white rounded-2xl border border-primary-100 p-6 space-y-5">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="highlights" value={JSON.stringify(highlights.filter(h => h.title.trim()))} />
      <input type="hidden" name="examples" value={JSON.stringify(examples.filter(e => e.title.trim()))} />
      <input type="hidden" name="faq" value={JSON.stringify(faq.filter(f => f.q.trim()))} />
      <input type="hidden" name="tone" value={tone} />

      {/* Basic */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-primary-900 mb-2">الأساسيات</legend>
        <div className="grid grid-cols-2 gap-3">
          <Field name="title" label="العنوان" required defaultValue={initial?.title} />
          <Field name="slug" label="الـ Slug (للرابط)" required defaultValue={initial?.slug} hint="حروف لاتينية صغيرة وأرقام و - فقط" />
        </div>
        <TextArea name="short_body" label="الوصف القصير (للبطاقة)" rows={2} defaultValue={initial?.short_body} />

        <div className="grid grid-cols-2 gap-3">
          <Select name="icon" label="الأيقونة" defaultValue={initial?.icon ?? 'Users'} options={ICON_NAMES.map(i => ({ value: i, label: i }))} />
          <div>
            <label className="block text-sm font-medium text-primary-900 mb-1.5">الـ Gradient</label>
            <div className="grid grid-cols-4 gap-2">
              {TONES.map(t => (
                <button
                  type="button" key={t} onClick={() => setTone(t)}
                  className={`h-10 rounded-card bg-gradient-to-br ${t} ring-2 transition ${tone === t ? 'ring-violet-500 ring-offset-2' : 'ring-transparent'}`}
                  aria-label={t}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field name="order_index" label="الترتيب" type="number" defaultValue={String(initial?.order_index ?? 99)} />
          <Toggle name="is_primary" label="ميزة أساسية (لها صفحة داخلية)" defaultChecked={initial?.is_primary ?? true} />
          <Toggle name="is_active" label="نشطة" defaultChecked={initial?.is_active ?? true} />
        </div>
      </fieldset>

      {/* Internal page */}
      <fieldset className="space-y-4 border-t border-primary-100 pt-5">
        <legend className="text-sm font-semibold text-primary-900 mb-2">الصفحة الداخلية</legend>
        <Field name="hero_subtitle" label="عنوان فرعي (Hero)" defaultValue={initial?.hero_subtitle ?? ''} />
        <TextArea name="long_body" label="الشرح المطوّل" rows={4} defaultValue={initial?.long_body ?? ''} />

        <DynamicList
          title="المزايا الرئيسية (Highlights)"
          items={highlights}
          onChange={setHighlights}
          fields={[
            { key: 'title', label: 'العنوان' },
            { key: 'desc', label: 'الوصف' },
            { key: 'icon', label: 'الأيقونة' },
          ]}
          add={() => ({ title: '', desc: '', icon: 'CheckCircle2' })}
        />

        <DynamicList
          title="أمثلة من الواقع"
          items={examples}
          onChange={setExamples}
          fields={[
            { key: 'title', label: 'العنوان' },
            { key: 'desc', label: 'الوصف' },
            { key: 'image_url', label: 'رابط الصورة (اختياري)' },
          ]}
          add={() => ({ title: '', desc: '', image_url: '' })}
        />

        <DynamicList
          title="الأسئلة الشائعة"
          items={faq}
          onChange={setFaq}
          fields={[
            { key: 'q', label: 'السؤال' },
            { key: 'a', label: 'الجواب', textarea: true },
          ]}
          add={() => ({ q: '', a: '' })}
        />

        <div className="grid grid-cols-2 gap-3">
          <Field name="cta_label" label="نص زر CTA" defaultValue={initial?.cta_label ?? 'ابدأ مجاناً'} />
          <Field name="cta_href"  label="رابط زر CTA" defaultValue={initial?.cta_href ?? '/register'} />
        </div>
      </fieldset>

      {/* SEO */}
      <fieldset className="space-y-4 border-t border-primary-100 pt-5">
        <legend className="text-sm font-semibold text-primary-900 mb-2">SEO</legend>
        <Field name="seo_title" label="SEO Title" defaultValue={initial?.seo_title ?? ''} />
        <TextArea name="seo_desc" label="SEO Description" rows={2} defaultValue={initial?.seo_desc ?? ''} />
      </fieldset>

      <button className="w-full px-4 py-3 rounded-card bg-primary-700 text-white font-medium">حفظ الميزة</button>
    </form>
  );
}

function DynamicList<T extends Record<string, string>>({
  title, items, onChange, fields, add,
}: {
  title: string;
  items: T[];
  onChange: (items: T[]) => void;
  fields: { key: string; label: string; textarea?: boolean }[];
  add: () => T;
}) {
  function update(i: number, key: string, value: string) {
    onChange(items.map((it, j) => (j === i ? { ...it, [key]: value } : it)));
  }
  function remove(i: number) { onChange(items.filter((_, j) => j !== i)); }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-primary-900">{title}</label>
        <button type="button" onClick={() => onChange([...items, add()])} className="text-xs text-violet-600">+ إضافة عنصر</button>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-primary-400 italic">لا توجد عناصر بعد.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="bg-primary-50/40 border border-primary-100 rounded-xl p-3 space-y-2">
              {fields.map(f => f.textarea ? (
                <textarea
                  key={f.key}
                  value={(item as any)[f.key] ?? ''}
                  onChange={e => update(i, f.key, e.target.value)}
                  placeholder={f.label} rows={2}
                  className="w-full px-2 py-1.5 rounded border border-primary-200 text-sm"
                />
              ) : (
                <input
                  key={f.key}
                  value={(item as any)[f.key] ?? ''}
                  onChange={e => update(i, f.key, e.target.value)}
                  placeholder={f.label}
                  className="w-full px-2 py-1.5 rounded border border-primary-200 text-sm"
                />
              ))}
              <button type="button" onClick={() => remove(i)} className="text-xs text-red-600">حذف</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
