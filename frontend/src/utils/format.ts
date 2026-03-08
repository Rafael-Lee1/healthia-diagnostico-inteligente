const formatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

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
  return value
    .replace(/^doenca_/i, 'Doença ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatDateTime(value: string): string {
  return formatter.format(new Date(value));
}

export function buildExportText(params: { symptoms: string[]; diagnosis: string[]; createdAt: string }): string {
  const diagnosisText = params.diagnosis.map(formatDiagnosisLabel).join(', ');

  return [
    'HealthIA - Resultado de apoio clínico',
    `Data/Hora: ${formatDateTime(params.createdAt)}`,
    `Sintomas informados: ${params.symptoms.join(', ')}`,
    `Diagnóstico previsto: ${diagnosisText}`,
    'Aviso: Esta ferramenta é de apoio e não substitui avaliação médica profissional.',
  ].join('\n');
}
