import { NextRequest, NextResponse } from 'next/server';
import {
  DEFAULT_LOCALE,
  isValidLocale,
  LOCALE_COOKIE_NAME,
  LOCALES,
} from '@/lib/i18n/config';
import { type Locale } from '@/config/site';

const FILE_EXTENSION_REGEX = /\.[^/]+$/;

function detectLocaleFromAcceptLanguage(headerValue: string | null): Locale {
  if (!headerValue) return DEFAULT_LOCALE;

  const candidates = headerValue
    .split(',')
    .map((part) => {
      const [rawTag, ...params] = part.trim().split(';');
      const tag = (rawTag ?? '').trim().toLowerCase().split('-')[0] ?? '';
      const qParam = params.find((p) => p.trim().startsWith('q='));
      const q = qParam ? Number(qParam.trim().slice(2)) : 1;
      return { tag, q: Number.isFinite(q) ? q : 0 };
    })
    .sort((a, b) => b.q - a.q);

  for (const candidate of candidates) {
    if (isValidLocale(candidate.tag)) {
      return candidate.tag;
    }
  }

  return DEFAULT_LOCALE;
}

function resolvePreferredLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale;
  }

  return detectLocaleFromAcceptLanguage(request.headers.get('accept-language'));
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    FILE_EXTENSION_REGEX.test(pathname)
  ) {
    return NextResponse.next();
  }

  const hasLocalePrefix = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (hasLocalePrefix) {
    return NextResponse.next();
  }

  const locale = resolvePreferredLocale(request);
  const targetPath = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
  const redirectUrl = new URL(`${targetPath}${search}`, request.url);

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)',
  ],
};
