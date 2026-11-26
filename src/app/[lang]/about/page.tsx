import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight, Eye, Leaf, ShieldCheck, Sprout, Target, Users } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { LocaleLink } from '@/components/common/LocaleLink';
import { PageHero } from '@/components/common/PageHero';
import { Section } from '@/components/common/Section';
import { SectionHeading } from '@/components/common/SectionHeading';
import { buttonVariants } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { isValidLocale } from '@/lib/i18n/config';
import { interpolate } from '@/lib/i18n/format';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { buildPageMetadata } from '@/lib/seo';
import { cn } from '@/lib/utils';

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
    path: '/about',
    title: dict.about.metaTitle,
    description: interpolate(dict.about.metaDescription),
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const values = [
    {
      key: 'sustainability',
      icon: Leaf,
      title: dict.about.values.sustainability.title,
      description: dict.about.values.sustainability.description,
    },
    {
      key: 'quality',
      icon: ShieldCheck,
      title: dict.about.values.quality.title,
      description: dict.about.values.quality.description,
    },
    {
      key: 'community',
      icon: Users,
      title: dict.about.values.community.title,
      description: dict.about.values.community.description,
    },
    {
      key: 'innovation',
      icon: Sprout,
      title: dict.about.values.innovation.title,
      description: dict.about.values.innovation.description,
    },
  ] as const;

  return (
    <>
      <PageHero
        title={interpolate(dict.about.title)}
        subtitle={dict.about.subtitle}
      />

      {/* Who we are */}
      <Section>
        <Container>
          <div className="max-w-3xl space-y-5">
            <SectionHeading as="h2" title={dict.about.whoWeAreTitle} />
            <p className="text-base leading-relaxed text-foreground sm:text-lg">
              {interpolate(dict.about.whoWeAreParagraph1)}
            </p>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              {interpolate(dict.about.whoWeAreParagraph2)}
            </p>
          </div>
        </Container>
      </Section>

      {/* Mission & Vision */}
      <Section className="bg-secondary/50">
        <Container>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="h-full">
              <CardContent className="flex h-full flex-col gap-4 p-6 sm:p-8">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Target className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-card-foreground sm:text-2xl">
                  {dict.about.missionTitle}
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {interpolate(dict.about.missionDescription)}
                </p>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardContent className="flex h-full flex-col gap-4 p-6 sm:p-8">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Eye className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-card-foreground sm:text-2xl">
                  {dict.about.visionTitle}
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  {interpolate(dict.about.visionDescription)}
                </p>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Our Values */}
      <Section>
        <Container className="space-y-8 sm:space-y-10">
          <SectionHeading
            as="h2"
            title={dict.about.valuesTitle}
            subtitle={dict.about.valuesSubtitle}
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.key} className="h-full">
                  <CardContent className="flex h-full flex-col gap-3 p-6">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold text-card-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Closing CTA */}
      <Section className="bg-secondary/50">
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-primary p-6 text-primary-foreground sm:p-10 md:flex-row md:items-center">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
                {dict.about.ctaTitle}
              </h2>
              <p className="text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
                {interpolate(dict.about.ctaDescription)}
              </p>
            </div>

            <LocaleLink
              href="/contact"
              className={cn(
                buttonVariants({ variant: 'accent', size: 'lg' }),
                'shrink-0',
              )}
            >
              <span>{dict.about.ctaButton}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </LocaleLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
