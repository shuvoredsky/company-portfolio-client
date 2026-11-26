import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Container } from '@/components/common/Container';
import { LocaleLink } from '@/components/common/LocaleLink';
import { SafeImage } from '@/components/common/SafeImage';
import { Section } from '@/components/common/Section';
import { SectionHeading } from '@/components/common/SectionHeading';
import { NetworkCard } from '@/components/network/NetworkCard';
import { buttonVariants } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { type Locale } from '@/config/site';
import { getNetworks } from '@/lib/api/networks';
import {
  getCachedLatestNetworks,
  getCachedNetworkById,
  isValidObjectId,
} from '@/lib/api/server';
import { buildLocalizedPath, isValidLocale } from '@/lib/i18n/config';
import { interpolate } from '@/lib/i18n/format';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { getOptimizedCloudinaryUrl } from '@/lib/images';
import { buildExcerpt, buildPageMetadata, stripControlChars } from '@/lib/seo';
import { parseSafeExternalUrl } from '@/lib/url';

const FALLBACK_STATIC_ID = '000000000000000000000000';

export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    const res = await getNetworks({ page: 1, limit: 10 });
    const items = res.data ?? [];
    if (items.length > 0) {
      return items.map((item) => ({ id: item._id }));
    }
  } catch {
    // Fall through to sentinel param when API is unreachable at build time
  }
  return [{ id: FALLBACK_STATIC_ID }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  if (!isValidLocale(lang) || !isValidObjectId(id)) return {};

  const { data: item } = await getCachedNetworkById(id);
  if (!item) return {};

  const imageUrl = getOptimizedCloudinaryUrl(item.image.url, 1200);
  return buildPageMetadata({
    lang,
    path: `/network/${item._id}`,
    title: item.title,
    description: buildExcerpt(item.description, 160),
    imageUrl,
  });
}

async function MoreNetworksSection({
  lang,
  currentId,
}: {
  lang: Locale;
  currentId: string;
}) {
  const dict = getDictionary(lang);
  const { data: items, error } = await getCachedLatestNetworks(4);
  if (error) return null;

  const others = items.filter((entry) => entry._id !== currentId).slice(0, 3);
  if (others.length === 0) return null;

  return (
    <Section className="bg-secondary/50">
      <Container className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading as="h2" title={dict.network.moreNetworksTitle} />
          <LocaleLink
            href="/network"
            className={buttonVariants({ variant: 'outline', size: 'md' })}
          >
            <span>{dict.network.viewAllNetworks}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </LocaleLink>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {others.map((item) => (
            <NetworkCard
              key={item._id}
              item={item}
              lang={lang}
              learnMoreLabel={dict.common.learnMore}
              externalSiteLabel={dict.network.externalSiteBadge}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}

export default async function NetworkDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!isValidLocale(lang)) notFound();
  if (!isValidObjectId(id)) notFound();

  const dict = getDictionary(lang);
  const { data: item, notFound: isMissing, error } = await getCachedNetworkById(id);

  if (isMissing) {
    notFound();
  }

  if (error || !item) {
    return (
      <Section>
        <Container className="max-w-3xl">
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h1 className="text-xl font-bold text-card-foreground">
                  {dict.network.detailErrorTitle}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {dict.network.detailErrorDescription}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={buildLocalizedPath(lang, `/network/${id}`)}
                  className={buttonVariants({ variant: 'primary', size: 'md' })}
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  <span>{dict.common.retry}</span>
                </Link>
                <LocaleLink
                  href="/network"
                  className={buttonVariants({ variant: 'outline', size: 'md' })}
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  <span>{dict.network.backToNetwork}</span>
                </LocaleLink>
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>
    );
  }

  const safeExternal = parseSafeExternalUrl(item.externalUrl);
  const optimizedImageUrl = getOptimizedCloudinaryUrl(item.image.url, 1200);
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: stripControlChars(item.title),
    description: buildExcerpt(item.description, 200),
    image: optimizedImageUrl,
    ...(safeExternal ? { url: safeExternal.href } : {}),
  };
  const safeJsonLd = JSON.stringify(orgJsonLd).replace(/</g, '\\u003c');

  return (
    <>
      <script type="application/ld+json">{safeJsonLd}</script>

      <Section>
        <Container className="max-w-4xl">
          {/* Breadcrumb */}
          <nav
            aria-label={dict.network.breadcrumbLabel}
            className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground"
          >
            <LocaleLink
              href="/"
              className="rounded-md py-1 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {dict.nav.home}
            </LocaleLink>
            <ChevronRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
            <LocaleLink
              href="/network"
              className="rounded-md py-1 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {dict.nav.network}
            </LocaleLink>
            <ChevronRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
            <span
              aria-current="page"
              className="min-w-0 max-w-full truncate font-medium text-foreground"
            >
              {item.title}
            </span>
          </nav>

          <article className="space-y-6 sm:space-y-8">
            <header className="space-y-4">
              <h1 className="break-words text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                {item.title}
              </h1>

              {safeExternal ? (
                <div>
                  <a
                    href={safeExternal.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={interpolate(dict.network.visitWebsiteAria, {
                      hostname: safeExternal.hostname,
                    })}
                    className={buttonVariants({ variant: 'primary', size: 'md' })}
                  >
                    <span>{dict.common.visitWebsite}</span>
                    <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </a>
                </div>
              ) : null}
            </header>

            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border bg-muted">
              <SafeImage
                src={item.image.url}
                alt={item.title}
                fill
                priority
                optimizeWidth={1200}
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
              />
            </div>

            <div className="max-w-3xl">
              <p className="whitespace-pre-line break-words text-base leading-relaxed text-foreground sm:text-lg sm:leading-8">
                {item.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
              <LocaleLink
                href="/network"
                className={buttonVariants({ variant: 'outline', size: 'md' })}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>{dict.network.backToNetwork}</span>
              </LocaleLink>

              {safeExternal ? (
                <a
                  href={safeExternal.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={interpolate(dict.network.visitWebsiteAria, {
                    hostname: safeExternal.hostname,
                  })}
                  className={buttonVariants({ variant: 'primary', size: 'md' })}
                >
                  <span>{dict.common.visitWebsite}</span>
                  <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
                </a>
              ) : null}
            </div>
          </article>
        </Container>
      </Section>

      <Suspense fallback={null}>
        <MoreNetworksSection lang={lang} currentId={item._id} />
      </Suspense>
    </>
  );
}

