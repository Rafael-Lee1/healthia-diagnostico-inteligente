import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-500 text-white shadow-glow hover:bg-brand-600 focus-visible:ring-brand-300 dark:bg-brand-500 dark:hover:bg-brand-400',
  secondary:
    'bg-white/80 text-slate-900 ring-1 ring-slate-200 hover:bg-white dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-700',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
  danger:
    'bg-rose-500 text-white hover:bg-rose-600 focus-visible:ring-rose-300',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-10 px-3 text-sm',
  md: 'h-11 px-4 text-sm md:text-base',
  lg: 'h-12 px-5 text-base',
};

export function Button({
  className,
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  iconLeft,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      ) : (
        iconLeft
      )}
      <span>{children}</span>
    </button>
  );
}
