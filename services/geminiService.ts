
import { GoogleGenAI, Type } from "@google/genai";
import { PropertyAnalysis } from "../types";

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    precio_estimado: { type: Type.NUMBER, description: "Precio estimado de mercado de la propiedad." },
    roi_anual: { type: Type.NUMBER, description: "Retorno de inversión anualizado como porcentaje (ej. 5.5)." },
    puntos_criticos: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Lista de alertas rojas o puntos críticos encontrados en el enlace o contrato."
    },
    recomendacion_final: { type: Type.STRING, description: "Una recomendación experta resumida." },
    risk_score: { type: Type.NUMBER, description: "Valor de riesgo de 0 (seguro) a 100 (alto riesgo)." },
    market_context: { type: Type.STRING, description: "Breve panorama del mercado local actual para este tipo de propiedad." },
    financial_breakdown: {
      type: Type.OBJECT,
      properties: {
        rent_potential: { type: Type.NUMBER, description: "Potencial de alquiler mensual estimado." },
        taxes: { type: Type.NUMBER, description: "Impuestos mensuales estimados." },
        maintenance: { type: Type.NUMBER, description: "Costos de mantenimiento mensuales estimados." }
      },
      required: ["rent_potential", "taxes", "maintenance"]
    }
  },
  required: ["precio_estimado", "roi_anual", "puntos_criticos", "recomendacion_final", "risk_score", "market_context", "financial_breakdown"],
};

export interface FileData {
  base64: string;
  mimeType: string;
}

export const analyzeProperty = async (
  input: string, 
  isUrl: boolean, 
  fileData?: FileData
): Promise<PropertyAnalysis> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY no configurada.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  let prompt = "";
  let parts: any[] = [];

  if (fileData) {
    prompt = "Analiza este documento o imagen adjunta. Si es un contrato, busca riesgos legales y financieros. Si es una propiedad, estima su rentabilidad basándote en la información visible. Responde en español.";
    parts = [
      { text: prompt },
      { inlineData: { data: fileData.base64, mimeType: fileData.mimeType } }
    ];
  } else {
    prompt = isUrl 
      ? `Analiza este enlace de propiedad: ${input}. Evalúa inversión, ROI proyectado y riesgos potenciales en español.`
      : `Analiza este texto de contrato: ${input}. Identifica cláusulas peligrosas, rentabilidad y da una opinión profesional en español.`;
    parts = [{ text: prompt }];
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA,
      systemInstruction: "Eres un Analista Inmobiliario Senior y Arquitecto de Soluciones experto en Real Estate Tech. Tu misión es extraer datos financieros y riesgos de enlaces, textos o documentos. Sé preciso, profesional y responde siempre en español con un tono ejecutivo."
    },
  });

  const text = response.text;
  if (!text) throw new Error("La IA no devolvió contenido.");

  return JSON.parse(text.trim()) as PropertyAnalysis;
};
