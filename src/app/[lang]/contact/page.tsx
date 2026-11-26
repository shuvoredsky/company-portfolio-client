import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { PageHero } from '@/components/common/PageHero';
import { Section } from '@/components/common/Section';
import { ContactForm } from '@/components/contact/ContactForm';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { siteConfig } from '@/config/site';
import { isValidLocale } from '@/lib/i18n/config';
import { interpolate } from '@/lib/i18n/format';
import { getDictionary } from '@/lib/i18n/getDictionary';
import { buildPageMetadata } from '@/lib/seo';
import { parseSafeExternalUrl } from '@/lib/url';

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

function ContactFormSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-12 w-44 rounded-xl" />
    </div>
  );
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isValidLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const socialEntries = (
    [
      ['Facebook', siteConfig.social.facebook],
      ['LinkedIn', siteConfig.social.linkedin],
      ['Instagram', siteConfig.social.instagram],
      ['YouTube', siteConfig.social.youtube],
    ] as const
  ).flatMap(([name, url]) => {
    const safe = parseSafeExternalUrl(url);
    return safe ? [{ name, safe }] : [];
  });

  const telHref = siteConfig.contact.phone
    ? `tel:${siteConfig.contact.phone.replace(/[^\d+]/g, '')}`
    : '';

  return (
    <>
      <PageHero
        title={dict.contact.title}
        subtitle={dict.contact.subtitle}
      />

      <Section>
        <Container>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Left column: Contact information from siteConfig */}
            <div className="space-y-6 lg:col-span-5">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  {dict.contact.infoTitle}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {dict.contact.infoSubtitle}
                </p>
              </div>

              <Card>
                <CardContent className="space-y-5 p-6">
                  {siteConfig.contact.address ? (
                    <div className="flex items-start gap-3.5">
                      <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                        <MapPin className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                          {dict.contact.addressLabel}
                        </p>
                        <p className="break-words text-sm font-medium text-card-foreground sm:text-base">
                          {siteConfig.contact.address}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {siteConfig.contact.phone ? (
                    <div className="flex items-start gap-3.5">
                      <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                        <Phone className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                          {dict.contact.phoneLabel}
                        </p>
                        <a
                          href={telHref}
                          className="inline-flex min-h-10 items-center break-all text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-base"
                        >
                          {siteConfig.contact.phone}
                        </a>
                      </div>
                    </div>
                  ) : null}

                  {siteConfig.contact.email ? (
                    <div className="flex items-start gap-3.5">
                      <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                        <Mail className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                          {dict.contact.emailLabel}
                        </p>
                        <a
                          href={`mailto:${siteConfig.contact.email}`}
                          className="inline-flex min-h-10 items-center break-all text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-base"
                        >
                          {siteConfig.contact.email}
                        </a>
                      </div>
                    </div>
                  ) : null}

                  {socialEntries.length > 0 ? (
                    <div className="space-y-2.5 border-t border-border pt-4">
                      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        {dict.contact.socialLabel}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {socialEntries.map((item) => (
                          <a
                            key={item.name}
                            href={item.safe.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border bg-secondary/60 px-3.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <span>{item.name}</span>
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>

            {/* Right column: Contact Form */}
            <div className="lg:col-span-7">
              <Card>
                <CardContent className="space-y-6 p-6 sm:p-8">
                  <h2 className="text-xl font-bold tracking-tight text-card-foreground sm:text-2xl">
                    {dict.contact.formTitle}
                  </h2>

                  <Suspense fallback={<ContactFormSkeleton />}>
                    <ContactForm />
                  </Suspense>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
