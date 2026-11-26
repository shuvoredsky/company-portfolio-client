export type NavKey = 'about' | 'press' | 'network' | 'contact';

export interface MainNavItem {
  key: NavKey;
  href: string;
}

/**
 * Single source of truth for main navbar & footer links.
 * Recruitment is intentionally excluded from the navbar (reached from Home modal).
 */
export const mainNavItems: readonly MainNavItem[] = [
  { key: 'about', href: '/about' },
  { key: 'press', href: '/press' },
  { key: 'network', href: '/network' },
  { key: 'contact', href: '/contact' },
] as const;
