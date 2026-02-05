
import React, { useState, useEffect, useCallback } from 'react';
import { PlanType } from '../types.ts';
import { fetchLiveMarketNews } from '../services/geminiService.ts';
import { Globe, TrendingUp, AlertCircle, ExternalLink } from 'lucide-react';

interface NewsProps {
  userPlan: PlanType;
  onActivity: () => void;
  onNavigate?: (page: any) => void;
}

export const News: React.FC<NewsProps> = ({ userPlan, onActivity }) => {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'BR' | 'INT'>('ALL');
  const [syncStatus, setSyncStatus] = useState('Iniciando protocolos...');

  const newsLimit = userPlan === PlanType.ELITE ? 100 : (userPlan === PlanType.PRO ? 50 : 10);

  const performSync = useCallback(async () => {
    setLoading(true);
    setSyncStatus('Acessando Google Search Grounding...');
    
    try {
      const result = await fetchLiveMarketNews(newsLimit, true);
      if (result.news && result.news.length > 0) {
        setNews(result.news);
      }
    } catch (error) {
      console.error("Erro na sincronização de notícias:", error);
    } finally {
      setLoading(false);
    }
  }, [newsLimit]);

  useEffect(() => {
    performSync();
  }, [performSync]);

  // Efeito para mensagens de loading dinâmicas
  useEffect(() => {
    if (!loading) return;
    const messages = [
      'Varrendo bolsas globais...',
      'Filtrando ruído de mercado...',
      'Verificando fontes certificadas...',
      'Sincronizando Terminal Nexus Alpha...',
      'Mapeando impacto econômico...'
    ];
    let i = 0;
    const interval = setInterval(() => {
      setSyncStatus(messages[i % messages.length]);
      i++;
    }, 2500);
    return () => clearInterval(interval);
  }, [loading]);

  const filteredNews = news
    .filter(item => filter === 'ALL' || item.region === filter)
    .slice(0, newsLimit);

  const getImpactColor = (impact: string) => {
    switch (impact?.toLowerCase()) {
      case 'alto': return 'text-red-500 border-red-500/20 bg-red-500/5';
      case 'médio': return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5';
      default: return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5';
    }
  };

  return (
    <div className="min-h-screen pb-32 animate-in fade-in duration-1000">
      {/* Header Estilizado */}
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 dark:border-white/5 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
              <Globe size={24} />
            </div>
            <div>
              <h2 className="text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none font-heading">
                TERMINAL <span className="text-gradient">REAL TIME</span>
              </h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">
                Sincronização Ativa // Redes de Inteligência Global
              </p>
            </div>
          </div>
        </div>

        <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-[20px] border border-slate-200 dark:border-white/5 backdrop-blur-md">
          {[
            { id: 'ALL', label: 'GLOBAL', icon: '🌍' },
            { id: 'BR', label: 'BRASIL', icon: '🇧🇷' },
            { id: 'INT', label: 'MUNDO', icon: '✈️' }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                filter === btn.id 
                ? 'bg-emerald-500 text-slate-950 shadow-lg' 
                : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{btn.icon}</span>
              {btn.label}
            </button>
          ))}
        </div>
      </header>

      {/* Estado de Carregamento */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center space-y-10">
          <div className="relative">
            <div className="w-20 h-20 border-2 border-emerald-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-t-emerald-500 rounded-full animate-spin"></div>
            <div className="absolute inset-4 bg-emerald-500/5 rounded-full animate-pulse"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-emerald-500 font-black text-xs uppercase tracking-[0.6em] animate-pulse">{syncStatus}</p>
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Acessando API de Grounding do Google Search</p>
          </div>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 opacity-40">
          <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center">
            <AlertCircle size={40} className="text-slate-400" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 max-w-xs">
            Aguardando sinal das bolsas. Nenhuma notícia verificada no radar no momento.
          </p>
        </div>
      ) : (
        /* Grid de Notícias */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredNews.map((item, idx) => (
            <div 
              key={item.id || idx}
              onClick={() => {
                onActivity();
                if (item.url) window.open(item.url, '_blank');
              }}
              className="group relative glass rounded-[40px] p-10 border border-slate-200 dark:border-white/5 hover:border-emerald-500/40 transition-all duration-500 cursor-pointer flex flex-col h-full overflow-hidden"
            >
              {/* Overlay de Hover Decorativo */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              {/* Badges de Topo */}
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-slate-900 text-white dark:bg-emerald-500/10 dark:text-emerald-500 text-[8px] font-black uppercase tracking-widest rounded-lg border border-white/10 dark:border-emerald-500/20">
                    {item.source || 'FONTE ALPHA'}
                  </span>
                  <div className={`px-3 py-1 border rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 ${getImpactColor(item.marketImpact)}`}>
                    <TrendingUp size={10} />
                    IMPACTO {item.marketImpact || 'BAIXO'}
                  </div>
                </div>
                {item.isHot && (
                  <span className="flex items-center gap-2 text-[8px] font-black text-red-500 animate-pulse uppercase tracking-[0.2em]">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    URGENTE
                  </span>
                )}
              </div>

              {/* Título e Sumário */}
              <div className="space-y-4 mb-8 flex-1 relative z-10">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tighter group-hover:text-emerald-500 transition-colors line-clamp-2 font-heading">
                  {item.title}
                </h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {item.summary}
                </p>
              </div>

              {/* Rodapé do Card */}
              <div className="mt-auto pt-8 border-t border-slate-100 dark:border-white/5 flex justify-between items-center relative z-10">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sincronizado via</span>
                  <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">Nexus Grounding Engine</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 group-hover:translate-x-1 transition-transform">
                  <span className="text-[10px] font-black uppercase tracking-widest">Acessar</span>
                  <ExternalLink size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <footer className="mt-20 text-center space-y-2 opacity-30">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">
          Dados em tempo real fornecidos via Google Search Tool & Gemini 3 Pro
        </p>
      </footer>
    </div>
  );
};
