import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[1.75rem] border border-white/70 bg-white/82 p-6 shadow-panel backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/78 dark:shadow-card',
        className,
      )}
      {...props}
    />
  );
}
