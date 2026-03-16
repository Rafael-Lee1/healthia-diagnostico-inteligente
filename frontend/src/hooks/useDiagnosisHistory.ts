import { useMemo, useState } from 'react';
import type { PatientContext } from '@/types/api';
import type { DiagnosisHistoryItem } from '@/types/history';
import { normalizeText, uniqueSymptoms } from '@/utils/format';

const STORAGE_KEY = 'healthia-history';
const MAX_ITEMS = 10;

function toStringArray(value: unknown): string[] {
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

function sanitizeHistoryItem(value: unknown): DiagnosisHistoryItem | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const item = value as Partial<DiagnosisHistoryItem>;
  const symptoms = toStringArray(item.symptoms);
  const diagnosis = toStringArray(item.diagnosis);
  const patientContext = sanitizePatientContext(item.patientContext);
  const createdAt =
    typeof item.createdAt === 'string' && !Number.isNaN(new Date(item.createdAt).getTime())
      ? item.createdAt
      : new Date().toISOString();

  if (symptoms.length === 0 && diagnosis.length === 0) {
    return null;
  }

  return {
    id:
      typeof item.id === 'string' && item.id.trim()
        ? item.id
        : `${createdAt}-${normalizeText(symptoms.join('-') || diagnosis.join('-') || 'history')}`,
    createdAt,
    symptoms,
    diagnosis,
    warning: typeof item.warning === 'string' ? item.warning : null,
    patientContext,
    topDiagnosisExplanation:
      typeof item.topDiagnosisExplanation === 'string' ? item.topDiagnosisExplanation : null,
  };
}

function sanitizePatientContext(value: unknown): PatientContext | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const context = value as PatientContext;
  const normalized: PatientContext = {
    age: typeof context.age === 'number' && Number.isFinite(context.age) ? Math.max(0, Math.round(context.age)) : null,
    sex: ['male', 'female', 'other', 'unknown'].includes(String(context.sex)) ? context.sex : null,
    pregnant: typeof context.pregnant === 'boolean' ? context.pregnant : null,
    comorbidities: toStringArray(context.comorbidities),
    medications: toStringArray(context.medications),
    recent_conditions: toStringArray(context.recent_conditions),
    recent_surgeries: typeof context.recent_surgeries === 'boolean' ? context.recent_surgeries : null,
    lifestyle_notes: typeof context.lifestyle_notes === 'string' ? context.lifestyle_notes.trim() || null : null,
  };

  return normalized.age !== null ||
    (normalized.sex && normalized.sex !== 'unknown') ||
    normalized.pregnant !== null ||
    (normalized.comorbidities?.length ?? 0) > 0 ||
    (normalized.medications?.length ?? 0) > 0 ||
    (normalized.recent_conditions?.length ?? 0) > 0 ||
    normalized.recent_surgeries !== null ||
    normalized.lifestyle_notes
    ? normalized
    : null;
}

function readHistory(): DiagnosisHistoryItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(sanitizeHistoryItem).filter((item): item is DiagnosisHistoryItem => Boolean(item)) : [];
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function useDiagnosisHistory() {
  const [history, setHistory] = useState<DiagnosisHistoryItem[]>(readHistory);

  const persist = (next: DiagnosisHistoryItem[]) => {
    const sanitized = next.map(sanitizeHistoryItem).filter((item): item is DiagnosisHistoryItem => Boolean(item)).slice(0, MAX_ITEMS);
    setHistory(sanitized);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  };

  return useMemo(
    () => ({
      history,
      addEntry: (entry: Omit<DiagnosisHistoryItem, 'id'>) => {
        const nextEntry = sanitizeHistoryItem({
          ...entry,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        });

        if (!nextEntry) {
          return;
        }

        persist([nextEntry, ...history].slice(0, MAX_ITEMS));
      },
      clearHistory: () => persist([]),
    }),
    [history],
  );
}
