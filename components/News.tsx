import React, { useState, useEffect, useCallback } from 'react';
import { PlanType } from '../types';
import { fetchLiveMarketNews } from '../services/geminiService';
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
  const [syncStatus, setSyncStatus] = useState('Sincronizando Terminal...');

  // Se for Elite, pegamos 100. Se for Pro, 50. Se for Free, 10.
  const newsLimit = userPlan === PlanType.ELITE ? 100 : (userPlan === PlanType.PRO ? 50 : 10);

  const performSync = useCallback(async () => {
    setLoading(true);
    setSyncStatus('Consultando Google Search...');
    
    try {
      const result = await fetchLiveMarketNews(newsLimit);
      if (result.news && result.news.length > 0) {
        setNews(result.news);
      }
    } catch (error) {
      console.error("News Error:", error);
    } finally {
      setLoading(false);
    }
  }, [newsLimit]);

  useEffect(() => {
    performSync();
  }, [performSync]);

  const filteredNews = news
    .filter(item => filter === 'ALL' || item.region === filter)
    .slice(0, newsLimit);

  const handleNewsClick = (url: string) => {
    onActivity();
    if (url && url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      console.warn("URL de notícia inválida:", url);
    }
  };

  return (
    <div className="min-h-screen pb-32 animate-in fade-in duration-1000">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 dark:border-white/5 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg">
              <Globe size={24} />
            </div>
            <div>
              <h2 className="text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-none font-heading">
                TERMINAL <span className="text-gradient">NEWS</span>
              </h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Sincronização Ativa // Exibindo {newsLimit} Notícias</p>
            </div>
          </div>
        </div>

        <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-[20px] border border-slate-200 dark:border-white/5 backdrop-blur-md">
          {['ALL', 'BR', 'INT'].map((id) => (
            <button
              key={id}
              onClick={() => setFilter(id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${filter === id ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400'}`}
            >
              {id === 'ALL' ? '🌍 GLOBAL' : id === 'BR' ? '🇧🇷 BRASIL' : '✈️ MUNDO'}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center space-y-10">
          <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-emerald-500 font-black text-xs uppercase tracking-[0.6em] animate-pulse">{syncStatus}</p>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="py-32 text-center opacity-40">
          <AlertCircle size={48} className="mx-auto mb-4 text-slate-400" />
          <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma notícia encontrada no radar Alpha.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredNews.map((item, idx) => (
            <div 
              key={item.id || idx}
              onClick={() => handleNewsClick(item.url)}
              className="group glass rounded-[40px] p-10 border border-slate-200 dark:border-white/5 hover:border-emerald-500 transition-all duration-300 cursor-pointer flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-8">
                <span className="px-3 py-1 bg-slate-900 text-white dark:bg-emerald-500/10 dark:text-emerald-500 text-[8px] font-black uppercase tracking-widest rounded-lg border border-white/10">{item.source || 'ALPHA'}</span>
                <div className={`px-3 py-1 border rounded-lg text-[8px] font-black uppercase tracking-widest ${item.marketImpact === 'Alto' ? 'text-red-500 border-red-500/20' : 'text-emerald-500 border-emerald-500/20'}`}>IMPACTO {item.marketImpact || 'MÉDIO'}</div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter group-hover:text-emerald-500 transition-colors line-clamp-2">{item.title}</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mt-4">{item.summary}</p>
              <div className="mt-auto pt-8 border-t border-slate-100 dark:border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nexus Grounding Engine</span>
                <div className="flex items-center gap-2 text-emerald-500 group-hover:translate-x-1 transition-transform">
                   <span className="text-[10px] font-black uppercase">Ler Notícia</span>
                   <ExternalLink size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};