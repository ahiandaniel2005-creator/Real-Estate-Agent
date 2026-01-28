
export interface PropertyAnalysis {
  precio_estimado: number;
  roi_anual: number;
  puntos_criticos: string[];
  recomendacion_final: string;
  risk_score: number; // 0-100
  market_context: string;
  financial_breakdown: {
    rent_potential: number;
    taxes: number;
    maintenance: number;
  };
}

export const AnalysisStatus = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR'
} as const;

export type AnalysisStatusType = typeof AnalysisStatus[keyof typeof AnalysisStatus];
