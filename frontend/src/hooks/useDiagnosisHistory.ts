import { useMemo, useState } from 'react';
import type { DiagnosisHistoryItem } from '@/types/history';

const STORAGE_KEY = 'healthia-history';
const MAX_ITEMS = 10;

function readHistory(): DiagnosisHistoryItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as DiagnosisHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useDiagnosisHistory() {
  const [history, setHistory] = useState<DiagnosisHistoryItem[]>(readHistory);

  const persist = (next: DiagnosisHistoryItem[]) => {
    setHistory(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return useMemo(
    () => ({
      history,
      addEntry: (entry: Omit<DiagnosisHistoryItem, 'id'>) => {
        const nextEntry: DiagnosisHistoryItem = {
          ...entry,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        };
        persist([nextEntry, ...history].slice(0, MAX_ITEMS));
      },
      clearHistory: () => persist([]),
    }),
    [history],
  );
}
