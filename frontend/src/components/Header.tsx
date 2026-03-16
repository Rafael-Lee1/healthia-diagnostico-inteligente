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
    <header className="relative overflow-hidden rounded-[2.25rem] border border-white/70 bg-hero px-6 py-6 shadow-card dark:border-white/10 dark:bg-hero-dark md:px-8 md:py-8">
      <div className="absolute inset-0 bg-mesh opacity-80 dark:opacity-100" aria-hidden="true" />
      <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-brand-300/20 blur-3xl dark:bg-brand-500/20" aria-hidden="true" />
      <div className="absolute right-0 top-0 h-48 w-48 animate-float rounded-full bg-accent-500/10 blur-3xl" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200/70 to-transparent dark:via-white/10" aria-hidden="true" />

      <div className="relative z-10 flex flex-col gap-8">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-brand-200/80 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-700 shadow-sm dark:border-brand-900/40 dark:bg-brand-950/20 dark:text-brand-200">
              HealthIA • AI Triage Workspace
            </span>
            <h1 className="mt-5 max-w-3xl text-[2.45rem] font-black leading-[1.02] text-ink-900 dark:text-white md:text-[3.35rem]">
              Interface clínica moderna para análise de sintomas com confiança visual.
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-ink-600 dark:text-slate-300 md:text-lg">
              Uma experiência de triagem educacional desenhada para parecer produto real: linguagem natural, retorno estruturado, histórico persistente e integração direta com o backend.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-ink-600 dark:text-slate-300">
              <span className="rounded-full border border-slate-200/80 bg-white/72 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                Top-N predictions
              </span>
              <span className="rounded-full border border-slate-200/80 bg-white/72 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                Histórico local resiliente
              </span>
              <span className="rounded-full border border-slate-200/80 bg-white/72 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
                Estados de erro e carregamento
              </span>
            </div>
          </div>

          <div className="flex min-w-[280px] flex-col gap-3 xl:items-end">
            <div className="flex flex-wrap gap-3 xl:justify-end">
              <ThemeToggle theme={theme} onToggle={onToggleTheme} />
              <ApiStatusBadge status={apiStatus} message={apiMessage} />
            </div>
            <Card className="w-full border-white/70 bg-white/68 p-4 shadow-panel dark:border-white/10 dark:bg-white/5 xl:max-w-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Session overview</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Positioning</p>
                  <p className="mt-1 text-sm font-semibold text-ink-900 dark:text-white">Educational clinical support</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Experience</p>
                  <p className="mt-1 text-sm font-semibold text-ink-900 dark:text-white">Fast, focused, investor-ready</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-white/68 p-5 dark:bg-white/5">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Entrada</p>
            <p className="mt-2 text-[1.45rem] font-bold text-ink-900 dark:text-white">Formulário assistido</p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Sintomas em chips, sugestões rápidas e foco visual claro para reduzir atrito no preenchimento.</p>
          </Card>
          <Card className="bg-white/68 p-5 dark:bg-white/5">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Resposta</p>
            <p className="mt-2 text-[1.45rem] font-bold text-ink-900 dark:text-white">Resultado orientado por confiança</p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Ranking claro, leitura principal destacada e avisos exibidos sem poluir a interface.</p>
          </Card>
          <Card className="bg-white/68 p-5 dark:bg-white/5">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Memória</p>
            <p className="mt-2 text-[1.45rem] font-bold text-ink-900 dark:text-white">Histórico reutilizável</p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">As análises ficam acessíveis para repetição, comparação e demonstrações mais fluidas.</p>
          </Card>
        </div>
      </div>
    </header>
  );
}
