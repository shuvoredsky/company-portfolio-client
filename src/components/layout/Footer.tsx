import { Mail, MapPin, Phone } from 'lucide-react';
import type { ReactNode } from 'react';
import { Brand } from '@/components/common/Brand';
import { Container } from '@/components/common/Container';
import { LocaleLink } from '@/components/common/LocaleLink';
import { footerExtraLinks, mainNavItems } from '@/config/navigation';
import { siteConfig, type Locale } from '@/config/site';
import { type Dictionary } from '@/lib/i18n/getDictionary';

interface SocialEntry {
  key: keyof typeof siteConfig.social;
  label: string;
  href: string;
  icon: ReactNode;
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

async function getCurrentYear(): Promise<number> {
  'use cache';
  return new Date().getFullYear();
}

export interface FooterProps {
  lang: Locale;
  dict: Dictionary;
}

export async function Footer({ lang, dict }: FooterProps) {
  const currentYear = await getCurrentYear();
  const allSocials: SocialEntry[] = [
    {
      key: 'facebook',
      label: 'Facebook',
      href: siteConfig.social.facebook,
      icon: <FacebookIcon />,
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      href: siteConfig.social.linkedin,
      icon: <LinkedInIcon />,
    },
    {
      key: 'instagram',
      label: 'Instagram',
      href: siteConfig.social.instagram,
      icon: <InstagramIcon />,
    },
    {
      key: 'youtube',
      label: 'YouTube',
      href: siteConfig.social.youtube,
      icon: <YouTubeIcon />,
    },
  ];
  const socialLinks = allSocials.filter((item) => item.href.trim().length > 0);

  return (
    <footer className="border-t border-primary/20 bg-primary-deep text-primary-foreground">
      <Container className="py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand & Tagline */}
          <div className="space-y-4">
            <LocaleLink
              href="/"
              lang={lang}
              className="inline-block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Brand inverted />
            </LocaleLink>
            <p className="max-w-sm text-sm leading-relaxed text-primary-foreground/80">
              {dict.footer.tagline}
            </p>
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {socialLinks.map(({ key, label, href, icon }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-primary-foreground/20 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links & Contact side-by-side on mobile, separate grid columns on md+ */}
          <div className="flex items-start justify-between gap-6 md:col-span-2 md:grid md:grid-cols-2 md:gap-10">
            {/* Quick Links */}
            <div className="min-w-0 shrink-0 space-y-4">
              <h2 className="text-sm font-semibold tracking-wider text-accent uppercase">
                {dict.footer.quickLinksTitle}
              </h2>
              <ul className="space-y-2.5 text-sm">
                {mainNavItems.map((item) => (
                  <li key={item.key}>
                    <LocaleLink
                      href={item.href}
                      lang={lang}
                      className="inline-flex min-h-8 items-center rounded text-primary-foreground/85 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {dict.nav[item.key]}
                    </LocaleLink>
                  </li>
                ))}
                {footerExtraLinks.map((item) => (
                  <li key={item.key}>
                    <LocaleLink
                      href={item.href}
                      lang={lang}
                      className="inline-flex min-h-8 items-center rounded text-primary-foreground/85 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {dict.footer[item.key]}
                    </LocaleLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Details */}
            <div className="min-w-0 flex-1 space-y-4">
              <h2 className="text-sm font-semibold tracking-wider text-accent uppercase">
                {dict.footer.contactTitle}
              </h2>
              <ul className="space-y-3 text-sm text-primary-foreground/85">
                {siteConfig.contact.address && (
                  <li className="flex items-start gap-2">
                    <MapPin
                      className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                      aria-hidden="true"
                    />
                    <span className="break-words">{siteConfig.contact.address}</span>
                  </li>
                )}
                {siteConfig.contact.phone && (
                  <li className="flex items-center gap-2">
                    <Phone
                      className="h-4 w-4 shrink-0 text-accent"
                      aria-hidden="true"
                    />
                    <a
                      href={`tel:${siteConfig.contact.phone.replace(/\s+/g, '')}`}
                      className="break-all rounded transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {siteConfig.contact.phone}
                    </a>
                  </li>
                )}
                {siteConfig.contact.email && (
                  <li className="flex items-center gap-2">
                    <Mail
                      className="h-4 w-4 shrink-0 text-accent"
                      aria-hidden="true"
                    />
                    <a
                      href={`mailto:${siteConfig.contact.email}`}
                      className="break-all rounded transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {siteConfig.contact.email}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/15 pt-6 text-center text-xs text-primary-foreground/75 sm:text-left">
          &copy; {currentYear} {siteConfig.brandName}. {dict.footer.rights}
        </div>
      </Container>
    </footer>
  );
}
