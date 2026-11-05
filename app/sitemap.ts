import type { MetadataRoute } from 'next';

const ROOT = `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'ostazna.com'}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ['/', '/pricing', '/privacy', '/terms', '/refund-policy'].map(p => ({
    url: `${ROOT}${p}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: p === '/' ? 1 : 0.6,
  }));
}
