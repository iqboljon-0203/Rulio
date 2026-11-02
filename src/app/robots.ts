import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Shaxsiy kabinet va API qidiruvda ko'rinmasin
        disallow: ['/api/', '/auth/', '/home', '/tickets', '/random', '/mistakes', '/saved', '/octagon', '/profile', '/pricing'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
