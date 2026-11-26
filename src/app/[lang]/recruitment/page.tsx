import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AlertCircle, ArrowRight, Briefcase, RefreshCw } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { LocaleLink } from '@/components/common/LocaleLink';
import { PageHero } from '@/components/common/PageHero';
import { buildPaginatedHref, Pagination } from '@/components/common/Pagination';
import { Section } from '@/components/common/Section';
import { RecruitmentAccordion } from '@/components/recruitment/RecruitmentAccordion';
import { buttonVariants } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { type Locale } from '@/config/site';
import { getCachedRecruitmentList, isValidObjectId } from '@/lib/api/server';
import { isValidLocale } from '@/lib/i18n/config';
import { interpolate } from '@/lib/i18n/format';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { buildPageMetadata } from '@/lib/seo';

const RECRUITMENT_PAGE_SIZE = 10;

type SearchParamsInput = Promise<{
  page?: string | string[];
  open?: string | string[];
}>;

function parseRecruitmentQuery(raw: {
  page?: string | string[];
  open?: string | string[];
}): { page: number; openId: string | null } {
  const rawPage = Array.isArray(raw.page) ? raw.page[0] : raw.page;
  const parsedPage = rawPage ? Number.parseInt(rawPage, 10) : 1;
  const page =
    Number.isFinite(parsedPage) && parsedPage >= 1 && /^\d+$/.test((rawPage ?? '').trim())
      ? parsedPage
      : 1;

  const rawOpen = Array.isArray(raw.open) ? raw.open[0] : raw.open;
  const trimmedOpen = typeof rawOpen === 'string' ? rawOpen.trim() : '';
  const openId = isValidObjectId(trimmedOpen) ? trimmedOpen : null;

  return { page, openId };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const dict = getDictionary(lang);
  return buildPageMetadata({
    lang,
    path: '/recruitment',
    title: dict.recruitment.metaTitle,
    description: interpolate(dict.recruitment.metaDescription),
  });
}

function RecruitmentListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-border bg-card p-6 space-y-3"
        >
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ))}
    </div>
  );
}

async function RecruitmentListContent({
  lang,
  searchParams,
}: {
  lang: Locale;
  searchParams: SearchParamsInput;
}) {
  const dict = getDictionary(lang);
  const resolved = await searchParams;
  const { page, openId } = parseRecruitmentQuery(resolved);

  const { data: items, meta, error } = await getCachedRecruitmentList(
    page,
    RECRUITMENT_PAGE_SIZE,
  );

  if (!error && meta.totalPages > 0 && page > meta.totalPages) {
    redirect(buildPaginatedHref(lang, '/recruitment', meta.totalPages));
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="max-w-md space-y-1.5">
            <h2 className="text-lg font-semibold text-card-foreground">
              {dict.recruitment.errorTitle}
            </h2>
            <p className="text-sm text-muted-foreground">
              {dict.recruitment.errorDescription}
            </p>
          </div>
          <Link
            href={buildPaginatedHref(lang, '/recruitment', page)}
            className={buttonVariants({ variant: 'outline', size: 'md' })}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>{dict.common.retry}</span>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
            <Briefcase className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="max-w-md space-y-1.5">
            <h2 className="text-lg font-semibold text-card-foreground">
              {dict.recruitment.emptyTitle}
            </h2>
            <p className="text-sm text-muted-foreground">
              {dict.recruitment.emptyDescription}
            </p>
          </div>
          <LocaleLink
            href="/contact"
            className={buttonVariants({ variant: 'primary', size: 'md' })}
          >
            <span>{dict.recruitment.contactCta}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </LocaleLink>
        </CardContent>
      </Card>
    );
  }

  const matchedOpenId =
    openId && items.some((entry) => entry._id === openId) ? openId : null;

  return (
    <div className="space-y-8">
      <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
        {dict.recruitment.intro}
      </p>

      <RecruitmentAccordion
        items={items}
        lang={lang}
        initialOpenId={matchedOpenId}
        labels={{
          postedOn: dict.recruitment.postedOn,
          expandDetails: dict.recruitment.expandDetails,
          collapseDetails: dict.recruitment.collapseDetails,
          apply: dict.common.apply,
          applyForRole: dict.recruitment.applyForRole,
          viewDetails: dict.recruitment.viewDetails,
        }}
      />

      <Pagination
        lang={lang}
        basePath="/recruitment"
        currentPage={meta.page}
        totalPages={meta.totalPages}
        labels={{
          navigation: dict.common.paginationLabel,
          previous: dict.common.previous,
          next: dict.common.next,
          pageOf: dict.common.pageOf,
          goToPage: dict.common.goToPage,
        }}
      />
    </div>
  );
}

export default async function RecruitmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: SearchParamsInput;
}) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <>
      <PageHero
        title={dict.recruitment.title}
        subtitle={interpolate(dict.recruitment.subtitle)}
      />

      <Section>
        <Container className="max-w-4xl">
          <Suspense fallback={<RecruitmentListSkeleton />}>
            <RecruitmentListContent lang={lang} searchParams={searchParams} />
          </Suspense>
        </Container>
      </Section>
    </>
  );
}
