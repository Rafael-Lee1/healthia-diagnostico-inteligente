import type { DiagnosisHistoryItem } from '@/types/history';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDateTime, formatDiagnosisLabel } from '@/utils/format';

interface HistoryPanelProps {
  items: DiagnosisHistoryItem[];
  onRepeat: (item: DiagnosisHistoryItem) => void;
  onClear: () => void;
}

export function HistoryPanel({ items, onRepeat, onClear }: HistoryPanelProps) {
  return (
    <Card className="space-y-5 p-5 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Histórico de consultas</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Salvo localmente no navegador com data e hora.</p>
        </div>
        <Button variant="ghost" onClick={onClear} disabled={items.length === 0}>Limpar histórico</Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Nenhuma consulta registrada ainda. Sua próxima análise aparecerá aqui.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    {formatDateTime(item.createdAt)}
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-950 dark:text-white">
                    {item.diagnosis.map(formatDiagnosisLabel).join(', ')}
                  </p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => onRepeat(item)}>Repetir consulta</Button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.symptoms.map((symptom) => (
                  <span key={`${item.id}-${symptom}`} className="rounded-full bg-white px-3 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
                    {symptom}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}
