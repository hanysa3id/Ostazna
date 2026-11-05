'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { completeOnboarding } from './actions';

const STEPS = ['profile', 'year', 'group', 'subdomain'] as const;
type StepKey = typeof STEPS[number];

type State = {
  name_ar: string;
  name_en: string;
  phone: string;
  year_name: string;
  year_start: string;
  year_end: string;
  group_name: string;
  grade_name: string;
  subject_name: string;
  pricing: 'monthly' | 'per_session';
  price: string;
  subdomain: string;
};

export function OnboardingWizard({ initialName, email }: { initialName: string; email: string }) {
  const t = useTranslations('onboarding');
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [stepIdx, setStepIdx] = useState(0);

  const thisYear = new Date().getFullYear();
  const defaultSubdomain = email.split('@')[0].toLowerCase().replace(/[^a-z0-9-]/g, '');

  const [state, setState] = useState<State>({
    name_ar: initialName,
    name_en: '',
    phone: '',
    year_name: `${thisYear}-${thisYear + 1}`,
    year_start: `${thisYear}-09-01`,
    year_end: `${thisYear + 1}-06-30`,
    group_name: '',
    grade_name: 'الصف الأول الثانوي',
    subject_name: 'الرياضيات',
    pricing: 'monthly',
    price: '500',
    subdomain: defaultSubdomain,
  });

  const step = STEPS[stepIdx];

  function set<K extends keyof State>(key: K, val: State[K]) {
    setState(s => ({ ...s, [key]: val }));
  }

  function next() {
    setError(null);
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
  }
  function back() {
    setError(null);
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  }

  function finish() {
    setError(null);
    start(async () => {
      let res: { ok?: boolean; error?: string };
      try {
        res = await completeOnboarding({
          profile: { name_ar: state.name_ar, name_en: state.name_en || undefined, phone: state.phone || undefined },
          year: { name: state.year_name, start_date: state.year_start, end_date: state.year_end },
          group: {
            name: state.group_name,
            grade_name: state.grade_name,
            subject_name: state.subject_name,
            pricing: state.pricing,
            price: Number(state.price),
          },
          subdomain: state.subdomain,
        });
      } catch (err) {
        console.error('[wizard] action threw:', err);
        setError(err instanceof Error ? err.message : 'خطأ غير متوقع');
        return;
      }
      console.log('[wizard] action returned:', res);
      if (res.error) setError(res.error);
      else router.push('/dashboard');
    });
  }

  return (
    <div className="bg-white rounded-card border border-neutral-200 shadow-sm">
      <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
        <h1 className="font-semibold text-primary-900">{t(`steps.${step}.title` as any)}</h1>
        <span className="text-xs text-neutral-500">{t('step_of', { current: stepIdx + 1, total: STEPS.length })}</span>
      </div>

      <div className="px-6 py-6 space-y-5">
        <p className="text-sm text-neutral-600">{t(`steps.${step}.subtitle` as any)}</p>

        {step === 'profile' && (
          <div className="space-y-4">
            <Field label="الاسم بالعربية" value={state.name_ar} onChange={v => set('name_ar', v)} required />
            <Field label="الاسم بالإنجليزية (اختياري)" value={state.name_en} onChange={v => set('name_en', v)} />
            <Field label="رقم الهاتف (اختياري)" value={state.phone} onChange={v => set('phone', v)} />
          </div>
        )}

        {step === 'year' && (
          <div className="space-y-4">
            <Field label="اسم السنة الدراسية" value={state.year_name} onChange={v => set('year_name', v)} placeholder="2025-2026" required />
            <div className="grid grid-cols-2 gap-3">
              <Field label="تاريخ البداية" type="date" value={state.year_start} onChange={v => set('year_start', v)} required />
              <Field label="تاريخ النهاية" type="date" value={state.year_end} onChange={v => set('year_end', v)} required />
            </div>
          </div>
        )}

        {step === 'group' && (
          <div className="space-y-4">
            <Field label="اسم المجموعة" value={state.group_name} onChange={v => set('group_name', v)} placeholder="مثلاً: الثانوية العامة - الترم الأول" required />
            <Field label="المرحلة الدراسية" value={state.grade_name} onChange={v => set('grade_name', v)} required />
            <Field label="المادة" value={state.subject_name} onChange={v => set('subject_name', v)} required />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">نوع التسعير</label>
                <select
                  value={state.pricing}
                  onChange={e => set('pricing', e.target.value as State['pricing'])}
                  className="w-full px-3 py-2.5 rounded-card border border-neutral-300"
                >
                  <option value="monthly">شهري</option>
                  <option value="per_session">بالحصة</option>
                </select>
              </div>
              <Field label="السعر (جنيه)" type="number" value={state.price} onChange={v => set('price', v)} required />
            </div>
          </div>
        )}

        {step === 'subdomain' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">الـ Subdomain</label>
              <div className="flex items-stretch rounded-card border border-neutral-300 overflow-hidden">
                <input
                  value={state.subdomain}
                  onChange={e => set('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="flex-1 px-3 py-2.5 outline-none"
                  required
                />
                <span className="px-3 py-2.5 bg-neutral-50 text-neutral-600 text-sm border-s border-neutral-200">.ostazna.com</span>
              </div>
              <p className="text-xs text-neutral-500 mt-1.5">حروف لاتينية صغيرة، أرقام، وعلامة - فقط.</p>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-card px-3 py-2">{error}</p>
        )}
      </div>

      <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
        <button
          type="button" onClick={back} disabled={stepIdx === 0 || pending}
          className="text-sm px-4 py-2 rounded-card border border-neutral-300 text-neutral-700 disabled:opacity-40"
        >
          {t('back')}
        </button>
        {stepIdx < STEPS.length - 1 ? (
          <button
            type="button" onClick={next} disabled={pending}
            className="text-sm px-5 py-2 rounded-card bg-primary-700 text-white disabled:opacity-60"
          >
            {t('next')}
          </button>
        ) : (
          <button
            type="button" onClick={finish} disabled={pending}
            className="text-sm px-5 py-2 rounded-card bg-accent-500 text-white hover:bg-accent-600 disabled:opacity-60"
          >
            {pending ? '...' : t('finish')}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = 'text', placeholder, required,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3.5 py-2.5 rounded-card border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
      />
    </div>
  );
}
