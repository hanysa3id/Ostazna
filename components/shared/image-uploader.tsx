'use client';

import { useRef, useState, useTransition } from 'react';
import { Upload, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Bucket = 'avatars' | 'logos' | 'receipts' | 'cms';

export function ImageUploader({
  bucket,
  teacherId,
  entity,
  initialUrl,
  onUploaded,
  accept = 'image/*',
}: {
  bucket: Bucket;
  teacherId: string;
  entity: string; // e.g. 'profile', 'invoice-1234'
  initialUrl?: string | null;
  onUploaded: (publicUrl: string, path: string) => void | Promise<void>;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  function pickFile() { inputRef.current?.click(); }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    start(async () => {
      const supabase = createClient();
      const ext = file.name.split('.').pop() ?? 'bin';
      const path = `${teacherId}/${entity}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: true, contentType: file.type,
      });
      if (upErr) { setError(upErr.message); return; }

      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      setPreview(pub.publicUrl);
      await onUploaded(pub.publicUrl, path);
    });
  }

  function clear() {
    setPreview(null);
    onUploaded('', '');
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="w-16 h-16 rounded-card object-cover border border-neutral-200" />
        ) : (
          <div className="w-16 h-16 rounded-card border border-dashed border-neutral-300 grid place-items-center text-neutral-400 text-xs">
            لا توجد صورة
          </div>
        )}
        <div className="flex flex-col gap-1">
          <button
            type="button" onClick={pickFile} disabled={pending}
            className="text-sm px-3 py-1.5 rounded-card border border-neutral-300 hover:bg-neutral-50 inline-flex items-center gap-1.5 disabled:opacity-60"
          >
            <Upload className="w-3.5 h-3.5" /> {pending ? 'جارٍ الرفع...' : 'رفع'}
          </button>
          {preview && (
            <button type="button" onClick={clear} className="text-xs text-red-600 inline-flex items-center gap-1">
              <X className="w-3 h-3" /> إزالة
            </button>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept={accept} onChange={onFile} className="hidden" />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
