import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDateTime, formatDiagnosisLabel } from '@/utils/format';

interface PredictionResultProps {
  symptoms: string[];
  diagnosis: string[];
  createdAt: string;
  onExport: () => void;
  onReset: () => void;
}

export function PredictionResult({ symptoms, diagnosis, createdAt, onExport, onReset }: PredictionResultProps) {
  return (
    <Card className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <span className="inline-flex rounded-full bg-accent-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-600 dark:text-accent-500">
            Resultado disponível
          </span>
          <h2 className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">Diagnóstico previsto</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Análise gerada em {formatDateTime(createdAt)}.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={onExport}>Exportar em texto</Button>
          <Button variant="ghost" onClick={onReset}>Nova análise</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-glow">
          <p className="text-sm font-medium text-brand-100">Interpretação amigável</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {diagnosis.map((item) => (
              <span key={item} className="rounded-full bg-white/15 px-4 py-2 text-lg font-semibold backdrop-blur-sm">
                {formatDiagnosisLabel(item)}
              </span>
            ))}
          </div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-brand-50/90">
            Este retorno representa a interpretação do modelo para os sintomas enviados. Use como apoio inicial para triagem e não como confirmação diagnóstica definitiva.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/40">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sintomas analisados</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {symptoms.map((symptom) => (
              <span key={symptom} className="rounded-full bg-white px-3 py-2 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
                {symptom}
              </span>
            ))}
          </div>
        </div>
      </div>

      <MedicalDisclaimer />
    </Card>
  );
}
