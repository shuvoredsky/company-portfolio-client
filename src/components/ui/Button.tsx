import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'accent';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:opacity-95',
  secondary:
    'bg-secondary text-secondary-foreground border border-border hover:bg-muted',
  outline:
    'border border-border bg-card text-foreground hover:bg-secondary hover:text-secondary-foreground',
  ghost:
    'bg-transparent text-foreground hover:bg-secondary hover:text-secondary-foreground',
  accent:
    'bg-accent-strong text-accent-strong-foreground shadow-sm hover:bg-accent',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-3.5 text-sm rounded-lg',
  md: 'min-h-11 px-5 text-sm rounded-xl',
  lg: 'min-h-12 px-6 text-base rounded-xl',
};

export function buttonVariants({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(
    'inline-flex cursor-pointer items-center justify-center gap-2 font-medium transition-all duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-55',
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      type = 'button',
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        className={buttonVariants({ variant, size, className })}
        {...props}
      >
        {isLoading && <Spinner size="sm" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

