import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AlertCircle, Newspaper, RefreshCw, SearchX } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { PageHero } from '@/components/common/PageHero';
import { buildPaginatedHref, Pagination } from '@/components/common/Pagination';
import { PressCard } from '@/components/press/PressCard';
import { SearchBox } from '@/components/common/SearchBox';
import { Section } from '@/components/common/Section';
import { buttonVariants } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { type Locale } from '@/config/site';
import { getCachedPressList } from '@/lib/api/server';
import { buildLocalizedPath, isValidLocale } from '@/lib/i18n/config';
import { interpolate } from '@/lib/i18n/format';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { buildPageMetadata } from '@/lib/seo';

const PRESS_PAGE_SIZE = 9;

type SearchParamsInput = Promise<{
  page?: string | string[];
  search?: string | string[];
}>;

function parseListQuery(raw: {
  page?: string | string[];
  search?: string | string[];
}): { page: number; search: string } {
  const rawPage = Array.isArray(raw.page) ? raw.page[0] : raw.page;
  const parsedPage = rawPage ? Number.parseInt(rawPage, 10) : 1;
  const page =
    Number.isFinite(parsedPage) && parsedPage >= 1 && /^\d+$/.test((rawPage ?? '').trim())
      ? parsedPage
      : 1;

  const rawSearch = Array.isArray(raw.search) ? raw.search[0] : raw.search;
  const search = typeof rawSearch === 'string' ? rawSearch.trim().slice(0, 100) : '';

  return { page, search };
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: SearchParamsInput;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLocale(lang)) return {};
  const dict = getDictionary(lang);
  const resolvedSearch = await searchParams;
  const { search } = parseListQuery(resolvedSearch);

  return buildPageMetadata({
    lang,
    path: '/press',
    title: dict.press.metaTitle,
    description: interpolate(dict.press.metaDescription),
    noIndex: search.length > 0,
  });
}

function PressListSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-11 w-full max-w-md rounded-xl" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            <Skeleton className="aspect-[16/10] w-full rounded-none" />
            <div className="space-y-3 p-6">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function PressListContent({
  lang,
  searchParams,
}: {
  lang: Locale;
  searchParams: SearchParamsInput;
}) {
  const dict = getDictionary(lang);
  const resolved = await searchParams;
  const { page, search } = parseListQuery(resolved);
  const basePath = buildLocalizedPath(lang, '/press');

  const { data: items, meta, error } = await getCachedPressList(
    page,
    PRESS_PAGE_SIZE,
    search,
  );

  // If the requested page exceeds totalPages, redirect cleanly to the last valid page
  if (!error && meta.totalPages > 0 && page > meta.totalPages) {
    redirect(buildPaginatedHref(lang, '/press', meta.totalPages, search));
  }

  return (
    <div className="space-y-8">
      <SearchBox
        basePath={basePath}
        initialValue={search}
        label={dict.press.searchLabel}
        placeholder={dict.press.searchPlaceholder}
        clearLabel={dict.press.searchClear}
        submitLabel={dict.press.searchSubmit}
      />

      {error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h2 className="text-lg font-semibold text-card-foreground">
                {dict.press.errorTitle}
              </h2>
              <p className="text-sm text-muted-foreground">
                {dict.press.errorDescription}
              </p>
            </div>
            <Link
              href={buildPaginatedHref(lang, '/press', page, search)}
              className={buttonVariants({ variant: 'outline', size: 'md' })}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              <span>{dict.common.retry}</span>
            </Link>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
              {search ? (
                <SearchX className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Newspaper className="h-6 w-6" aria-hidden="true" />
              )}
            </div>
            <div className="max-w-md space-y-1.5">
              <h2 className="break-words text-lg font-semibold text-card-foreground">
                {search
                  ? interpolate(dict.press.noResultsTitle, { query: search })
                  : dict.press.emptyTitle}
              </h2>
              <p className="text-sm text-muted-foreground">
                {search
                  ? dict.press.noResultsDescription
                  : dict.press.emptyDescription}
              </p>
            </div>
            {search ? (
              <Link
                href={basePath}
                className={buttonVariants({ variant: 'outline', size: 'md' })}
              >
                {dict.press.clearSearchAction}
              </Link>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <PressCard
                key={item._id}
                item={item}
                lang={lang}
                readMoreLabel={dict.common.readMore}
              />
            ))}
          </div>

          <Pagination
            lang={lang}
            basePath="/press"
            currentPage={meta.page}
            totalPages={meta.totalPages}
            search={search}
            labels={{
              navigation: dict.common.paginationLabel,
              previous: dict.common.previous,
              next: dict.common.next,
              pageOf: dict.common.pageOf,
              goToPage: dict.common.goToPage,
            }}
          />
        </>
      )}
    </div>
  );
}

export default async function PressPage({
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
        title={dict.press.title}
        subtitle={interpolate(dict.press.subtitle)}
      />

      <Section>
        <Container>
          <Suspense fallback={<PressListSkeleton />}>
            <PressListContent lang={lang} searchParams={searchParams} />
          </Suspense>
        </Container>
      </Section>
    </>
  );
}
