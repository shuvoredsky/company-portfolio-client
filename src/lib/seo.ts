import type { Metadata } from 'next';
import { siteConfig, type Locale } from '@/config/site';
import { buildLocalizedPath } from '@/lib/i18n/config';

export interface PageMetadataOptions {
  lang: Locale;
  path?: string;
  title: string;
  description: string;
  noIndex?: boolean;
}

export function buildPageMetadata({
  lang,
  path = '/',
  title,
  description,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const canonicalPath = buildLocalizedPath(lang, path);
  const enPath = buildLocalizedPath('en', path);
  const itPath = buildLocalizedPath('it', path);

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        en: `${siteConfig.url}${enPath}`,
        it: `${siteConfig.url}${itPath}`,
        'x-default': `${siteConfig.url}${enPath}`,
      },
    },
    openGraph: {
      title: `${title} | ${siteConfig.brandName}`,
      description,
      url: `${siteConfig.url}${canonicalPath}`,
      siteName: siteConfig.brandName,
      locale: lang === 'it' ? 'it_IT' : 'en_GB',
      type: 'website',
    },
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
