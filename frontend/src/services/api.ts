import type {
  NormalizedPrediction,
  PatientContext,
  PatientSex,
  PredictResponse,
  PredictionEntry,
  WelcomeResponse,
} from '@/types/api';
import { normalizeText, uniqueSymptoms } from '@/utils/format';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');

class ApiError extends Error {
  status: number;
  details: string | null;

  constructor(message: string, status: number, details: string | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function toSafeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return uniqueSymptoms(
    value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

function tokenizeSymptoms(value: string): string[] {
  return uniqueSymptoms(
    value
      .split(/[,\n;]+/)
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

function normalizePatientContext(value: unknown): PatientContext | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const context = value as PatientContext;
  const sex = ['male', 'female', 'other', 'unknown'].includes(String(context.sex))
    ? (context.sex as PatientSex)
    : null;
  const normalized: PatientContext = {
    age: typeof context.age === 'number' && Number.isFinite(context.age) ? Math.max(0, Math.round(context.age)) : null,
    sex,
    pregnant: typeof context.pregnant === 'boolean' ? context.pregnant : null,
    comorbidities: toSafeStringArray(context.comorbidities),
    medications: toSafeStringArray(context.medications),
    recent_conditions: toSafeStringArray(context.recent_conditions),
    recent_surgeries: typeof context.recent_surgeries === 'boolean' ? context.recent_surgeries : null,
    lifestyle_notes: typeof context.lifestyle_notes === 'string' ? context.lifestyle_notes.trim() || null : null,
  };

  return Object.values(normalized).some((value) => value !== null && value !== undefined && value !== '')
    && ((normalized.comorbidities?.length ?? 0) > 0
      || (normalized.medications?.length ?? 0) > 0
      || (normalized.recent_conditions?.length ?? 0) > 0
      || normalized.age !== null
      || (normalized.sex && normalized.sex !== 'unknown')
      || normalized.pregnant !== null
      || normalized.recent_surgeries !== null
      || normalized.lifestyle_notes)
    ? normalized
    : null;
}

function normalizePredictions(value: PredictResponse['top_predictions']) {
  const entries = Array.isArray(value) ? value : [];

  return entries
    .map((entry: PredictionEntry) => ({
      disease: typeof entry?.disease === 'string' ? entry.disease : '',
      confidence: typeof entry?.confidence === 'number' ? entry.confidence : 0,
      domain: typeof entry?.domain === 'string' ? entry.domain : null,
      severity: typeof entry?.severity === 'string' ? entry.severity : null,
      is_emergency: typeof entry?.is_emergency === 'boolean' ? entry.is_emergency : null,
    }))
    .filter((entry) => Boolean(entry.disease));
}

function normalizePredictionResponse(payload: PredictResponse): NormalizedPrediction {
  const predictions = normalizePredictions(payload?.top_predictions);
  const diagnosisFromPredictions = predictions.map((item) => item.disease);
  const inputText = typeof payload?.input_text === 'string' ? payload.input_text : '';
  const legacySymptoms = toSafeStringArray(payload?.sintomas);
  const symptoms = legacySymptoms.length > 0 ? legacySymptoms : tokenizeSymptoms(inputText);
  const diagnosis =
    diagnosisFromPredictions.length > 0 ? diagnosisFromPredictions : toSafeStringArray(payload?.diagnostico_previsto);

  return {
    inputText,
    normalizedText: typeof payload?.normalized_text === 'string' ? payload.normalized_text : normalizeText(inputText),
    symptoms,
    predictions,
    warning: typeof payload?.warning === 'string' ? payload.warning : null,
    disclaimer: typeof payload?.disclaimer === 'string' ? payload.disclaimer : null,
    diagnosis,
    hasPredictions: predictions.length > 0,
    patientContext: normalizePatientContext(payload?.patient_context),
    topDiagnosisExplanation:
      typeof payload?.top_diagnosis_explanation === 'string' ? payload.top_diagnosis_explanation : null,
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
    ...init,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? ((await response.json()) as T | { detail?: string }) : null;

  if (!response.ok) {
    const details =
      typeof payload === 'object' && payload && 'detail' in payload && typeof payload.detail === 'string'
        ? payload.detail
        : null;
    throw new ApiError(details ?? `Erro na API (${response.status})`, response.status, details);
  }

  return payload as T;
}

export const api = {
  baseUrl: API_BASE_URL,
  getWelcome: () => request<WelcomeResponse>('/'),
  predictSymptoms: async (symptoms: string[], patientContext?: PatientContext | null, topN = 5) => {
    const payload = await request<PredictResponse>('/predict/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sintomas: symptoms.join(', '),
        top_n: topN,
        patient_context: normalizePatientContext(patientContext) ?? undefined,
      }),
    });

    return normalizePredictionResponse(payload);
  },
  isApiError: (error: unknown): error is ApiError => error instanceof ApiError,
};
