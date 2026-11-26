import { siteConfig, type Locale } from '@/config/site';

export const LOCALES = siteConfig.locales;
export const DEFAULT_LOCALE: Locale = siteConfig.defaultLocale;
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

export function isValidLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function buildLocalizedPath(lang: Locale, path: string): string {
  if (!path || path === '/') {
    return `/${lang}`;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `/${lang}${normalized}`;
}

export function stripLocalePrefix(pathname: string): string {
  for (const locale of LOCALES) {
    if (pathname === `/${locale}`) return '/';
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1) || '/';
    }
  }
  return pathname || '/';
}

