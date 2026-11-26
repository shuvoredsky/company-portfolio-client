'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Globe } from 'lucide-react';
import { type Locale } from '@/config/site';
import {
  buildLocalizedPath,
  LOCALE_COOKIE_NAME,
  LOCALES,
  stripLocalePrefix,
} from '@/lib/i18n/config';
import { interpolate } from '@/lib/i18n/format';
import { useDictionary, useLang } from '@/lib/i18n/LanguageContext';
import { cn } from '@/lib/utils';

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function writeLocaleCookie(locale: Locale): void {
  if (typeof document !== 'undefined') {
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; Max-Age=${ONE_YEAR_SECONDS}; Path=/; SameSite=Lax`;
  }
}

export interface LanguageSwitcherProps {
  inverted?: boolean;
  onSelect?: () => void;
  className?: string;
}

function LanguageSwitcherContent({
  inverted = false,
  onSelect,
  className,
  includeQuery = true,
}: LanguageSwitcherProps & { includeQuery?: boolean }) {
  const currentLang = useLang();
  const dict = useDictionary();
  const pathname = usePathname() || '/';
  const searchParams = useSearchParams();
  const basePath = stripLocalePrefix(pathname);
  const query = includeQuery ? searchParams.toString() : '';

  const persistLocaleCookie = (locale: Locale) => {
    writeLocaleCookie(locale);
    onSelect?.();
  };

  return (
    <div
      role="group"
      aria-label={dict.language.label}
      className={cn(
        'inline-flex items-center gap-1 rounded-xl p-1',
        inverted
          ? 'bg-primary-foreground/10 ring-1 ring-primary-foreground/20'
          : 'border border-border bg-secondary',
        className,
      )}
    >
      <Globe
        aria-hidden="true"
        className={cn(
          'ml-1.5 h-4 w-4 shrink-0',
          inverted ? 'text-primary-foreground/80' : 'text-muted-foreground',
        )}
      />
      {LOCALES.map((locale) => {
        const isActive = locale === currentLang;
        const localized = buildLocalizedPath(locale, basePath);
        const href = query ? `${localized}?${query}` : localized;
        const languageName = dict.language[locale];
        const ariaLabel = interpolate(dict.language.switchTo, {
          language: languageName,
        });

        return (
          <Link
            key={locale}
            href={href}
            hrefLang={locale}
            aria-current={isActive ? 'true' : undefined}
            aria-label={ariaLabel}
            onClick={() => persistLocaleCookie(locale)}
            className={cn(
              'inline-flex min-h-8 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold uppercase transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
              inverted
                ? isActive
                  ? 'bg-accent-strong text-accent-strong-foreground shadow-xs'
                  : 'text-primary-foreground/90 hover:text-accent'
                : isActive
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-foreground hover:bg-card',
            )}
          >
            {locale}
          </Link>
        );
      })}
    </div>
  );
}

function LanguageSwitcherFallback({
  inverted = false,
  className,
}: Pick<LanguageSwitcherProps, 'inverted' | 'className'>) {
  const currentLang = useLang();
  const dict = useDictionary();

  return (
    <div
      role="group"
      aria-label={dict.language.label}
      className={cn(
        'inline-flex items-center gap-1 rounded-xl p-1',
        inverted
          ? 'bg-primary-foreground/10 ring-1 ring-primary-foreground/20'
          : 'border border-border bg-secondary',
        className,
      )}
    >
      <Globe
        aria-hidden="true"
        className={cn(
          'ml-1.5 h-4 w-4 shrink-0',
          inverted ? 'text-primary-foreground/80' : 'text-muted-foreground',
        )}
      />
      {LOCALES.map((locale) => {
        const isActive = locale === currentLang;
        return (
          <span
            key={locale}
            className={cn(
              'inline-flex min-h-8 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold uppercase',
              inverted
                ? isActive
                  ? 'bg-accent-strong text-accent-strong-foreground'
                  : 'text-primary-foreground/90'
                : isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground',
            )}
          >
            {locale}
          </span>
        );
      })}
    </div>
  );
}

export function LanguageSwitcher(props: LanguageSwitcherProps) {
  return (
    <Suspense
      fallback={
        <LanguageSwitcherFallback
          inverted={props.inverted}
          className={props.className}
        />
      }
    >
      <LanguageSwitcherContent {...props} />
    </Suspense>
  );
}
