export interface WelcomeResponse {
  message?: string;
  Message?: string;
  mode?: string;
}

export type PatientSex = 'male' | 'female' | 'other' | 'unknown';

export interface PatientContext {
  age?: number | null;
  sex?: PatientSex | null;
  pregnant?: boolean | null;
  comorbidities?: string[] | null;
  medications?: string[] | null;
  recent_conditions?: string[] | null;
  recent_surgeries?: boolean | null;
  lifestyle_notes?: string | null;
}

export interface PredictionEntry {
  disease?: string | null;
  confidence?: number | null;
  domain?: string | null;
  severity?: string | null;
  is_emergency?: boolean | null;
}

export interface PredictResponse {
  input_text?: string | null;
  normalized_text?: string | null;
  top_predictions?: PredictionEntry[] | null;
  warning?: string | null;
  disclaimer?: string | null;
  patient_context?: PatientContext | null;
  top_diagnosis_explanation?: string | null;
  sintomas?: string[] | null;
  diagnostico_previsto?: string[] | null;
}

export interface NormalizedPrediction {
  inputText: string;
  normalizedText: string;
  symptoms: string[];
  predictions: Array<
    Required<Pick<PredictionEntry, 'disease' | 'confidence'>> &
      Pick<PredictionEntry, 'domain' | 'severity' | 'is_emergency'>
  >;
  warning: string | null;
  disclaimer: string | null;
  diagnosis: string[];
  hasPredictions: boolean;
  patientContext: PatientContext | null;
  topDiagnosisExplanation: string | null;
}
