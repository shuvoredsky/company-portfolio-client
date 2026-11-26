'use client';

import Link, { type LinkProps } from 'next/link';
import { type AnchorHTMLAttributes, type ReactNode } from 'react';
import { type Locale } from '@/config/site';
import { buildLocalizedPath } from '@/lib/i18n/config';
import { useLang } from '@/lib/i18n/LanguageContext';

export interface LocaleLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>,
    Omit<LinkProps, 'href'> {
  href: string;
  lang?: Locale;
  children: ReactNode;
}

export function LocaleLink({
  href,
  lang: explicitLang,
  children,
  ...props
}: LocaleLinkProps) {
  const currentLang = useLang();
  const targetLang = explicitLang ?? currentLang;
  const localizedHref = buildLocalizedPath(targetLang, href);

  return (
    <Link href={localizedHref} {...props}>
      {children}
    </Link>
  );
}

