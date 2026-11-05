'use client';

import { useState } from 'react';
import { ImageUploader } from '@/components/shared/image-uploader';
import { saveThemeAction } from './actions';

export function ThemeForm({ teacherId, settings }: { teacherId: string; settings: any }) {
  const t = settings?.theme_config ?? {};
  const [logoUrl, setLogoUrl] = useState<string | null>(settings?.logo_url ?? null);

  return (
    <form action={saveThemeAction} className="space-y-4">
      <input type="hidden" name="logo_url" value={logoUrl ?? ''} />

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">الشعار</label>
        <ImageUploader
          bucket="logos"
          teacherId={teacherId}
          entity="brand"
          initialUrl={logoUrl ?? undefined}
          onUploaded={(url) => setLogoUrl(url || null)}
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <ColorField name="primary"   label="اللون الأساسي" defaultValue={t.primary   ?? '#1E3A5F'} />
        <ColorField name="secondary" label="اللون الثانوي" defaultValue={t.secondary ?? '#F5A623'} />
        <ColorField name="accent"    label="لون التمييز"   defaultValue={t.accent    ?? '#2ECC71'} />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {[
          ['social_facebook', 'فيسبوك', 'https://facebook.com/...', 'facebook'],
          ['social_youtube', 'يوتيوب', 'https://youtube.com/...', 'youtube'],
          ['social_instagram', 'إنستجرام', 'https://instagram.com/...', 'instagram'],
          ['social_whatsapp', 'واتساب', '201012345678', 'whatsapp'],
        ].map(([name, label, ph, key]) => (
          <div key={name}>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
            <input
              name={name}
              defaultValue={settings?.social_links?.[key] ?? ''}
              placeholder={ph}
              className="w-full px-3 py-2 rounded-card border border-neutral-300 text-sm"
            />
          </div>
        ))}
      </div>

      <button className="w-full px-4 py-2.5 rounded-card bg-primary-700 text-white font-medium">حفظ</button>
    </form>
  );
}

function ColorField({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
      <input type="color" name={name} defaultValue={defaultValue} className="w-full h-10 rounded-card border border-neutral-300" />
    </div>
  );
}
