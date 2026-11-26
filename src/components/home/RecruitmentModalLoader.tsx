'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { RECRUITMENT_MODAL_SESSION_KEY } from '@/lib/routes';

const LazyRecruitmentModal = dynamic(
  () => import('./RecruitmentModal').then((mod) => mod.RecruitmentModal),
  { ssr: false },
);

function wasSeenThisSession(): boolean {
  try {
    return window.sessionStorage.getItem(RECRUITMENT_MODAL_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function RecruitmentModalLoader() {
  const [readyToMount, setReadyToMount] = useState(false);

  useEffect(() => {
    if (wasSeenThisSession()) {
      return;
    }

    let timerId: number | undefined;
    const scheduleOpen = () => {
      timerId = window.setTimeout(() => {
        if (!wasSeenThisSession()) {
          setReadyToMount(true);
        }
      }, 800);
    };

    if (document.readyState === 'complete') {
      scheduleOpen();
    } else {
      window.addEventListener('load', scheduleOpen, { once: true });
    }

    return () => {
      window.removeEventListener('load', scheduleOpen);
      if (timerId !== undefined) {
        window.clearTimeout(timerId);
      }
    };
  }, []);

  if (!readyToMount) {
    return null;
  }

  return <LazyRecruitmentModal />;
}
