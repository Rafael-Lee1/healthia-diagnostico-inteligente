import { ApiStatusBadge } from '@/components/ApiStatusBadge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card } from '@/components/ui/Card';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  apiStatus: 'checking' | 'online' | 'offline';
  apiMessage?: string;
}

export function Header({ theme, onToggleTheme, apiStatus, apiMessage }: HeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-hero p-6 shadow-card dark:border-slate-800 dark:bg-hero-dark md:p-8">
      <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-brand-300/20 blur-3xl dark:bg-brand-500/20" aria-hidden="true" />
      <div className="absolute right-0 top-0 h-48 w-48 animate-float rounded-full bg-accent-500/10 blur-3xl" aria-hidden="true" />

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 dark:border-brand-900/40 dark:bg-brand-950/30 dark:text-brand-200">
              HealthIA • Diagnóstico assistido
            </span>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
              Triagem inteligente por sintomas, com experiência pronta para uso real.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
              Informe sinais e sintomas em linguagem natural, acompanhe o histórico das análises e obtenha um resultado claro, elegante e integrado ao backend FastAPI já existente.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <ApiStatusBadge status={apiStatus} message={apiMessage} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-white/70 p-5 dark:bg-slate-900/70">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Experiência</p>
            <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">Formulário inteligente</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Chips, autocomplete, validação forte e microinterações acessíveis.</p>
          </Card>
          <Card className="bg-white/70 p-5 dark:bg-slate-900/70">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Fluxo</p>
            <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">Predição em tempo real</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Estados claros de carregamento, erro e sucesso com interpretação amigável.</p>
          </Card>
          <Card className="bg-white/70 p-5 dark:bg-slate-900/70">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Produtividade</p>
            <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">Histórico local</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Consulte, repita, exporte e limpe análises anteriores com um clique.</p>
          </Card>
        </div>
      </div>
    </header>
  );
}
