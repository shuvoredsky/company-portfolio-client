import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError = false, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={hasError || undefined}
        className={cn(
          'flex min-h-28 w-full rounded-xl border bg-card px-3.5 py-2.5 text-base text-foreground shadow-xs transition-colors',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
          'disabled:cursor-not-allowed disabled:opacity-55',
          hasError
            ? 'border-destructive focus-visible:ring-destructive'
            : 'border-input hover:border-ring/60',
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';

