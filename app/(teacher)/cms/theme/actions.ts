'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentTeacher } from '@/lib/dal/teachers';

export async function saveThemeAction(formData: FormData) {
  const teacher = await getCurrentTeacher();
  if (!teacher) return;

  const supabase = await createClient();
  await supabase
    .from('cms_settings')
    .upsert({
      teacher_id: teacher.id,
      logo_url: (formData.get('logo_url') as string) || null,
      theme_config: {
        primary: formData.get('primary') as string,
        secondary: formData.get('secondary') as string,
        accent: formData.get('accent') as string,
      },
      social_links: {
        facebook: (formData.get('social_facebook') as string) || null,
        youtube: (formData.get('social_youtube') as string) || null,
        instagram: (formData.get('social_instagram') as string) || null,
        whatsapp: (formData.get('social_whatsapp') as string) || null,
      },
    }, { onConflict: 'teacher_id' });

  if (teacher.subdomain) {
    revalidatePath(`/s/${teacher.subdomain}`);
    revalidatePath(`/s/${teacher.subdomain}`, 'layout');
  }
  revalidatePath('/cms/theme');
}
