import { useMemo, useState } from 'react';
import { MAX_SYMPTOMS, MIN_SYMPTOMS } from '@/constants/symptoms';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';
import { normalizeText } from '@/utils/format';

interface SymptomInputProps {
  symptoms: string[];
  suggestions: string[];
  onChange: (next: string[]) => void;
  error?: string | null;
}

export function SymptomInput({ symptoms, suggestions, onChange, error }: SymptomInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const normalizedSymptoms = useMemo(() => new Set(symptoms.map((item) => normalizeText(item))), [symptoms]);

  const filteredSuggestions = useMemo(() => {
    const query = normalizeText(inputValue);
    return suggestions
      .filter((item) => !normalizedSymptoms.has(normalizeText(item)))
      .filter((item) => (query ? normalizeText(item).includes(query) : true))
      .slice(0, query ? 6 : 10);
  }, [inputValue, normalizedSymptoms, suggestions]);

  const commitSymptoms = (raw: string) => {
    const tokens = raw
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (!tokens.length) {
      return;
    }

    const next = [...symptoms];
    let duplicates = 0;
    let ignoredByLimit = 0;

    tokens.forEach((token) => {
      const normalized = normalizeText(token);
      if (!normalized) {
        return;
      }

      if (normalizedSymptoms.has(normalized) || next.some((item) => normalizeText(item) === normalized)) {
        duplicates += 1;
        return;
      }

      if (next.length >= MAX_SYMPTOMS) {
        ignoredByLimit += 1;
        return;
      }

      next.push(token);
    });

    if (next.length !== symptoms.length) {
      onChange(next);
    }

    if (duplicates > 0 || ignoredByLimit > 0) {
      const parts = [];
      if (duplicates > 0) parts.push(`${duplicates} sintoma(s) duplicado(s) ignorado(s)`);
      if (ignoredByLimit > 0) parts.push(`limite máximo de ${MAX_SYMPTOMS} sintomas atingido`);
      setFeedback(parts.join(' • '));
    } else {
      setFeedback(null);
    }

    setInputValue('');
  };

  const removeSymptom = (symptom: string) => {
    onChange(symptoms.filter((item) => item !== symptom));
    setFeedback(null);
  };

  return (
    <Card className="space-y-5 border-white/70 bg-white/88 p-5 shadow-card dark:border-white/10 dark:bg-slate-900/82 md:p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <label htmlFor="symptom-input" className="text-lg font-bold text-ink-900 dark:text-white">
            Sintomas informados
          </label>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Digite um sintoma por vez e pressione <strong>Enter</strong> ou <strong>,</strong>. Você também pode colar uma lista separada por vírgulas.
          </p>
        </div>
        <div className="rounded-full border border-slate-200/80 bg-slate-50/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
          {symptoms.length}/{MAX_SYMPTOMS} sintomas • mínimo de {MIN_SYMPTOMS}
        </div>
      </div>

      <div className={cn('rounded-[1.65rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))] p-4 shadow-inner transition dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.75),rgba(2,6,23,0.65))]', error ? 'border-rose-400 ring-4 ring-rose-100 dark:ring-rose-950/30' : 'border-slate-200/80 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100 dark:border-white/10 dark:focus-within:ring-brand-950/40')}>
        <div className="mb-3 flex min-h-8 flex-wrap gap-2">
          {symptoms.map((symptom) => (
            <span
              key={symptom}
              className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 ring-1 ring-brand-100 transition hover:-translate-y-0.5 dark:bg-brand-950/40 dark:text-brand-200 dark:ring-brand-900/40"
            >
              {symptom}
              <button
                type="button"
                onClick={() => removeSymptom(symptom)}
                className="rounded-full p-1 text-brand-700 transition hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 dark:text-brand-200 dark:hover:bg-brand-900/40"
                aria-label={`Remover sintoma ${symptom}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <input
          id="symptom-input"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onPaste={(event) => {
            const pasted = event.clipboardData.getData('text');
            if (/[\n,;]/.test(pasted)) {
              event.preventDefault();
              commitSymptoms(pasted);
            }
          }}
          onKeyDown={(event) => {
            if ((event.key === 'Enter' || event.key === ',' || event.key === 'Tab') && inputValue.trim()) {
              event.preventDefault();
              commitSymptoms(inputValue);
            }
          }}
          placeholder="Ex.: febre, cansaço, dor no corpo"
          className="w-full border-none bg-transparent px-2 py-3 text-[15px] text-ink-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
          aria-describedby="symptom-help"
          aria-invalid={Boolean(error)}
        />
        <div className="mt-2 flex items-center justify-between gap-3 border-t border-slate-200/70 px-2 pt-3 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
          <span>Entrada livre em linguagem natural</span>
          <span>Enter, vírgula ou colagem em massa</span>
        </div>
      </div>

      <div id="symptom-help" className="space-y-3">
        {error ? <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{error}</p> : null}
        {feedback ? <p className="text-sm text-amber-700 dark:text-amber-300">{feedback}</p> : null}

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Sugestões rápidas</p>
          <div className="flex flex-wrap gap-2">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => commitSymptoms(suggestion)}
                className="rounded-full border border-slate-200/80 bg-slate-50/90 px-3 py-2 text-sm text-slate-700 transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-brand-700 dark:hover:bg-brand-950/30 dark:hover:text-brand-100"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
