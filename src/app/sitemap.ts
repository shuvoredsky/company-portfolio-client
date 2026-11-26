import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import {
  getCachedNetworkSitemapItems,
  getCachedPressSitemapItems,
  getCachedRecruitmentSitemapItems,
} from '@/lib/api/server';
import { buildLocalizedPath, LOCALES } from '@/lib/i18n/config';

const STATIC_ROUTES = [
  '/',
  '/about',
  '/press',
  '/network',
  '/contact',
  '/recruitment',
] as const;

function appendLocalizedItemEntries(
  entries: MetadataRoute.Sitemap,
  prefix: string,
  items: { _id: string; createdAt?: string; updatedAt?: string }[],
  now: Date,
  priority: number,
): void {
  for (const item of items) {
    const route = `${prefix}/${item._id}`;
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
        priority,
        alternates: {
          languages: {
            en: `${siteConfig.url}${buildLocalizedPath('en', route)}`,
            it: `${siteConfig.url}${buildLocalizedPath('it', route)}`,
          },
        },
      });
    }
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  for (const route of STATIC_ROUTES) {
    for (const lang of LOCALES) {
      entries.push({
        url: `${siteConfig.url}${buildLocalizedPath(lang, route)}`,
        lastModified: now,
        changeFrequency:
          route === '/' || route === '/press' || route === '/network'
            ? 'daily'
            : 'weekly',
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

  const [pressItems, networkItems, recruitmentItems] = await Promise.all([
    getCachedPressSitemapItems(),
    getCachedNetworkSitemapItems(),
    getCachedRecruitmentSitemapItems(),
  ]);

  appendLocalizedItemEntries(entries, '/press', pressItems, now, 0.7);
  appendLocalizedItemEntries(entries, '/network', networkItems, now, 0.7);
  appendLocalizedItemEntries(entries, '/recruitment', recruitmentItems, now, 0.6);

  return entries;
}
