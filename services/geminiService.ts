
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from "./supabase.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_RULES = `Você é um modelo de linguagem usado exclusivamente para geração de conteúdo educacional na MoneyLab Academy.

REGRAS ABSOLUTAS:
- Você é o Terminal Nexus Alpha, um sistema de inteligência econômica de elite.
- No Terminal News, sua única missão é fornecer notícias REAIS e links FUNCIONAIS.
- Você deve extrair as URLs DIRETAMENTE do Google Search Grounding.
- Se você não tiver certeza absoluta da URL de uma notícia, NÃO a inclua no JSON.`;

/**
 * Limpa a string de resposta da IA para garantir que seja um JSON válido
 */
function cleanJsonString(str: string): string {
  let cleaned = str.replace(/```json/g, "").replace(/```/g, "").trim();
  const startBracket = cleaned.indexOf('[');
  const endBracket = cleaned.lastIndexOf(']');
  if (startBracket !== -1 && endBracket !== -1) {
    cleaned = cleaned.substring(startBracket, endBracket + 1);
  }
  return cleaned;
}

export async function generateDeepLesson(moduleTitle: string, lessonTitle: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Escreva uma aula completa e profunda sobre "${lessonTitle}" (Módulo: ${moduleTitle}). Use LaTeX para fórmulas.`,
      config: {
        systemInstruction: SYSTEM_RULES,
        thinkingConfig: { thinkingBudget: 24576 },
        temperature: 0.7,
      }
    });
    return response.text || "Erro ao gerar análise profunda.";
  } catch (error: any) {
    return "ERRO NO NÚCLEO ALPHA: Falha na conexão de dados teóricos.";
  }
}

export async function generateModuleQuiz(moduleTitle: string, moduleObjective: string): Promise<any[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gerar um exame de 15 perguntas sobre "${moduleTitle}".`,
      config: {
        systemInstruction: SYSTEM_RULES + "\nResponda estritamente em formato JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });
    return JSON.parse(cleanJsonString(response.text));
  } catch (error) {
    return [];
  }
}

export async function askAlphaTerminal(query: string): Promise<{ text: string, sources: { title: string, url: string }[] }> {
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
    const sources = chunks
      .map((c: any) => c.web ? { title: c.web.title, url: c.web.uri } : null)
      .filter(Boolean);

    return { text, sources: sources as { title: string, url: string }[] };
  } catch (error: any) {
    return { text: "Erro na conexão.", sources: [] };
  }
}

export async function fetchLiveMarketNews(count: number = 10, forceRefresh: boolean = false): Promise<{ news: any[], cached: boolean }> {
  const today = new Date().toISOString().split('T')[0];

  try {
    if (!forceRefresh) {
      const { data: cacheEntry, error: fetchError } = await supabase
        .from('news_cache')
        .select('*')
        .eq('date', today)
        .maybeSingle();

      if (cacheEntry && !fetchError && cacheEntry.data && cacheEntry.data.length > 0) {
        return { news: cacheEntry.data, cached: true };
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `NOTÍCIAS DE AGORA (${new Date().toLocaleString('pt-BR')}): Realize uma busca profunda no Google Search pelas notícias econômicas, financeiras e de mercado mais importantes das últimas horas.
      Você DEVE retornar um JSON com pelo menos 20 notícias.
      CRITICAL: O campo "url" deve ser o link REAL e ATUAL da notícia. Se o link não for verificado no Google Search Grounding, descarte.`,
      config: {
        systemInstruction: `Você é o Terminal Nexus Alpha. Sua prioridade máxima é a veracidade das URLs.
        Retorne estritamente um array JSON com objetos contendo: id (uuid), title, source, url, category, summary, marketImpact, region.`,
        tools: [{ googleSearch: {} }],
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
              category: { type: Type.STRING },
              summary: { type: Type.STRING },
              marketImpact: { type: Type.STRING },
              region: { type: Type.STRING }
            },
            required: ["id", "title", "source", "url", "category", "summary", "region", "marketImpact"]
          }
        }
      }
    });

    const rawText = response.text;
    if (!rawText) throw new Error("IA sem resposta.");

    const parsedNews = JSON.parse(cleanJsonString(rawText))
      .filter((n: any) => n.url && n.url.startsWith('http'))
      .map((item: any) => ({
        ...item,
        timestamp: 'VERIFICADO EM TEMPO REAL',
        isHot: item.marketImpact === 'Alto'
      }));

    if (parsedNews.length > 0) {
      await supabase.from('news_cache').upsert({ 
        date: today, 
        data: parsedNews 
      }, { onConflict: 'date' });
    }

    return { news: parsedNews, cached: false };
  } catch (error) {
    console.error("News Fetch Error:", error);
    return { news: [], cached: false };
  }
}
