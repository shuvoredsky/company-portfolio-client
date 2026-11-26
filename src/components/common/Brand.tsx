/**
 * Reusable text-based Brand logo driven solely by src/config/site.ts.
 *
 * HOW TO SWAP FOR AN IMAGE LOGO LATER:
 * 1. Place your logo file in public/images/logo.svg (or logo.png).
 * 2. Import `Image` from 'next/image' and replace the icon badge below with:
 *    `<Image src="/images/logo.svg" alt={siteConfig.brandName} width={36} height={36} priority />`.
 */
import { Sprout } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

export interface BrandProps {
  inverted?: boolean;
  className?: string;
}

export function Brand({ inverted = false, className }: BrandProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-xs',
          inverted
            ? 'bg-primary-foreground/15 text-accent ring-1 ring-primary-foreground/25'
            : 'bg-primary text-primary-foreground',
        )}
      >
        <Sprout className="h-5 w-5" />
      </span>
      <span
        className={cn(
          'truncate text-base font-bold tracking-tight sm:text-lg',
          inverted ? 'text-primary-foreground' : 'text-foreground',
        )}
      >
        {siteConfig.brandName}
      </span>
    </span>
  );
}

