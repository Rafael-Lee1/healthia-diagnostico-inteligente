import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatConfidence, formatDateTime, formatDiagnosisLabel, summarizePatientContext } from '@/utils/format';
import type { NormalizedPrediction } from '@/types/api';

interface PredictionResultProps {
  result: NormalizedPrediction;
  createdAt: string;
  onExport: () => void;
  onReset: () => void;
}

export function PredictionResult({ result, createdAt, onExport, onReset }: PredictionResultProps) {
  const symptoms = Array.isArray(result.symptoms) ? result.symptoms : [];
  const diagnosis = Array.isArray(result.diagnosis) ? result.diagnosis : [];
  const predictions = Array.isArray(result.predictions) ? result.predictions : [];
  const contextSummary = summarizePatientContext(result.patientContext);

  return (
    <Card className="animate-rise space-y-6 overflow-hidden border-white/70 bg-white/86 p-6 shadow-card dark:border-white/10 dark:bg-slate-900/82">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <span className="inline-flex rounded-full bg-accent-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-600 dark:text-accent-500">
            {result.hasPredictions ? 'Resultado disponível' : 'Resposta processada'}
          </span>
          <h2 className="mt-3 text-2xl font-bold text-slate-950 dark:text-white">
            {result.hasPredictions ? 'Hipóteses sugeridas pelo modelo' : 'Sem hipótese confiável no momento'}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Análise gerada em {formatDateTime(createdAt)}.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={onExport}>
            Exportar em texto
          </Button>
          <Button variant="ghost" onClick={onReset}>
            Nova análise
          </Button>
        </div>
      </div>

      {result.warning ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          {result.warning}
        </div>
      ) : null}

      {result.topDiagnosisExplanation ? (
        <div className="rounded-[1.5rem] border border-brand-200/80 bg-brand-50/80 px-4 py-4 text-sm leading-7 text-brand-900 dark:border-brand-900/40 dark:bg-brand-950/20 dark:text-brand-100">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-200">
            Explicação principal
          </p>
          <p className="mt-2">{result.topDiagnosisExplanation}</p>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.85rem] bg-[linear-gradient(135deg,#1f7ae0_0%,#175fc0_52%,#16233b_100%)] p-6 text-white shadow-glow">
          <p className="text-sm font-medium text-brand-100">Leitura principal</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {diagnosis.length > 0 ? (
              diagnosis.map((item) => (
                <span key={item} className="rounded-full bg-white/12 px-4 py-2 text-lg font-semibold backdrop-blur-sm">
                  {formatDiagnosisLabel(item)}
                </span>
              ))
            ) : (
              <span className="rounded-full bg-white/12 px-4 py-2 text-base font-semibold backdrop-blur-sm">
                Dados insuficientes para ranking confiável
              </span>
            )}
          </div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-brand-50/90">
            Este retorno representa a interpretação do modelo para os sintomas enviados. Use como apoio inicial para triagem e não como confirmação diagnóstica definitiva.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sintomas analisados</p>
          {symptoms.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {symptoms.map((symptom) => (
                <span key={symptom} className="rounded-full bg-white px-3 py-2 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
                  {symptom}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">O backend não retornou sintomas estruturados. A interface preservou a resposta sem quebrar.</p>
          )}

          {contextSummary.length > 0 ? (
            <div className="mt-5 border-t border-slate-200/80 pt-4 dark:border-white/10">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Contexto considerado</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {contextSummary.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-white px-3 py-2 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.88))] p-5 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.82))]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Top predições</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ranking exibido apenas quando a API retorna confiança suficiente.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {predictions.length} itens
          </span>
        </div>

        {predictions.length > 0 ? (
          <div className="mt-4 space-y-3">
            {predictions.map((prediction, index) => (
              <div
                key={`${prediction.disease ?? 'prediction'}-${index}`}
                className="rounded-[1.35rem] border border-slate-200/80 bg-white/84 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-950 dark:text-white">
                      {formatDiagnosisLabel(prediction.disease ?? '')}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {prediction.domain ? `Categoria: ${prediction.domain}` : 'Categoria não informada'}
                      {prediction.severity ? ` • Gravidade: ${prediction.severity}` : ''}
                      {prediction.is_emergency ? ' • Potencial urgência' : ''}
                    </p>
                  </div>
                  <div className="rounded-full bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 ring-1 ring-brand-100 dark:bg-brand-950/30 dark:text-brand-200 dark:ring-brand-900/40">
                    Confiança {formatConfidence(prediction.confidence ?? 0)}
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#16c79a_0%,#0d8eff_100%)] transition-all duration-500"
                    style={{ width: formatConfidence(prediction.confidence ?? 0) }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/30 dark:text-slate-400">
            O backend respondeu, mas preferiu não exibir ranking porque a confiança foi baixa ou a entrada não trouxe sinal suficiente.
          </div>
        )}

      </div>

      {result.disclaimer ? (
        <div className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          {result.disclaimer}
        </div>
      ) : null}

      <MedicalDisclaimer />
    </Card>
  );
}
