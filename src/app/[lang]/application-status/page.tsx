import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/common/Container';
import { PageHero } from '@/components/common/PageHero';
import { Section } from '@/components/common/Section';
import { ApplicationStatusForm } from '@/components/application/ApplicationStatusForm';
import { Card, CardContent } from '@/components/ui/Card';
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
    path: '/application-status',
    title: dict.applicationStatus.metaTitle,
    description: interpolate(dict.applicationStatus.metaDescription),
    noIndex: true,
  });
}

export default async function ApplicationStatusPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <>
      <PageHero
        title={dict.applicationStatus.title}
        subtitle={dict.applicationStatus.subtitle}
      />

      <Section>
        <Container className="max-w-xl">
          <Card>
            <CardContent className="space-y-6 p-6 sm:p-8">
              <h2 className="text-xl font-bold tracking-tight text-card-foreground sm:text-2xl">
                {dict.applicationStatus.cardTitle}
              </h2>
              <ApplicationStatusForm />
            </CardContent>
          </Card>
        </Container>
      </Section>
    </>
  );
}

