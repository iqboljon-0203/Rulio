import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { posts } from '@/lib/blog/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.updated ?? p.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${SITE_URL}/privacy`, lastModified: new Date('2026-11-03'), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/terms`, lastModified: new Date('2026-11-03'), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/login`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];
}
