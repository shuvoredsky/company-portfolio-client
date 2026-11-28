'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, ChevronDown } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { type Locale } from '@/config/site';
import { type RecruitmentItem } from '@/lib/api/types';
import { buildLocalizedPath } from '@/lib/i18n/config';
import { formatDate, interpolate } from '@/lib/i18n/format';
import { cn } from '@/lib/utils';

export interface RecruitmentAccordionLabels {
  postedOn: string;
  expandDetails: string;
  collapseDetails: string;
  viewDetails: string;
}

export interface RecruitmentAccordionProps {
  items: RecruitmentItem[];
  lang: Locale;
  initialOpenId: string | null;
  labels: RecruitmentAccordionLabels;
}

export function RecruitmentAccordion({
  items,
  lang,
  initialOpenId,
  labels,
}: RecruitmentAccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(initialOpenId ? [initialOpenId] : []),
  );
  const highlightedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!initialOpenId || !highlightedRef.current) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    highlightedRef.current.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [initialOpenId]);

  const toggleItem = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isOpen = openIds.has(item._id);
        const isHighlighted = initialOpenId === item._id;
        const headingId = `recruitment-heading-${item._id}`;
        const panelId = `recruitment-panel-${item._id}`;
        const detailHref = buildLocalizedPath(lang, `/recruitment/${item._id}`);
        const formattedDate = formatDate(item.createdAt, lang);

        return (
          <div
            key={item._id}
            id={`opening-${item._id}`}
            ref={isHighlighted ? highlightedRef : undefined}
            className="scroll-mt-24"
          >
            <Card
              className={cn(
                'transition-colors duration-200 motion-reduce:transition-none',
                isHighlighted
                  ? 'border-primary ring-2 ring-primary/20 bg-secondary/20'
                  : 'hover:border-primary/40',
              )}
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <h2
                      id={headingId}
                      className="break-words text-lg font-bold leading-snug text-card-foreground sm:text-xl"
                    >
                      {item.title}
                    </h2>

                    {formattedDate ? (
                      <p className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-sm">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                        <time dateTime={item.createdAt}>
                          {interpolate(labels.postedOn, { date: formattedDate })}
                        </time>
                      </p>
                    ) : null}

                    {!isOpen ? (
                      <p className="line-clamp-3 break-words pt-1 text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleItem(item._id)}
                    className={cn(
                      buttonVariants({ variant: 'secondary', size: 'sm' }),
                      'shrink-0 self-start',
                    )}
                  >
                    <span>{isOpen ? labels.collapseDetails : labels.expandDetails}</span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none',
                        isOpen && 'rotate-180',
                      )}
                      aria-hidden="true"
                    />
                  </button>
                </div>

                {/* Full description remains in the DOM for SEO indexing */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={headingId}
                  className={cn(
                    'grid transition-[grid-template-rows,opacity] duration-200 motion-reduce:transition-none',
                    isOpen ? 'mt-5 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-5 border-t border-border pt-5">
                      <p className="max-w-3xl whitespace-pre-line break-words text-sm leading-relaxed text-foreground sm:text-base sm:leading-7">
                        {item.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={detailHref}
                          className={buttonVariants({ variant: 'outline', size: 'md' })}
                        >
                          <span>{labels.viewDetails}</span>
                          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}

