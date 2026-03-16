import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unexpected UI error', error, errorInfo);
  }

  public render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 dark:bg-slate-950 dark:text-white">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center">
          <Card className="w-full overflow-hidden border-slate-200/70 bg-white/95 p-0 shadow-card dark:border-slate-800 dark:bg-slate-900/95">
            <div className="bg-[radial-gradient(circle_at_top_left,rgba(13,142,255,0.18),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,247,255,0.92))] p-8 dark:bg-[radial-gradient(circle_at_top_left,rgba(13,142,255,0.2),transparent_32%),linear-gradient(135deg,rgba(2,6,23,0.96),rgba(15,23,42,0.94))]">
              <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
                Falha inesperada
              </span>
              <h1 className="mt-5 text-3xl font-black tracking-tight">A interface encontrou um erro e foi isolada com segurança.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                Nenhum dado do backend foi alterado. Recarregue a aplicação para restaurar a sessão e tente novamente.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={() => window.location.reload()}>Recarregar aplicação</Button>
                <Button variant="secondary" onClick={() => this.setState({ hasError: false })}>
                  Tentar renderizar novamente
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }
}
