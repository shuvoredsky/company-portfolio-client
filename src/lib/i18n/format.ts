import { siteConfig, type Locale } from '@/config/site';

export function interpolate(
  template: string,
  values: Record<string, string | number> = {},
): string {
  const merged: Record<string, string | number> = {
    brand: siteConfig.brandName,
    ...values,
  };
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const val = merged[key];
    return val !== undefined ? String(val) : `{${key}}`;
  });
}

const INTL_LOCALE_MAP: Record<Locale, string> = {
  en: 'en-GB',
  it: 'it-IT',
};

export function formatDate(
  isoDate: string | undefined,
  lang: Locale,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  },
): string {
  if (!isoDate) return '—';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(INTL_LOCALE_MAP[lang], options).format(date);
}

