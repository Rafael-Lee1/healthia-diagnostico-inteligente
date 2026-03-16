import type { PatientContext, PatientSex } from '@/types/api';

const formatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function toSafeDate(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function uniqueSymptoms(symptoms: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  symptoms.forEach((symptom) => {
    const normalized = normalizeText(symptom);
    if (!normalized || seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    result.push(symptom.trim());
  });

  return result;
}

export function formatDiagnosisLabel(value: string): string {
  if (!value) {
    return 'Hipótese não informada';
  }

  return value
    .replace(/^doenca_/i, 'Doença ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatDateTime(value: string): string {
  const date = toSafeDate(value);
  return date ? formatter.format(date) : 'Data indisponível';
}

export function formatConfidence(value: number): string {
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
  return `${Math.round(safeValue * 100)}%`;
}

export function parseCommaSeparatedList(value: string): string[] {
  return uniqueSymptoms(
    value
      .split(/[\n,;]+/)
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

export function formatPatientSex(value?: PatientSex | null): string {
  switch (value) {
    case 'male':
      return 'Masculino';
    case 'female':
      return 'Feminino';
    case 'other':
      return 'Outro';
    default:
      return 'Não informado';
  }
}

export function hasPatientContext(context?: PatientContext | null): boolean {
  if (!context) {
    return false;
  }

  return Boolean(
    context.age !== null && context.age !== undefined ||
    (context.sex && context.sex !== 'unknown') ||
    context.pregnant !== null && context.pregnant !== undefined ||
    (context.comorbidities?.length ?? 0) > 0 ||
    (context.medications?.length ?? 0) > 0 ||
    (context.recent_conditions?.length ?? 0) > 0 ||
    context.recent_surgeries !== null && context.recent_surgeries !== undefined ||
    context.lifestyle_notes,
  );
}

export function summarizePatientContext(context?: PatientContext | null): string[] {
  if (!hasPatientContext(context)) {
    return [];
  }

  const summary: string[] = [];
  if (context?.age !== null && context?.age !== undefined) {
    summary.push(`${context.age} anos`);
  }
  if (context?.sex && context.sex !== 'unknown') {
    summary.push(formatPatientSex(context.sex));
  }
  if (context?.pregnant === true) {
    summary.push('Gestante');
  }
  if (context?.pregnant === false) {
    summary.push('Não gestante');
  }
  if ((context?.comorbidities?.length ?? 0) > 0) {
    summary.push(`Comorbidades: ${context?.comorbidities?.join(', ')}`);
  }
  if ((context?.medications?.length ?? 0) > 0) {
    summary.push(`Medicações: ${context?.medications?.join(', ')}`);
  }
  if ((context?.recent_conditions?.length ?? 0) > 0) {
    summary.push(`Condições recentes: ${context?.recent_conditions?.join(', ')}`);
  }
  if (context?.recent_surgeries === true) {
    summary.push('Cirurgia ou tratamento recente');
  }
  if (context?.lifestyle_notes) {
    summary.push(`Estilo de vida: ${context.lifestyle_notes}`);
  }
  return summary;
}

export function buildExportText(params: {
  symptoms: string[];
  diagnosis: string[];
  createdAt: string;
  warning?: string | null;
  patientContext?: PatientContext | null;
  topDiagnosisExplanation?: string | null;
}): string {
  const diagnosisText = (params.diagnosis ?? []).map(formatDiagnosisLabel).join(', ') || 'Sem hipótese principal';
  const symptomsText = (params.symptoms ?? []).join(', ') || 'Nenhum sintoma informado';
  const contextText = summarizePatientContext(params.patientContext).join(' | ');

  return [
    'HealthIA - Resultado de apoio clínico',
    `Data/Hora: ${formatDateTime(params.createdAt)}`,
    `Sintomas informados: ${symptomsText}`,
    contextText ? `Contexto do paciente: ${contextText}` : null,
    `Diagnóstico previsto: ${diagnosisText}`,
    params.topDiagnosisExplanation ? `Explicação principal: ${params.topDiagnosisExplanation}` : null,
    params.warning ? `Alerta: ${params.warning}` : null,
    'Aviso: Esta ferramenta é de apoio e não substitui avaliação médica profissional.',
  ]
    .filter(Boolean)
    .join('\n');
}
