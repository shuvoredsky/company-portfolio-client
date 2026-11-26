'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Briefcase } from 'lucide-react';
import { LocaleLink } from '@/components/common/LocaleLink';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { getRecruitments } from '@/lib/api/recruitments';
import { interpolate } from '@/lib/i18n/format';
import { useDictionary } from '@/lib/i18n/LanguageContext';
import { queryKeys } from '@/lib/queryKeys';
import {
  buildRecruitmentItemPath,
  RECRUITMENT_MODAL_SESSION_KEY,
} from '@/lib/routes';

function markModalSeen(): void {
  try {
    window.sessionStorage.setItem(RECRUITMENT_MODAL_SESSION_KEY, '1');
  } catch {
    // Ignore storage errors (private browsing / restricted storage)
  }
}

export function RecruitmentModal() {
  const dict = useDictionary();
  const [closed, setClosed] = useState(false);

  const { data, isError } = useQuery({
    queryKey: queryKeys.recruitments.list({ page: 1, limit: 5 }),
    queryFn: () => getRecruitments({ page: 1, limit: 5 }),
    staleTime: 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const recruitments = data?.data ?? [];
  const shouldShow = !closed && !isError && recruitments.length > 0;

  useEffect(() => {
    if (shouldShow) {
      markModalSeen();
    }
  }, [shouldShow]);

  if (!shouldShow) {
    return null;
  }

  const handleClose = () => {
    markModalSeen();
    setClosed(true);
  };

  return (
    <Modal
      open={shouldShow}
      onClose={handleClose}
      variant="glass"
      size="md"
      closeOnOverlayClick
      closeLabel={dict.common.close}
      title={dict.recruitment.modalTitle}
      description={interpolate(dict.recruitment.modalSubtitle)}
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            {dict.common.close}
          </Button>
          <LocaleLink href="/recruitment" onClick={handleClose}>
            <Button variant="primary">
              {dict.recruitment.modalViewAll}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </LocaleLink>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-primary uppercase">
          <Briefcase className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{dict.recruitment.title}</span>
        </div>

        <ul className="space-y-2.5">
          {recruitments.map((item) => (
            <li
              key={item._id}
              className="rounded-xl border border-border/80 bg-card/80 p-3.5 transition-colors hover:border-primary/40"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="break-words text-sm font-semibold text-foreground sm:text-base">
                    {item.title}
                  </h3>
                  <p className="line-clamp-2 break-words text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {item.description}
                  </p>
                </div>

                <LocaleLink
                  href={buildRecruitmentItemPath(item._id)}
                  onClick={handleClose}
                  className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-primary transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
                >
                  <span>{dict.common.learnMore}</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </LocaleLink>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
