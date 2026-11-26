import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/common/Container';
import { Section } from '@/components/common/Section';
import { BannerSection } from '@/components/home/BannerSection';
import { LatestPressSection } from '@/components/home/LatestPressSection';
import { RecruitmentModalLoader } from '@/components/home/RecruitmentModalLoader';
import { Skeleton } from '@/components/ui/Skeleton';
import { isValidLocale } from '@/lib/i18n/config';
import { interpolate } from '@/lib/i18n/format';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { buildPageMetadata } from '@/lib/seo';

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
    path: '/',
    title: dict.home.metaTitle,
    description: interpolate(dict.home.metaDescription),
  });
}

function BannerSkeleton() {
  return (
    <div className="aspect-[16/9] max-h-[620px] w-full bg-muted lg:aspect-[21/9]">
      <Skeleton className="h-full w-full rounded-none" />
    </div>
  );
}

function LatestPressSkeleton() {
  return (
    <Section>
      <Container className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-5 w-80 max-w-full" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-80 w-full rounded-2xl" />
          ))}
        </div>
      </Container>
    </Section>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <>
      <Suspense fallback={<BannerSkeleton />}>
        <BannerSection />
      </Suspense>

      <Suspense fallback={<LatestPressSkeleton />}>
        <LatestPressSection lang={lang} dict={dict} />
      </Suspense>

      <RecruitmentModalLoader />
    </>
  );
}
