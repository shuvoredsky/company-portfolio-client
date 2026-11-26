'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Brand } from '@/components/common/Brand';
import { Container } from '@/components/common/Container';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { LocaleLink } from '@/components/common/LocaleLink';
import { mainNavItems } from '@/config/navigation';
import { stripLocalePrefix } from '@/lib/i18n/config';
import { useDictionary } from '@/lib/i18n/LanguageContext';
import { cn } from '@/lib/utils';
import { MobileMenu } from './MobileMenu';

const MOBILE_MENU_ID = 'site-mobile-menu';

export function Navbar() {
  const dict = useDictionary();
  const pathname = usePathname() || '/';
  const currentRoute = stripLocalePrefix(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCloseMobile = useCallback(() => {
    setMobileOpen(false);
  }, [setMobileOpen]);

  const isRouteActive = (href: string): boolean => {
    return currentRoute === href || currentRoute.startsWith(`${href}/`);
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full bg-primary text-primary-foreground transition-shadow duration-200',
          scrolled && 'shadow-md',
        )}
      >
        <Container className="flex h-16 items-center justify-between gap-4 sm:h-18">
          <LocaleLink
            href="/"
            className="min-w-0 rounded-xl py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            <Brand inverted />
          </LocaleLink>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex lg:gap-8">
            <nav aria-label="Main navigation" className="flex items-center gap-1 lg:gap-2">
              {mainNavItems.map((item) => {
                const active = isRouteActive(item.href);
                return (
                  <LocaleLink
                    key={item.key}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative inline-flex min-h-10 items-center px-3 py-2 text-sm transition-colors duration-150 lg:text-base',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary rounded-lg',
                      active
                        ? 'font-semibold text-accent-strong hover:text-accent-strong'
                        : 'font-medium text-primary-foreground hover:text-accent',
                    )}
                  >
                    <span>{dict.nav[item.key]}</span>
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute right-3 bottom-0.5 left-3 h-0.5 rounded-full bg-accent-strong"
                      />
                    )}
                  </LocaleLink>
                );
              })}
            </nav>

            <LanguageSwitcher inverted />
          </div>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label={dict.nav.openMenu}
            aria-expanded={mobileOpen}
            aria-controls={MOBILE_MENU_ID}
            className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-primary-foreground transition-colors hover:bg-primary-foreground/10 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </Container>
      </header>

      <MobileMenu
        id={MOBILE_MENU_ID}
        open={mobileOpen}
        onClose={handleCloseMobile}
      />
    </>
  );
}
