import type { PatientContext } from '@/types/api';

export interface DiagnosisHistoryItem {
  id: string;
  createdAt: string;
  symptoms: string[];
  diagnosis: string[];
  warning?: string | null;
  patientContext?: PatientContext | null;
  topDiagnosisExplanation?: string | null;
}
