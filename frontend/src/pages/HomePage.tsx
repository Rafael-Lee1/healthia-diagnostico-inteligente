import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { HistoryPanel } from '@/components/HistoryPanel';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import { PredictionResult } from '@/components/PredictionResult';
import { SymptomInput } from '@/components/SymptomInput';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { COMMON_SYMPTOMS, MAX_SYMPTOMS, MIN_SYMPTOMS } from '@/constants/symptoms';
import { useDiagnosisHistory } from '@/hooks/useDiagnosisHistory';
import { useTheme } from '@/hooks/useTheme';
import { api } from '@/services/api';
import type { PredictResponse } from '@/types/api';
import type { DiagnosisHistoryItem } from '@/types/history';
import { buildExportText, formatDiagnosisLabel, uniqueSymptoms } from '@/utils/format';

export function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const { history, addEntry, clearHistory } = useDiagnosisHistory();
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [result, setResult] = useState<PredictResponse | null>(null);
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
        setApiMessage(response.Message);
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

  const executePrediction = async (currentSymptoms: string[]) => {
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
      const response = await api.predictSymptoms(cleaned);
      const timestamp = new Date().toISOString();

      setResult(response);
      setResultCreatedAt(timestamp);
      addEntry({
        createdAt: timestamp,
        symptoms: response.sintomas,
        diagnosis: response.diagnostico_previsto,
      });
    } catch {
      setRequestError('Não foi possível concluir a análise agora. Verifique se o backend está em execução e tente novamente.');
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
    await executePrediction(item.symptoms);
  };

  const handleExport = () => {
    if (!result || !resultCreatedAt) {
      return;
    }

    const text = buildExportText({
      createdAt: resultCreatedAt,
      symptoms: result.sintomas,
      diagnosis: result.diagnostico_previsto,
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
    <div className="min-h-screen bg-slate-100 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 md:px-6 md:py-8">
        <Header theme={theme} onToggleTheme={toggleTheme} apiStatus={apiStatus} apiMessage={apiMessage} />

        <section className="grid gap-4 md:grid-cols-3">
          {summaryStats.map((item) => (
            <Card key={item.label} className="p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">{item.value}</p>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
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

            <Card className="space-y-5 p-5 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-950 dark:text-white">Pronto para analisar</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
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

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Como escrever</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Use termos simples e objetivos. Ex.: <span className="font-medium text-slate-700 dark:text-slate-200">fraqueza, visão turva, dificuldade para engolir</span>.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Integração ativa</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Backend consumido via <span className="font-medium text-slate-700 dark:text-slate-200">{api.baseUrl}</span> sem endpoints extras nem dados simulados.
                  </p>
                </div>
              </div>

              <MedicalDisclaimer />
            </Card>
          </form>

          <div className="space-y-6">
            {result && resultCreatedAt ? (
              <PredictionResult
                symptoms={result.sintomas}
                diagnosis={result.diagnostico_previsto}
                createdAt={resultCreatedAt}
                onExport={handleExport}
                onReset={() => {
                  setResult(null);
                  setResultCreatedAt(null);
                  setRequestError(null);
                }}
              />
            ) : (
              <Card className="space-y-5 p-6">
                <div className="inline-flex w-fit rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 dark:bg-brand-950/30 dark:text-brand-200">
                  Aguardando análise
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-950 dark:text-white">Seu resultado aparecerá aqui</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                    Assim que você enviar os sintomas, a interface exibirá o diagnóstico previsto de forma amigável, com histórico local e opção de exportação em texto.
                  </p>
                </div>
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 p-5 dark:border-slate-700 dark:bg-slate-900/40">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Exemplo de interpretação</p>
                  <p className="mt-3 text-lg font-bold text-slate-950 dark:text-white">{formatDiagnosisLabel('doenca_lyme')}</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Formato exibido ao usuário final, sem underscores e com nome legível.</p>
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
