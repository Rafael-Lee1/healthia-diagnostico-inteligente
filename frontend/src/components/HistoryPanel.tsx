import type { DiagnosisHistoryItem } from '@/types/history';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDateTime, formatDiagnosisLabel, summarizePatientContext } from '@/utils/format';

interface HistoryPanelProps {
  items?: DiagnosisHistoryItem[] | null;
  onRepeat: (item: DiagnosisHistoryItem) => void;
  onClear: () => void;
}

export function HistoryPanel({ items, onRepeat, onClear }: HistoryPanelProps) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <Card className="space-y-5 overflow-hidden border-white/70 bg-white/84 p-5 shadow-card dark:border-white/10 dark:bg-slate-900/78 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Histórico de consultas</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Salvo localmente no navegador. Entradas inválidas são ignoradas automaticamente.</p>
        </div>
        <Button variant="ghost" onClick={onClear} disabled={safeItems.length === 0}>
          Limpar histórico
        </Button>
      </div>

      {safeItems.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50/80 px-5 py-10 text-center dark:border-slate-700 dark:bg-slate-950/30">
          <p className="text-base font-semibold text-slate-800 dark:text-slate-100">Nenhuma análise salva ainda</p>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Envie sintomas para criar seu primeiro resultado. O histórico fica disponível para repetir consultas e comparar interpretações.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {safeItems.map((item) => {
            const diagnosis = Array.isArray(item.diagnosis) ? item.diagnosis : [];
            const symptoms = Array.isArray(item.symptoms) ? item.symptoms : [];
            const contextSummary = summarizePatientContext(item.patientContext);

            return (
            <article
                key={item.id}
                className="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(2,6,23,0.88))]"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      {formatDateTime(item.createdAt)}
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
                      {diagnosis.length > 0 ? diagnosis.map(formatDiagnosisLabel).join(', ') : 'Sem hipótese registrada'}
                    </p>
                    {item.warning ? (
                      <p className="mt-2 max-w-2xl text-sm text-amber-700 dark:text-amber-300">{item.warning}</p>
                    ) : null}
                    {item.topDiagnosisExplanation ? (
                      <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                        {item.topDiagnosisExplanation}
                      </p>
                    ) : null}
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => onRepeat(item)} disabled={symptoms.length === 0}>
                    Repetir consulta
                  </Button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {symptoms.length > 0 ? (
                    symptoms.map((symptom) => (
                      <span key={`${item.id}-${symptom}`} className="rounded-full bg-white px-3 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
                        {symptom}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700">
                      Sintomas não disponíveis
                    </span>
                  )}
                </div>

                {contextSummary.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {contextSummary.map((itemSummary) => (
                      <span
                        key={`${item.id}-${itemSummary}`}
                        className="rounded-full bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700 ring-1 ring-brand-100 dark:bg-brand-950/30 dark:text-brand-200 dark:ring-brand-900/40"
                      >
                        {itemSummary}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </Card>
  );
}
