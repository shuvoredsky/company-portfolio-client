import Link from 'next/link';
import { AlertCircle, ArrowRight, Newspaper, RotateCcw } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { Section } from '@/components/common/Section';
import { SectionHeading } from '@/components/common/SectionHeading';
import { PressCard } from '@/components/press/PressCard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { type Locale } from '@/config/site';
import { getCachedLatestPress } from '@/lib/api/server';
import { buildLocalizedPath } from '@/lib/i18n/config';
import { type Dictionary } from '@/lib/i18n/getDictionary';

export interface LatestPressSectionProps {
  lang: Locale;
  dict: Dictionary;
}

export async function LatestPressSection({
  lang,
  dict,
}: LatestPressSectionProps) {
  const { data: pressItems, error } = await getCachedLatestPress(3);
  const pressListHref = buildLocalizedPath(lang, '/press');
  const homeHref = buildLocalizedPath(lang, '/');

  return (
    <Section>
      <Container className="space-y-8">
        <SectionHeading
          title={dict.home.latestPressTitle}
          subtitle={dict.home.latestPressSubtitle}
          action={
            !error && pressItems.length > 0 ? (
              <Link href={pressListHref}>
                <Button variant="outline">
                  {dict.common.viewAll}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            ) : undefined
          }
        />

        {error ? (
          <Card className="border-destructive/30">
            <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
                <AlertCircle className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {dict.press.errorTitle}
              </h3>
              <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
                {dict.press.errorDescription}
              </p>
              <Link href={homeHref} className="mt-5">
                <Button variant="outline">
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  {dict.common.retry}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : pressItems.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                <Newspaper className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {dict.press.emptyTitle}
              </h3>
              <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                {dict.press.emptyDescription}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pressItems.map((item) => (
              <PressCard
                key={item._id}
                item={item}
                lang={lang}
                readMoreLabel={dict.common.readMore}
              />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}

