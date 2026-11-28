import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Container } from '@/components/common/Container';
import { LocaleLink } from '@/components/common/LocaleLink';
import { Section } from '@/components/common/Section';
import { SectionHeading } from '@/components/common/SectionHeading';
import { buttonVariants } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { type Locale } from '@/config/site';
import { getRecruitments } from '@/lib/api/recruitments';
import {
  getCachedRecruitmentById,
  getCachedRecruitmentList,
  isValidObjectId,
} from '@/lib/api/server';
import { buildLocalizedPath, isValidLocale } from '@/lib/i18n/config';
import { formatDate, interpolate } from '@/lib/i18n/format';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { buildExcerpt, buildPageMetadata } from '@/lib/seo';

const FALLBACK_STATIC_ID = '000000000000000000000000';

export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    const res = await getRecruitments({ page: 1, limit: 10 });
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

  const { data: item } = await getCachedRecruitmentById(id);
  if (!item) return {};

  return buildPageMetadata({
    lang,
    path: `/recruitment/${item._id}`,
    title: item.title,
    description: buildExcerpt(item.description, 160),
    type: 'website',
  });
}

async function OtherOpeningsSection({
  lang,
  currentId,
}: {
  lang: Locale;
  currentId: string;
}) {
  const dict = getDictionary(lang);
  const { data: items, error } = await getCachedRecruitmentList(1, 4);
  if (error) return null;

  const others = items.filter((entry) => entry._id !== currentId).slice(0, 3);
  if (others.length === 0) return null;

  return (
    <Section className="bg-secondary/50">
      <Container className="max-w-4xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading as="h2" title={dict.recruitment.otherOpeningsTitle} />
          <LocaleLink
            href="/recruitment"
            className={buttonVariants({ variant: 'outline', size: 'md' })}
          >
            <span>{dict.recruitment.backToOpenings}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </LocaleLink>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {others.map((opening) => (
            <Link
              key={opening._id}
              href={buildLocalizedPath(lang, `/recruitment/${opening._id}`)}
              className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Card className="flex h-full flex-col justify-between transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
                <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
                  <div className="min-w-0 space-y-2">
                    <h3 className="line-clamp-2 break-words text-base font-semibold text-card-foreground transition-colors group-hover:text-primary">
                      {opening.title}
                    </h3>
                    <p className="line-clamp-3 break-words text-sm text-muted-foreground">
                      {opening.description}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    <span>{dict.recruitment.viewDetails}</span>
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function RecruitmentDetailSkeleton() {
  return (
    <Section>
      <Container className="max-w-4xl space-y-6">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <div className="max-w-3xl space-y-3 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </Container>
    </Section>
  );
}

async function RecruitmentDetailContent({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!isValidLocale(lang)) notFound();
  if (!isValidObjectId(id)) notFound();

  const dict = getDictionary(lang);
  const { data: item, notFound: isMissing, error } = await getCachedRecruitmentById(id);

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
                  {dict.recruitment.detailErrorTitle}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {dict.recruitment.detailErrorDescription}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={buildLocalizedPath(lang, `/recruitment/${id}`)}
                  className={buttonVariants({ variant: 'primary', size: 'md' })}
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  <span>{dict.common.retry}</span>
                </Link>
                <LocaleLink
                  href="/recruitment"
                  className={buttonVariants({ variant: 'outline', size: 'md' })}
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  <span>{dict.recruitment.backToOpenings}</span>
                </LocaleLink>
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>
    );
  }

  const formattedDate = formatDate(item.createdAt, lang);

  return (
    <>
      <Section>
        <Container className="max-w-4xl">
          {/* Breadcrumb */}
          <nav
            aria-label={dict.recruitment.breadcrumbLabel}
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
              href="/recruitment"
              className="rounded-md py-1 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {dict.recruitment.title}
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
            <header className="space-y-3">
              {formattedDate ? (
                <p className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <time dateTime={item.createdAt}>
                    {interpolate(dict.recruitment.postedOn, { date: formattedDate })}
                  </time>
                </p>
              ) : null}

              <h1 className="break-words text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                {item.title}
              </h1>
            </header>

            <div className="max-w-3xl">
              <p className="whitespace-pre-line break-words text-base leading-relaxed text-foreground sm:text-lg sm:leading-8">
                {item.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
              <LocaleLink
                href="/recruitment"
                className={buttonVariants({ variant: 'outline', size: 'lg' })}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>{dict.recruitment.backToOpenings}</span>
              </LocaleLink>
            </div>
          </article>
        </Container>
      </Section>

      <Suspense fallback={null}>
        <OtherOpeningsSection lang={lang} currentId={item._id} />
      </Suspense>
    </>
  );
}

export default function RecruitmentDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  return (
    <Suspense fallback={<RecruitmentDetailSkeleton />}>
      <RecruitmentDetailContent params={params} />
    </Suspense>
  );
}

