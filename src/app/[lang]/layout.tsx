import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { notFound } from 'next/navigation';
import { Suspense, type ReactNode } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Providers } from '@/components/providers/Providers';
import { siteConfig } from '@/config/site';
import { isValidLocale, LOCALES } from '@/lib/i18n/config';
import { interpolate } from '@/lib/i18n/format';
import { getDictionary } from '@/lib/i18n/getDictionary';
import '../globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans-app',
  display: 'swap',
});

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const resolvedLang = isValidLocale(lang) ? lang : siteConfig.defaultLocale;
  const dict = getDictionary(resolvedLang);

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: interpolate(dict.metadata.defaultTitle),
      template: `%s | ${siteConfig.brandName}`,
    },
    description: interpolate(dict.metadata.defaultDescription),
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function LangRootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isValidLocale(lang)) {
    notFound();
  }

  const dict = getDictionary(lang);

  return (
    <html lang={lang} className={plusJakartaSans.variable}>
      <body className="flex min-h-dvh flex-col bg-background font-sans text-foreground antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-xl focus:bg-accent-strong focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-accent-strong-foreground focus:shadow-lg"
        >
          {dict.nav.skipToContent}
        </a>

        <Providers lang={lang} dict={dict}>
          <Suspense
            fallback={
              <header className="sticky top-0 z-40 h-16 w-full bg-primary sm:h-18" />
            }
          >
            <Navbar />
          </Suspense>
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer lang={lang} dict={dict} />
        </Providers>
      </body>
    </html>
  );
}
