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
    'bg-[linear-gradient(135deg,#1f7ae0_0%,#175fc0_100%)] text-white shadow-glow hover:-translate-y-0.5 hover:brightness-[1.03] active:translate-y-0 focus-visible:ring-brand-300 dark:bg-[linear-gradient(135deg,#2d8cf0_0%,#175fc0_100%)]',
  secondary:
    'bg-white/88 text-ink-900 ring-1 ring-slate-200/80 shadow-sm hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:translate-y-0 dark:bg-slate-800/90 dark:text-slate-100 dark:ring-white/10 dark:hover:bg-slate-700/90',
  ghost:
    'bg-transparent text-slate-700 hover:bg-white/70 hover:text-slate-900 active:bg-white/90 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white',
  danger:
    'bg-[linear-gradient(135deg,#f43f5e_0%,#e11d48_100%)] text-white hover:-translate-y-0.5 hover:brightness-[1.03] active:translate-y-0 focus-visible:ring-rose-300',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-11 px-5 text-sm md:text-[15px]',
  lg: 'h-12 px-6 text-base',
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
        'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold tracking-[0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-55',
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
