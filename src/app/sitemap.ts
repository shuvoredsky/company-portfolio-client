import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { getCachedPressSitemapItems } from '@/lib/api/server';
import { buildLocalizedPath, LOCALES } from '@/lib/i18n/config';

const STATIC_ROUTES = [
  '/',
  '/about',
  '/press',
  '/network',
  '/contact',
  '/recruitment',
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  for (const route of STATIC_ROUTES) {
    for (const lang of LOCALES) {
      entries.push({
        url: `${siteConfig.url}${buildLocalizedPath(lang, route)}`,
        lastModified: now,
        changeFrequency: route === '/' || route === '/press' ? 'daily' : 'weekly',
        priority: route === '/' ? 1 : 0.8,
        alternates: {
          languages: {
            en: `${siteConfig.url}${buildLocalizedPath('en', route)}`,
            it: `${siteConfig.url}${buildLocalizedPath('it', route)}`,
          },
        },
      });
    }
  }

  const pressItems = await getCachedPressSitemapItems();
  for (const item of pressItems) {
    const route = `/press/${item._id}`;
    const lastModified = item.updatedAt
      ? new Date(item.updatedAt)
      : item.createdAt
        ? new Date(item.createdAt)
        : now;

    for (const lang of LOCALES) {
      entries.push({
        url: `${siteConfig.url}${buildLocalizedPath(lang, route)}`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: {
          languages: {
            en: `${siteConfig.url}${buildLocalizedPath('en', route)}`,
            it: `${siteConfig.url}${buildLocalizedPath('it', route)}`,
          },
        },
      });
    }
  }

  return entries;
}
