import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_RULES = `Você é o Terminal Nexus Alpha da MoneyLab Academy.
Sua missão é fornecer inteligência de mercado em tempo real.

DIRETRIZES PARA NOTÍCIAS:
1. PESQUISA REAL: Use 'googleSearch' para encontrar EXATAMENTE 100 notícias econômicas globais e do Brasil de hoje.
2. LINKS OBRIGATÓRIOS: Cada notícia DEVE ter um campo 'url' válido e real (ex: bloomberg.com, g1.globo.com).
3. JSON ESTRITO: Responda apenas o array JSON.
4. IMPACTO: Classifique como 'Alto', 'Médio' ou 'Baixo'.`;

export function getStoredApiKey(): string {
  const envKey = process.env.API_KEY;
  if (envKey && envKey !== "undefined" && envKey !== "") return envKey;
  
  const localKey = localStorage.getItem('moneylab_alpha_key');
  return localKey || "";
}

function cleanJsonString(str: string): string {
  if (!str) return "[]";
  let cleaned = str.replace(/```json/g, "").replace(/```/g, "").trim();
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    cleaned = cleaned.substring(firstBracket, lastBracket + 1);
  }
  return cleaned;
}

export async function testApiConnection(): Promise<boolean> {
  const key = getStoredApiKey();
  if (!key) return false;
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Olá, sistema online?',
      config: { maxOutputTokens: 10 }
    });
    return !!response.text;
  } catch (e) {
    return false;
  }
}

export async function generateDeepLesson(moduleTitle: string, lessonTitle: string): Promise<string> {
  const key = getStoredApiKey();
  const ai = new GoogleGenAI({ apiKey: key });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `GERE UM TRATADO DE NO MÍNIMO 4000 PALAVRAS sobre "${lessonTitle}" (Módulo ${moduleTitle}). Busque artigos reais. Linguagem infantil.`,
      config: {
        systemInstruction: SYSTEM_RULES,
        tools: [{ googleSearch: {} }],
        maxOutputTokens: 20000,
        thinkingConfig: { thinkingBudget: 5000 },
      }
    });
    return response.text || "Erro na geração.";
  } catch (error: any) {
    return `FALHA NA SÍNTESE: ${error.message}`;
  }
}

export async function generateModuleQuiz(moduleTitle: string, moduleObjective: string): Promise<any[]> {
  const key = getStoredApiKey();
  const ai = new GoogleGenAI({ apiKey: key });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere 15 questões sobre ${moduleTitle} em JSON com base no objetivo: ${moduleObjective}.`,
      config: {
        systemInstruction: SYSTEM_RULES,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["id", "question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });
    return JSON.parse(cleanJsonString(response.text || "[]"));
  } catch (error) {
    return [];
  }
}

export async function askAlphaTerminal(query: string): Promise<{ text: string, sources: { title: string, url: string }[] }> {
  const key = getStoredApiKey();
  const ai = new GoogleGenAI({ apiKey: key });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: query,
      config: {
        systemInstruction: SYSTEM_RULES,
        tools: [{ googleSearch: {} }],
      }
    });
    const text = response.text || "Sem resposta.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks.map((c: any) => c.web ? { title: c.web.title, url: c.web.uri } : null).filter(Boolean);
    return { text, sources: sources as any };
  } catch (error) {
    return { text: "Erro de rede.", sources: [] };
  }
}

export async function fetchLiveMarketNews(count: number = 100): Promise<{ news: any[], cached: boolean }> {
  const key = getStoredApiKey();
  const ai = new GoogleGenAI({ apiKey: key });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `REQUISITO: Liste EXATAMENTE ${count} notícias econômicas REAIS. Forneça URLs reais de grandes portais para todas. Retorne o JSON.`,
      config: {
        systemInstruction: SYSTEM_RULES,
        tools: [{ googleSearch: {} }],
        maxOutputTokens: 10000, // Aumentado para suportar o volume de notícias
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              source: { type: Type.STRING },
              url: { type: Type.STRING },
              summary: { type: Type.STRING },
              marketImpact: { type: Type.STRING },
              region: { type: Type.STRING }
            },
            required: ["id", "title", "source", "url", "summary", "marketImpact", "region"]
          }
        }
      }
    });
    const newsData = JSON.parse(cleanJsonString(response.text || "[]"));
    return { news: newsData, cached: false };
  } catch (error) {
    console.error("Erro ao buscar notícias:", error);
    return { news: [], cached: false };
  }
}