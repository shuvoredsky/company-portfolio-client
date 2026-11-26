import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/common/Container';
import { Section } from '@/components/common/Section';
import { SectionHeading } from '@/components/common/SectionHeading';
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
    path: '/contact',
    title: dict.contact.metaTitle,
    description: interpolate(dict.contact.metaDescription),
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <Section>
      <Container className="space-y-6">
        <SectionHeading
          as="h1"
          title={dict.contact.title}
          subtitle={dict.contact.subtitle}
        />
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            {dict.contact.comingSoon}
          </CardContent>
        </Card>
      </Container>
    </Section>
  );
}

