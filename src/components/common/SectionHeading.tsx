import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2';
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  action,
  align = 'left',
  as = 'h2',
  className,
}: SectionHeadingProps) {
  const HeadingTag = as;

  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center'
          ? 'items-center text-center'
          : 'sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className={cn('min-w-0 space-y-2', align === 'center' && 'max-w-2xl')}>
        <HeadingTag
          className={cn(
            'font-bold tracking-tight text-foreground',
            as === 'h1'
              ? 'text-3xl sm:text-4xl lg:text-5xl'
              : 'text-2xl sm:text-3xl',
          )}
        >
          {title}
        </HeadingTag>
        {subtitle && (
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {subtitle}
          </p>
        )}
      </div>

      {action && align === 'left' && (
        <div className="shrink-0">{action}</div>
      )}
    </div>
  );
}

