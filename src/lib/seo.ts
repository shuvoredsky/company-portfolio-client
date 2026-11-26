import type { Metadata } from 'next';
import { siteConfig, type Locale } from '@/config/site';
import { buildLocalizedPath } from '@/lib/i18n/config';

export interface PageMetadataOptions {
  lang: Locale;
  path?: string;
  title: string;
  description: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
  imageUrl?: string;
  publishedTime?: string;
}

export function stripControlChars(input: string): string {
  return input.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function buildExcerpt(input: string, maxLength = 160): string {
  const clean = stripControlChars(input);
  if (clean.length <= maxLength) return clean;
  const sliced = clean.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(' ');
  const base = lastSpace > maxLength * 0.6 ? sliced.slice(0, lastSpace) : sliced;
  return `${base.trimEnd()}…`;
}

export function buildPageMetadata({
  lang,
  path = '/',
  title,
  description,
  noIndex = false,
  type = 'website',
  imageUrl,
  publishedTime,
}: PageMetadataOptions): Metadata {
  const cleanTitle = stripControlChars(title);
  const cleanDescription = stripControlChars(description);
  const canonicalPath = buildLocalizedPath(lang, path);
  const enPath = buildLocalizedPath('en', path);
  const itPath = buildLocalizedPath('it', path);

  const ogImages = imageUrl ? [{ url: imageUrl, alt: cleanTitle }] : undefined;

  return {
    title: cleanTitle,
    description: cleanDescription,
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        en: `${siteConfig.url}${enPath}`,
        it: `${siteConfig.url}${itPath}`,
        'x-default': `${siteConfig.url}${enPath}`,
      },
    },
    openGraph:
      type === 'article'
        ? {
            title: `${cleanTitle} | ${siteConfig.brandName}`,
            description: cleanDescription,
            url: `${siteConfig.url}${canonicalPath}`,
            siteName: siteConfig.brandName,
            locale: lang === 'it' ? 'it_IT' : 'en_GB',
            type: 'article',
            ...(publishedTime ? { publishedTime } : {}),
            ...(ogImages ? { images: ogImages } : {}),
          }
        : {
            title: `${cleanTitle} | ${siteConfig.brandName}`,
            description: cleanDescription,
            url: `${siteConfig.url}${canonicalPath}`,
            siteName: siteConfig.brandName,
            locale: lang === 'it' ? 'it_IT' : 'en_GB',
            type: 'website',
            ...(ogImages ? { images: ogImages } : {}),
          },
    ...(imageUrl
      ? {
          twitter: {
            card: 'summary_large_image',
            title: `${cleanTitle} | ${siteConfig.brandName}`,
            description: cleanDescription,
            images: [imageUrl],
          },
        }
      : {}),
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
          },
        }
      : {}),
  };
}
