
import { GoogleGenAI, Type } from "@google/genai";
import { PropertyAnalysis } from "../types";

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    precio_estimado: { type: Type.NUMBER },
    roi_anual: { type: Type.NUMBER },
    puntos_criticos: { type: Type.ARRAY, items: { type: Type.STRING } },
    recomendacion_final: { type: Type.STRING },
    risk_score: { type: Type.NUMBER },
    market_context: { type: Type.STRING },
    financial_breakdown: {
      type: Type.OBJECT,
      properties: {
        rent_potential: { type: Type.NUMBER },
        taxes: { type: Type.NUMBER },
        maintenance: { type: Type.NUMBER }
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
  if (!apiKey) throw new Error("API_KEY no configurada.");

  const ai = new GoogleGenAI({ apiKey });
  
  let parts: any[] = [];
  const basePrompt = "Actúa como un experto en Real Estate. Analiza los datos proporcionados y devuelve un JSON estricto con el análisis financiero y de riesgos en español.";

  if (fileData) {
    parts = [
      { text: basePrompt },
      { inlineData: { data: fileData.base64, mimeType: fileData.mimeType } }
    ];
  } else {
    parts = [{ text: `${basePrompt} Entrada: ${input}` }];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Respuesta vacía de la IA.");
    
    // Limpieza de posibles marcas de markdown que rompen el JSON.parse
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson) as PropertyAnalysis;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
