import { cn } from '@/utils/cn';

type ApiStatus = 'checking' | 'online' | 'offline';

interface ApiStatusBadgeProps {
  status: ApiStatus;
  message?: string;
}

const statusMap: Record<ApiStatus, { label: string; dot: string; tone: string }> = {
  checking: {
    label: 'Verificando API',
    dot: 'bg-amber-400',
    tone: 'text-amber-700 dark:text-amber-300',
  },
  online: {
    label: 'API conectada',
    dot: 'bg-accent-500',
    tone: 'text-emerald-700 dark:text-emerald-300',
  },
  offline: {
    label: 'API indisponível',
    dot: 'bg-rose-500',
    tone: 'text-rose-700 dark:text-rose-300',
  },
};

export function ApiStatusBadge({ status, message }: ApiStatusBadgeProps) {
  const current = statusMap[status];

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-sm shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
      <span className={cn('h-2.5 w-2.5 rounded-full', current.dot, status === 'checking' && 'animate-pulse')} aria-hidden="true" />
      <div className="flex flex-col">
        <span className={cn('font-semibold', current.tone)}>{current.label}</span>
        {message ? <span className="text-xs text-slate-500 dark:text-slate-400">{message}</span> : null}
      </div>
    </div>
  );
}
