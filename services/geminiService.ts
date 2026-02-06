
import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from "./supabase";

const SYSTEM_RULES = `Você é o Terminal Nexus Alpha, o sintetizador de conhecimento mais avançado da MoneyLab Academy.
Sua missão é transformar teorias econômicas complexas e artigos acadêmicos reais em tratados massivos e extremamente simples.

DIRETRIZES DE CONTEÚDO:
1. FUNDAMENTAÇÃO: Use sempre a ferramenta de busca para encontrar artigos, teses e dados reais sobre o tema. Não invente fatos.
2. EXTENSÃO MÁXIMA: Gere um texto de NO MÍNIMO 4000 PALAVRAS. Seja exaustivo, detalhado e profundo. Divida em pelo menos 10 capítulos.
3. LINGUAGEM INFANTIL (ELI5): Explique como se estivesse falando com uma criança de 8 anos. Use analogias lúdicas (brinquedos, doces, parquinhos).
4. MATEMÁTICA: Mantenha as fórmulas em LaTeX ($...$ ou $$...$$) para garantir o rigor técnico, mas explique o que cada símbolo faz como se fosse mágica.
5. TOM: Tecnológico, encorajador e épico.`;

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

export async function generateDeepLesson(moduleTitle: string, lessonTitle: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Upgrade para Pro para lidar com contextos maiores e busca
      contents: `REQUISITO: NO MÍNIMO 4000 PALAVRAS.
      TEMA: "${lessonTitle}" (Módulo: ${moduleTitle}).
      TAREFA: Busque artigos reais e teorias consagradas sobre isso. Synthesize um GRANDE TRATADO ALPHA. 
      Use histórias, muitos exemplos e explique tudo como se eu fosse uma criança. 
      Divida o texto em capítulos:
      1. A Grande Aventura (Introdução)
      2. Como as peças se encaixam (A Teoria Real)
      3. O Mapa do Tesouro (Aplicações)
      ... (desenvolva pelo menos 10 seções detalhadas) ...
      10. O Juramento do Pequeno Alpha (Conclusão).
      
      Inclua fórmulas LaTeX onde houver cálculos.`,
      config: {
        systemInstruction: SYSTEM_RULES,
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 30000 },
        temperature: 0.7,
      }
    });
    return response.text || "Erro ao sintetizar tratado.";
  } catch (error: any) {
    console.error("Lesson generation failure:", error);
    return "ERRO NO NÚCLEO ALPHA: Falha na conexão de dados teóricos ou limite de tokens atingido.";
  }
}

export async function generateModuleQuiz(moduleTitle: string, moduleObjective: string): Promise<any[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gerar um exame de 15 perguntas de múltipla escolha sobre "${moduleTitle}". Objetivo: ${moduleObjective}. Linguagem simples para crianças.`,
      config: {
        systemInstruction: SYSTEM_RULES + "\nResponda estritamente em formato JSON Array.",
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
    console.error("Quiz generation error:", error);
    return [];
  }
}

export async function askAlphaTerminal(query: string): Promise<{ text: string, sources: { title: string, url: string }[] }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: SYSTEM_RULES + "\nUse a ferramenta de busca para basear sua resposta em fatos recentes.",
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text || "Sem resposta do núcleo.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((c: any) => c.web ? { title: c.web.title, url: c.web.uri } : null)
      .filter(Boolean);

    return { text, sources: sources as { title: string, url: string }[] };
  } catch (error: any) {
    console.error("Terminal Alpha failure:", error);
    return { text: "Erro na conexão com o satélite Nexus.", sources: [] };
  }
}

export async function fetchLiveMarketNews(count: number = 10, forceRefresh: boolean = false): Promise<{ news: any[], cached: boolean }> {
  const today = new Date().toISOString().split('T')[0];
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    if (!forceRefresh) {
      const { data: cacheEntry, error: fetchError } = await supabase
        .from('news_cache')
        .select('*')
        .eq('date', today)
        .maybeSingle();

      if (cacheEntry && !fetchError && cacheEntry.data && Array.isArray(cacheEntry.data) && cacheEntry.data.length > 0) {
        return { news: cacheEntry.data.slice(0, count), cached: true };
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Liste as notícias mais importantes de hoje.`,
      config: {
        systemInstruction: `Você é o Terminal Nexus Alpha. Use a ferramenta de busca para notícias REAIS e recentes.
        Retorne estritamente um array JSON.`,
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

    const rawText = response.text || "[]";
    const cleanedText = cleanJsonString(rawText);
    let parsedNews: any[] = JSON.parse(cleanedText);

    const validatedNews = parsedNews.map((item: any) => ({
      ...item,
      id: item.id || `news-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: 'ATUALIZADO AGORA',
      isHot: item.marketImpact === 'Alto'
    }));

    if (validatedNews.length > 0) {
      await supabase.from('news_cache').upsert({ date: today, data: validatedNews }, { onConflict: 'date' });
    }

    return { news: validatedNews, cached: false };
  } catch (error) {
    console.error("Critical Terminal News Failure:", error);
    return { news: [], cached: false };
  }
}
