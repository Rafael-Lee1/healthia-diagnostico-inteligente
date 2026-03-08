export interface WelcomeResponse {
  Message: string;
}

export interface PredictResponse {
  sintomas: string[];
  diagnostico_previsto: string[];
}
