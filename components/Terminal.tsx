
import React, { useState, useRef, useEffect } from 'react';
import { askAlphaTerminal } from '../services/geminiService.ts';

export const TerminalAlpha: React.FC = () => {
  const [history, setHistory] = useState<{ query: string, response: string, sources: any[] }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const query = input;
    setInput('');
    setLoading(true);

    const result = await askAlphaTerminal(query);
    setHistory(prev => [...prev, { query, response: result.text, sources: result.sources }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[80vh] glass rounded-[40px] border border-emerald-500/20 overflow-hidden shadow-2xl bg-white dark:bg-[#020617]">
      {/* Header */}
      <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-6 border-b border-emerald-500/10 dark:border-emerald-500/20 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          <span className="ml-4 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 dark:text-emerald-500">IA Nexus Alpha v9.0 // Global Intelligence</span>
        </div>
        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Status: Connected to Google Cloud Engine</span>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto p-10 space-y-12 font-mono text-sm custom-scrollbar bg-slate-50/50 dark:bg-black/20">
        {history.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
            <div className="text-6xl">🛰️</div>
            <p className="max-w-md text-emerald-700 dark:text-emerald-500/80 font-bold uppercase tracking-widest leading-relaxed">
              Consulte dados econômicos globais, indicadores macroeconômicos, séries históricas e análises teóricas de empresas e mercados, com base em informações públicas.
            </p>
          </div>
        )}

        {history.map((item, i) => (
          <div key={i} className="space-y-6 animate-in fade-in slide-in-from-left-4">
            <div className="flex gap-4">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">root@moneylab:~$</span>
              <span className="text-slate-900 dark:text-white font-bold">{item.query}</span>
            </div>
            <div className="pl-6 border-l-2 border-emerald-500/20 space-y-6">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{item.response}</p>
              {item.sources.length > 0 && (
                <div className="pt-4 space-y-2">
                  <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Fontes Grounding:</p>
                  <div className="flex flex-wrap gap-2">
                    {item.sources.map((src, j) => (
                      <a 
                        key={j} 
                        href={src.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-3 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-[9px] text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
                      >
                        {src.title} ↗
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-4 text-emerald-600 dark:text-emerald-500 animate-pulse">
            <span className="font-bold">root@moneylab:~$</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Processando dados globais...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSearch} className="p-6 bg-slate-100/50 dark:bg-black/40 border-t border-slate-200 dark:border-emerald-500/20">
        <div className="flex gap-4 items-center">
          <span className="text-emerald-600 dark:text-emerald-500 font-bold text-xl">{'>'}</span>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Consulte o mercado global..."
            className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-emerald-100 font-mono placeholder:text-slate-400 dark:placeholder:text-emerald-900"
            autoFocus
          />
          <button type="submit" className="px-6 py-2 bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 font-black text-[10px] uppercase rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all">ENTER</button>
        </div>
      </form>
    </div>
  );
};
