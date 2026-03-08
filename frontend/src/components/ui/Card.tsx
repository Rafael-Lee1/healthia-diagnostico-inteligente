import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-white/60 bg-white/80 p-6 shadow-card backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/85',
        className,
      )}
      {...props}
    />
  );
}
