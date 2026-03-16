import { useEffect, useState } from 'react';
import type { PatientContext, PatientSex } from '@/types/api';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';
import { formatPatientSex, parseCommaSeparatedList } from '@/utils/format';

interface PatientContextPanelProps {
  value: PatientContext;
  onChange: (next: PatientContext) => void;
}

const sexOptions: Array<{ value: PatientSex; label: string }> = [
  { value: 'unknown', label: 'Não informar' },
  { value: 'female', label: 'Feminino' },
  { value: 'male', label: 'Masculino' },
  { value: 'other', label: 'Outro' },
];

const pregnancyOptions = [
  { value: 'unknown', label: 'Não informar' },
  { value: 'false', label: 'Não' },
  { value: 'true', label: 'Sim' },
];

function listValue(values?: string[] | null): string {
  return Array.isArray(values) ? values.join(', ') : '';
}

function updateList(field: keyof PatientContext, raw: string, value: PatientContext, onChange: (next: PatientContext) => void) {
  onChange({
    ...value,
    [field]: parseCommaSeparatedList(raw),
  });
}

export function PatientContextPanel({ value, onChange }: PatientContextPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const summary = [
    value.age ? `${value.age} anos` : null,
    value.sex && value.sex !== 'unknown' ? formatPatientSex(value.sex) : null,
    value.pregnant === true ? 'Gestante' : null,
    value.recent_surgeries ? 'Cirurgia/tratamento recente' : null,
  ].filter(Boolean);

  useEffect(() => {
    if (summary.length > 0) {
      setIsOpen(true);
    }
  }, [summary.length]);

  return (
    <details className="group" open={isOpen} onToggle={(event) => setIsOpen((event.currentTarget as HTMLDetailsElement).open)}>
      <summary className="list-none">
        <Card className="cursor-pointer border-white/70 bg-white/84 p-5 shadow-panel dark:border-white/10 dark:bg-slate-900/78">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Patient information
              </p>
              <h2 className="mt-2 text-xl font-bold text-ink-900 dark:text-white">Informações do paciente</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Opcional. Esses dados podem melhorar a leitura do contexto clínico, mas a análise continua funcionando sem preenchimento adicional.
              </p>
              {summary.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {summary.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <span
              className={cn(
                'mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-500 transition group-open:rotate-180 dark:border-white/10 dark:bg-white/5 dark:text-slate-300',
              )}
              aria-hidden="true"
            >
              ↓
            </span>
          </div>
        </Card>
      </summary>

      <Card className="mt-3 space-y-5 border-white/70 bg-white/84 p-5 shadow-card dark:border-white/10 dark:bg-slate-900/78 md:p-6">
        <div className="rounded-[1.35rem] border border-brand-200/80 bg-brand-50/80 px-4 py-3 text-sm text-brand-800 dark:border-brand-900/40 dark:bg-brand-950/20 dark:text-brand-200">
          O contexto é usado apenas para qualificar a triagem educacional. Não substitui avaliação médica e não é obrigatório.
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Idade</span>
            <input
              type="number"
              min={0}
              max={120}
              value={value.age ?? ''}
              onChange={(event) =>
                onChange({
                  ...value,
                  age: event.target.value === '' ? null : Number(event.target.value),
                })
              }
              placeholder="Ex.: 34"
              className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white px-4 text-sm text-ink-900 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-brand-950/40"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sexo</span>
            <select
              value={value.sex ?? 'unknown'}
              onChange={(event) =>
                onChange({
                  ...value,
                  sex: event.target.value as PatientSex,
                })
              }
              className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white px-4 text-sm text-ink-900 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-brand-950/40"
            >
              {sexOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gestação</span>
            <select
              value={value.pregnant === null || value.pregnant === undefined ? 'unknown' : String(value.pregnant)}
              onChange={(event) =>
                onChange({
                  ...value,
                  pregnant:
                    event.target.value === 'unknown' ? null : event.target.value === 'true',
                })
              }
              className="h-12 w-full rounded-2xl border border-slate-200/80 bg-white px-4 text-sm text-ink-900 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-brand-950/40"
            >
              {pregnancyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-end">
            <span className="flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-4 text-sm text-ink-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
              Cirurgia ou tratamento recente
              <input
                type="checkbox"
                checked={Boolean(value.recent_surgeries)}
                onChange={(event) =>
                  onChange({
                    ...value,
                    recent_surgeries: event.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
              />
            </span>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Comorbidades</span>
            <textarea
              value={listValue(value.comorbidities)}
              onChange={(event) => updateList('comorbidities', event.target.value, value, onChange)}
              rows={3}
              placeholder="Ex.: diabetes, hipertensão"
              className="w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-brand-950/40"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Medicações em uso</span>
            <textarea
              value={listValue(value.medications)}
              onChange={(event) => updateList('medications', event.target.value, value, onChange)}
              rows={3}
              placeholder="Ex.: metformina, losartana"
              className="w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-brand-950/40"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Condições recentes</span>
            <textarea
              value={listValue(value.recent_conditions)}
              onChange={(event) => updateList('recent_conditions', event.target.value, value, onChange)}
              rows={3}
              placeholder="Ex.: virose recente, infecção respiratória recente"
              className="w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-brand-950/40"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Notas de estilo de vida</span>
            <textarea
              value={value.lifestyle_notes ?? ''}
              onChange={(event) =>
                onChange({
                  ...value,
                  lifestyle_notes: event.target.value,
                })
              }
              rows={3}
              placeholder="Ex.: tabagismo, atividade física intensa, viagem recente"
              className="w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-brand-950/40"
            />
          </label>
        </div>
      </Card>
    </details>
  );
}
