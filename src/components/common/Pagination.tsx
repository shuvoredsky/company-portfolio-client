import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type Locale } from '@/config/site';
import { buildLocalizedPath } from '@/lib/i18n/config';
import { interpolate } from '@/lib/i18n/format';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  lang: Locale;
  basePath: string;
  currentPage: number;
  totalPages: number;
  search?: string;
  labels: {
    navigation: string;
    previous: string;
    next: string;
    pageOf: string;
    goToPage: string;
  };
  className?: string;
}

export function buildPaginatedHref(
  lang: Locale,
  basePath: string,
  page: number,
  search?: string,
): string {
  const params = new URLSearchParams();
  const trimmedSearch = search?.trim();
  if (trimmedSearch) {
    params.set('search', trimmedSearch);
  }
  if (page > 1) {
    params.set('page', String(page));
  }
  const localized = buildLocalizedPath(lang, basePath);
  const query = params.toString();
  return query ? `${localized}?${query}` : localized;
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];

  if (current > 3) {
    pages.push('ellipsis');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let p = start; p <= end; p += 1) {
    pages.push(p);
  }

  if (current < total - 2) {
    pages.push('ellipsis');
  }

  pages.push(total);
  return pages;
}

export function Pagination({
  lang,
  basePath,
  currentPage,
  totalPages,
  search,
  labels,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const navButtonClass =
    'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 text-sm font-medium text-card-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';
  const disabledButtonClass =
    'inline-flex min-h-10 cursor-not-allowed items-center justify-center gap-1.5 rounded-xl border border-border/60 bg-muted/50 px-3 text-sm font-medium text-muted-foreground opacity-60';

  return (
    <nav
      aria-label={labels.navigation}
      className={cn(
        'flex flex-col items-center justify-between gap-4 pt-4 sm:flex-row',
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        {interpolate(labels.pageOf, {
          page: String(currentPage),
          totalPages: String(totalPages),
        })}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {hasPrev ? (
          <Link
            href={buildPaginatedHref(lang, basePath, currentPage - 1, search)}
            className={navButtonClass}
          >
            <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{labels.previous}</span>
          </Link>
        ) : (
          <span aria-disabled="true" className={disabledButtonClass}>
            <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{labels.previous}</span>
          </span>
        )}

        <div className="hidden items-center gap-1 sm:flex">
          {pageNumbers.map((entry, index) => {
            if (entry === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  aria-hidden="true"
                  className="inline-flex min-h-10 min-w-8 items-center justify-center px-1 text-sm text-muted-foreground"
                >
                  &hellip;
                </span>
              );
            }

            const isCurrent = entry === currentPage;
            return (
              <Link
                key={entry}
                href={buildPaginatedHref(lang, basePath, entry, search)}
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={interpolate(labels.goToPage, {
                  page: String(entry),
                })}
                className={cn(
                  'inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  isCurrent
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'border border-border bg-card text-card-foreground hover:bg-muted',
                )}
              >
                {entry}
              </Link>
            );
          })}
        </div>

        {hasNext ? (
          <Link
            href={buildPaginatedHref(lang, basePath, currentPage + 1, search)}
            className={navButtonClass}
          >
            <span>{labels.next}</span>
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </Link>
        ) : (
          <span aria-disabled="true" className={disabledButtonClass}>
            <span>{labels.next}</span>
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </span>
        )}
      </div>
    </nav>
  );
}

