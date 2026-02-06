
import React, { useState, useEffect, useCallback } from 'react';
import { User, PlanType } from '../types';
import { supabase } from '../services/supabase';
import { MODULES } from '../constants';
import { Play } from 'lucide-react';

interface DashboardProps {
  user: User;
  onNavigate: (page: any) => void;
  onGainXP: (amount: number) => void;
  onClaimDaily: () => void;
  onSelectModule?: (module: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate, onGainXP, onClaimDaily, onSelectModule }) => {
  const xpPercentage = (user.xp / user.xpNextLevel) * 100;
  const [ranking, setRanking] = useState<any[] | null>(null);
  const [userRank, setUserRank] = useState<number | string>('??');
  const [isSyncing, setIsSyncing] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  const lastClaim = user.stats.lastClaimedAt ? new Date(user.stats.lastClaimedAt) : null;
  const canClaim = !lastClaim || (new Date().getTime() - lastClaim.getTime()) >= 24 * 60 * 60 * 1000;

  useEffect(() => {
    const timer = setInterval(() => {
      if (lastClaim) {
        const nextClaim = lastClaim.getTime() + 24 * 60 * 60 * 1000;
        const now = new Date().getTime();
        const diff = nextClaim - now;
        
        if (diff <= 0) {
          setTimeLeft('');
          return;
        }

        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lastClaim]);

  const fetchRanking = useCallback(async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, xp, photo_url, plan')
        .order('xp', { ascending: false })
        .limit(50);
      
      if (error) throw error;

      if (data && data.length > 0) {
        setRanking(data);
        const pos = data.findIndex(r => r.id === user.id) + 1;
        setUserRank(pos > 0 ? pos : '50+');
      } else {
        setRanking([{ id: user.id, name: user.name, xp: user.xp, photo_url: user.photoUrl, plan: user.plan }]);
        setUserRank(1);
      }
    } catch (e) {
      console.warn("Ranking sync error...");
    } finally {
      setIsSyncing(false);
    }
  }, [user.id, user.name, user.xp, user.photoUrl, user.plan]);

  useEffect(() => {
    fetchRanking();
  }, [user.xp, fetchRanking]);

  const categoryStats = [
    { name: 'Teoria Base', xp: Math.floor(user.xp * 0.25), color: 'bg-emerald-500' },
    { name: 'Quant/Cálculo', xp: Math.floor(user.xp * 0.20), color: 'bg-indigo-500' },
    { name: 'Mercados/DeFi', xp: Math.floor(user.xp * 0.35), color: 'bg-blue-600' },
    { name: 'Estratégia/VC', xp: Math.floor(user.xp * 0.20), color: 'bg-orange-500' },
  ];

  const todaysXP = user.stats.dailyXP ? user.stats.dailyXP[user.stats.dailyXP.length - 1] : 0;
  
  // Recomendar os 3 primeiros módulos para acesso rápido
  const recommendedModules = MODULES.slice(0, 3);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col items-center justify-center py-16 md:py-20 px-8 glass rounded-[60px] relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-56 h-56 md:w-80 md:h-80 mb-12">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100 dark:text-white/5" />
              <circle 
                cx="50%" 
                cy="50%" 
                r="45%" 
                stroke="currentColor" 
                strokeWidth="10" 
                fill="transparent" 
                strokeDasharray="283%" 
                strokeDashoffset={`calc(283% - (283% * ${xpPercentage % 100}) / 100)`} 
                className="text-emerald-500 transition-all duration-[2500ms] ease-out stroke-round drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-2">Poder Alpha</p>
              <span className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{user.xp}</span>
              <div className="mt-4 md:mt-6 px-5 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">NÍVEL {user.level}</p>
              </div>
            </div>
          </div>
          
          <div className="text-center space-y-10 w-full">
             <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-tight">CENTRAL DE <span className="text-gradient">COMANDO</span></h2>
             
             <div className="flex flex-col items-center gap-4">
               <button 
                  onClick={onClaimDaily}
                  disabled={!canClaim}
                  className={`group relative px-10 md:px-14 py-5 font-black rounded-3xl overflow-hidden transition-all uppercase tracking-widest text-[11px] shadow-xl active:scale-95 ${canClaim ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:scale-105' : 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500 border border-slate-200 dark:border-white/5 cursor-not-allowed'}`}
               >
                  <span className="relative z-10 flex items-center gap-3">
                    {canClaim ? '💎 COLETAR BÔNUS DIÁRIO (+50 XP)' : `PRÓXIMO BÔNUS EM: ${timeLeft}`}
                  </span>
               </button>
               {!canClaim && (
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Sincronização diária concluída</p>
               )}
             </div>

             <div className="flex justify-center gap-6 md:gap-16 pt-10 border-t border-slate-100 dark:border-white/5 max-w-2xl mx-auto">
                <div className="text-center">
                   <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase mb-2 tracking-widest">Ganhos Hoje</p>
                   <p className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-500">+{todaysXP} XP</p>
                </div>
                <div className="text-center">
                   <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase mb-2 tracking-widest">Frequência</p>
                   <p className="text-2xl md:text-3xl font-black text-orange-500">🔥 {user.stats.streak || 1}D</p>
                </div>
                <div className="text-center">
                   <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase mb-2 tracking-widest">Protocolo</p>
                   <p className={`text-2xl md:text-3xl font-black ${user.plan === PlanType.ELITE ? 'text-indigo-600 dark:text-indigo-500' : 'text-emerald-600 dark:text-emerald-500'}`}>{user.plan}</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* NOVO: Atalhos Rápidos */}
      <section className="space-y-6">
        <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-sm">🔥</span>
          Continuar Jornada
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedModules.map((mod) => (
            <div 
              key={mod.id} 
              onClick={() => onSelectModule && onSelectModule(mod)}
              className="p-6 glass rounded-[32px] border border-slate-200 dark:border-white/5 hover:border-emerald-500 transition-all cursor-pointer group active:scale-95"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-3xl">{mod.icon}</span>
                <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Play size={14} fill="currentColor" />
                </div>
              </div>
              <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white line-clamp-1">{mod.title}</h4>
              <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-widest">Entrar no Módulo</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass rounded-[48px] p-10 border border-slate-200 dark:border-white/5 relative overflow-hidden flex flex-col min-h-[500px]">
          <div className="mb-10 flex justify-between items-start">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Hall da Fama Global</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                {ranking ? `${ranking.length} Operadores Ativos` : 'Buscando sinal...'} | Sua Posição: #{userRank}
              </p>
            </div>
            <button 
              onClick={fetchRanking}
              disabled={isSyncing}
              className={`p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-all active:scale-95 ${isSyncing ? 'animate-spin' : ''}`}
            >
              🔄
            </button>
          </div>
          
          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
            {!ranking ? (
               <div className="flex flex-col items-center justify-center h-full opacity-20">
                 <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Acessando Camada Alpha...</p>
               </div>
            ) : ranking.map((player, i) => {
              const isElite = player.plan === PlanType.ELITE;
              const isCurrentUser = player.id === user.id;

              return (
                <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isCurrentUser ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-50 dark:bg-white/5 border-transparent hover:border-slate-200 dark:hover:border-white/10'}`}>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-black w-6 ${i < 3 ? 'text-emerald-500' : 'text-slate-400'}`}>#{i + 1}</span>
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-xl shadow-sm overflow-hidden border border-slate-200 dark:border-white/5">
                      {player.photo_url ? <img src={player.photo_url} className="w-full h-full object-cover" /> : '👤'}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[11px] font-black uppercase tracking-tighter ${isElite ? 'text-indigo-600 dark:text-indigo-400' : isCurrentUser ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                        {player.name} {isCurrentUser && " (VOCÊ)"}
                      </span>
                      {isElite && (
                        <span className="text-[8px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">(ELITE)</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-slate-500 dark:text-white">{player.xp.toLocaleString()} XP</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-[48px] p-10 border border-slate-200 dark:border-white/5">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Análise de Maestria</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Distribuição Teórica</p>
            </div>
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-500 border border-indigo-500/20">🧠</div>
          </div>
          <div className="space-y-6">
            {categoryStats.map((cat) => (
              <div key={cat.name} className="space-y-3">
                <div className="flex justify-between items-end px-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{cat.name}</span>
                  <span className="text-[10px] font-black text-slate-900 dark:text-white">{cat.xp} XP</span>
                </div>
                <div className="w-full h-2.5 progress-bg rounded-full overflow-hidden border border-slate-100 dark:border-white/5">
                  <div 
                    className={`${cat.color} h-full transition-all duration-1000`} 
                    style={{ width: `${Math.min((cat.xp / (user.xpNextLevel * 0.4)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
