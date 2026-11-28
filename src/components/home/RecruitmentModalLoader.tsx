'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

export const HOME_LOGO_CLICK_EVENT = 'home-logo-click';

const LazyRecruitmentModal = dynamic(
  () => import('./RecruitmentModal').then((mod) => mod.RecruitmentModal),
  { ssr: false },
);

export function RecruitmentModalLoader() {
  const [openKey, setOpenKey] = useState(0);

  useEffect(() => {
    let timerId: number | undefined;
    const scheduleOpen = () => {
      timerId = window.setTimeout(() => {
        setOpenKey((k) => k + 1);
      }, 600);
    };

    if (document.readyState === 'complete') {
      scheduleOpen();
    } else {
      window.addEventListener('load', scheduleOpen, { once: true });
    }

    const handleLogoClick = () => {
      setOpenKey((k) => k + 1);
    };
    window.addEventListener(HOME_LOGO_CLICK_EVENT, handleLogoClick);

    return () => {
      window.removeEventListener('load', scheduleOpen);
      window.removeEventListener(HOME_LOGO_CLICK_EVENT, handleLogoClick);
      if (timerId !== undefined) {
        window.clearTimeout(timerId);
      }
      // Reset when navigating away from Home (including Next.js 16 <Activity> hiding)
      setOpenKey(0);
    };
  }, []);

  if (openKey === 0) {
    return null;
  }

  return <LazyRecruitmentModal key={openKey} />;
}
