'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { Brand } from '@/components/common/Brand';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { LocaleLink } from '@/components/common/LocaleLink';
import { mainNavItems } from '@/config/navigation';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { stripLocalePrefix } from '@/lib/i18n/config';
import { useDictionary } from '@/lib/i18n/LanguageContext';
import { cn } from '@/lib/utils';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface MobileMenuProps {
  id: string;
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ id, open, onClose }: MobileMenuProps) {
  const dict = useDictionary();
  const pathname = usePathname() || '/';
  const currentRoute = stripLocalePrefix(pathname);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevPathnameRef = useRef(pathname);

  useBodyScrollLock(open);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname && open) {
      onClose();
    }
    prevPathnameRef.current = pathname;
  }, [pathname, open, onClose]);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => {
      const firstFocusable =
        panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (firstFocusable ?? panelRef.current)?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'Tab' && panelRef.current) {
        const focusables = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!first || !last) return;

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const isRouteActive = (href: string): boolean => {
    return currentRoute === href || currentRoute.startsWith(`${href}/`);
  };

  return (
    <div
      id={id}
      className="fixed inset-0 z-50 flex justify-end md:hidden"
      role="presentation"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-foreground/50 backdrop-blur-xs"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={dict.nav.openMenu}
        tabIndex={-1}
        className="relative z-10 flex h-full w-80 max-w-[85vw] flex-col bg-primary text-primary-foreground shadow-2xl focus:outline-none"
      >
        <div className="flex h-16 items-center justify-between border-b border-primary-foreground/15 px-4">
          <LocaleLink
            href="/"
            onClick={onClose}
            className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Brand inverted />
          </LocaleLink>
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.nav.closeMenu}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-primary-foreground transition-colors hover:bg-primary-foreground/10 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav
          aria-label="Mobile navigation"
          className="flex-1 space-y-1.5 px-4 py-6"
        >
          {mainNavItems.map((item) => {
            const active = isRouteActive(item.href);
            return (
              <LocaleLink
                key={item.key}
                href={item.href}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-11 items-center justify-between rounded-xl px-4 py-2.5 text-base transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  active
                    ? 'bg-primary-foreground/12 font-semibold text-accent-strong'
                    : 'font-medium text-primary-foreground hover:bg-primary-foreground/10 hover:text-accent',
                )}
              >
                <span>{dict.nav[item.key]}</span>
                {active && (
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-accent-strong"
                  />
                )}
              </LocaleLink>
            );
          })}
        </nav>

        <div className="border-t border-primary-foreground/15 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary-foreground/85">
              {dict.language.label}
            </span>
            <LanguageSwitcher inverted onSelect={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}

