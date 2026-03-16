import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { HistoryPanel } from '@/components/HistoryPanel';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import { PatientContextPanel } from '@/components/PatientContextPanel';
import { PredictionResult } from '@/components/PredictionResult';
import { SymptomInput } from '@/components/SymptomInput';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { COMMON_SYMPTOMS, MAX_SYMPTOMS, MIN_SYMPTOMS } from '@/constants/symptoms';
import { useDiagnosisHistory } from '@/hooks/useDiagnosisHistory';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/services/api';
import type { NormalizedPrediction, PatientContext } from '@/types/api';
import type { DiagnosisHistoryItem } from '@/types/history';
import { buildExportText, formatDiagnosisLabel, uniqueSymptoms } from '@/utils/format';

const EMPTY_PATIENT_CONTEXT: PatientContext = {
  age: null,
  sex: 'unknown',
  pregnant: null,
  comorbidities: [],
  medications: [],
  recent_conditions: [],
  recent_surgeries: null,
  lifestyle_notes: null,
};

export function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const { history, addEntry, clearHistory } = useDiagnosisHistory();
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [patientContext, setPatientContext] = useState<PatientContext>(EMPTY_PATIENT_CONTEXT);
  const [result, setResult] = useState<NormalizedPrediction | null>(null);
  const [resultCreatedAt, setResultCreatedAt] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [apiMessage, setApiMessage] = useState<string>('Conectando ao backend FastAPI');

  useEffect(() => {
    let active = true;

    api
      .getWelcome()
      .then((response) => {
        if (!active) {
          return;
        }
        setApiStatus('online');
        setApiMessage(response.message ?? response.Message ?? 'API educacional disponível');
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setApiStatus('offline');
        setApiMessage('Não foi possível validar a conexão com a API');
      });

    return () => {
      active = false;
    };
  }, []);

  const canSubmit = symptoms.length >= MIN_SYMPTOMS && symptoms.length <= MAX_SYMPTOMS && !isLoading;

  const summaryStats = useMemo(
    () => [
      { label: 'Consultas salvas', value: String(history.length).padStart(2, '0') },
      { label: 'Sintomas atuais', value: String(symptoms.length).padStart(2, '0') },
      { label: 'Ambiente', value: apiStatus === 'online' ? 'API online' : apiStatus === 'offline' ? 'Sem conexão' : 'Conectando' },
    ],
    [apiStatus, history.length, symptoms.length],
  );

  const executePrediction = async (currentSymptoms: string[], currentPatientContext: PatientContext = patientContext) => {
    const cleaned = uniqueSymptoms(currentSymptoms);

    if (cleaned.length < MIN_SYMPTOMS) {
      setFormError(`Informe pelo menos ${MIN_SYMPTOMS} sintomas para gerar uma análise consistente.`);
      return;
    }

    if (cleaned.length > MAX_SYMPTOMS) {
      setFormError(`Use no máximo ${MAX_SYMPTOMS} sintomas por análise.`);
      return;
    }

    setIsLoading(true);
    setFormError(null);
    setRequestError(null);

    try {
      const response = await api.predictSymptoms(cleaned, currentPatientContext);
      const timestamp = new Date().toISOString();

      setResult(response);
      setResultCreatedAt(timestamp);
      addEntry({
        createdAt: timestamp,
        symptoms: response.symptoms.length > 0 ? response.symptoms : cleaned,
        diagnosis: response.diagnosis,
        warning: response.warning,
        patientContext: response.patientContext ?? currentPatientContext,
        topDiagnosisExplanation: response.topDiagnosisExplanation,
      });
      setApiStatus('online');
    } catch (error) {
      setApiStatus('offline');
      setRequestError(
        api.isApiError(error)
          ? error.status >= 500
            ? 'O backend respondeu com falha interna. Tente novamente em instantes.'
            : error.details ?? error.message
          : 'Não foi possível concluir a análise agora. Verifique se o backend está em execução e tente novamente.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await executePrediction(symptoms);
  };

  const handleRepeatHistory = async (item: DiagnosisHistoryItem) => {
    setSymptoms(item.symptoms);
    const nextContext = item.patientContext ?? EMPTY_PATIENT_CONTEXT;
    setPatientContext(nextContext);
    await executePrediction(item.symptoms, nextContext);
  };

  const handleExport = () => {
    if (!result || !resultCreatedAt) {
      return;
    }

    const text = buildExportText({
      createdAt: resultCreatedAt,
      symptoms: result.symptoms,
      diagnosis: result.diagnosis,
      warning: result.warning,
      patientContext: result.patientContext,
      topDiagnosisExplanation: result.topDiagnosisExplanation,
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `healthia-resultado-${new Date(resultCreatedAt).getTime()}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(31,122,224,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(29,183,154,0.08),transparent_22%),linear-gradient(180deg,#f6f9fc_0%,#ecf2f7_100%)] text-slate-950 transition-colors dark:bg-[radial-gradient(circle_at_top_left,rgba(31,122,224,0.1),transparent_30%),radial-gradient(circle_at_top_right,rgba(29,183,154,0.07),transparent_25%),linear-gradient(180deg,#08101d_0%,#111827_100%)] dark:text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 md:px-6 md:py-8 xl:px-8">
        <Header theme={theme} onToggleTheme={toggleTheme} apiStatus={apiStatus} apiMessage={apiMessage} />

        <section className="grid gap-4 md:grid-cols-3">
          {summaryStats.map((item) => (
            <Card key={item.label} className="border-white/70 bg-white/78 p-5 shadow-panel dark:border-white/10 dark:bg-slate-900/70">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className="mt-3 text-3xl font-black tracking-tight text-ink-900 dark:text-white">{item.value}</p>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <SymptomInput
              symptoms={symptoms}
              suggestions={COMMON_SYMPTOMS}
              error={formError}
              onChange={(next) => {
                setSymptoms(uniqueSymptoms(next));
                setFormError(null);
                setRequestError(null);
              }}
            />

            <PatientContextPanel
              value={patientContext}
              onChange={(next) => {
                setPatientContext(next);
              }}
            />

            <Card className="space-y-6 border-white/70 bg-white/84 p-5 shadow-card dark:border-white/10 dark:bg-slate-900/78 md:p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Analysis control</p>
                  <h2 className="mt-2 text-[1.55rem] font-bold text-ink-900 dark:text-white">Pronto para analisar</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Envie uma lista separada por vírgulas. Exemplo: febre, cansaço, dor no corpo.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSymptoms([]);
                      setFormError(null);
                      setRequestError(null);
                      setResult(null);
                      setResultCreatedAt(null);
                      setPatientContext(EMPTY_PATIENT_CONTEXT);
                    }}
                    disabled={isLoading || symptoms.length === 0}
                  >
                    Limpar sintomas
                  </Button>
                  <Button type="submit" loading={isLoading} disabled={!canSubmit}>
                    {isLoading ? 'Analisando sintomas...' : 'Gerar diagnóstico'}
                  </Button>
                </div>
              </div>

              {requestError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200" role="alert">
                  {requestError}
                </div>
              ) : null}

              {isLoading ? (
                <div className="animate-rise rounded-[1.75rem] border border-brand-200 bg-brand-50/80 p-4 dark:border-brand-900/40 dark:bg-brand-950/20" aria-live="polite">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-3 w-3 animate-pulse rounded-full bg-brand-500" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-brand-800 dark:text-brand-200">Processando análise no backend</p>
                      <p className="mt-1 text-sm leading-6 text-brand-700/90 dark:text-brand-100/90">
                        A interface permanece estável enquanto a API consolida o texto de sintomas e calcula o ranking de hipóteses.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Como escrever</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Use termos simples e objetivos. Ex.: <span className="font-medium text-slate-700 dark:text-slate-200">fraqueza, visão turva, dificuldade para engolir</span>.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Integração ativa</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Backend consumido via <span className="font-medium text-slate-700 dark:text-slate-200">{api.baseUrl}</span> com suporte a ranking Top-N, avisos de baixa confiança e respostas parciais sem quebra de renderização.
                  </p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-4 text-sm leading-6 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                O contexto do paciente é opcional e serve apenas para qualificar a interpretação educacional. A ausência desses dados não impede a análise.
              </div>

              <MedicalDisclaimer />
            </Card>
          </form>

          <div className="space-y-6">
            {result && resultCreatedAt ? (
              <PredictionResult
                result={result}
                createdAt={resultCreatedAt}
                onExport={handleExport}
                onReset={() => {
                  setResult(null);
                  setResultCreatedAt(null);
                  setRequestError(null);
                }}
              />
            ) : (
              <Card className="animate-rise space-y-6 border-white/70 bg-white/82 p-6 shadow-card dark:border-white/10 dark:bg-slate-900/78">
                <div className="inline-flex w-fit rounded-full border border-brand-200/80 bg-brand-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 dark:border-brand-900/40 dark:bg-brand-950/30 dark:text-brand-200">
                  {apiStatus === 'offline' ? 'API offline' : 'Aguardando análise'}
                </div>
                <div>
                  <h2 className="text-[1.9rem] font-bold text-ink-900 dark:text-white">Seu resultado aparecerá aqui</h2>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                    {apiStatus === 'offline'
                      ? 'O backend não respondeu ao último check. Você ainda pode preparar os sintomas, mas o envio depende da API voltar a ficar disponível.'
                      : 'Assim que você enviar os sintomas, a interface exibirá o ranking de hipóteses, alertas de confiança e opção de exportação em texto.'}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-white/5">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Exemplo de interpretação</p>
                    <p className="mt-3 text-xl font-bold text-ink-900 dark:text-white">{formatDiagnosisLabel('doenca_lyme')}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Os nomes técnicos são convertidos para uma leitura mais clara, e o ranking só aparece quando houver confiança suficiente.</p>
                  </div>
                  <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,#1f7ae0_0%,#175fc0_100%)] p-5 text-white shadow-glow">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-100">What to expect</p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-white/85">
                      <li>Leitura principal em destaque</li>
                      <li>Ranking alternativo com confiança</li>
                      <li>Alertas do backend quando aplicáveis</li>
                    </ul>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </section>

        <section>
          <HistoryPanel items={history} onRepeat={handleRepeatHistory} onClear={clearHistory} />
        </section>
      </div>
    </div>
  );
}
