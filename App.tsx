import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { Settings } from './components/Settings';
import { Dashboard } from './components/Dashboard';
import { News } from './components/News';
import { CoursePlayer } from './components/CoursePlayer';
import { TerminalAlpha } from './components/Terminal';
import { Pricing } from './components/Pricing';
import { Page, PlanType, User, Module } from './types';
import { MODULES } from './constants';
import { CompoundInterestSimulator } from './components/Simulators';
import { supabase } from './services/supabase';
import { getStoredApiKey } from './services/geminiService';
import { Key, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBypass, setShowBypass] = useState(false);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const isMounted = useRef(true);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('moneylab-theme');
      return (saved as 'light' | 'dark') || 'dark';
    } catch { return 'dark'; }
  });

  const checkApiKeyStatus = useCallback(async () => {
    try {
      const key = getStoredApiKey();
      if (key) {
        setHasApiKey(true);
        return;
      }
      
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        setHasApiKey(false);
      }
    } catch (e) {
      setHasApiKey(false);
    }
  }, []);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('moneylab-theme', theme);
  }, [theme]);

  const loadProfile = useCallback(async (authUserId: string, metadata: any, createdAt: string, email: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', authUserId).maybeSingle();
      if (error) throw error;

      let loadedUser: User;
      if (data) {
        loadedUser = {
          id: data.id,
          name: data.name || metadata?.full_name || 'Alpha Pioneer',
          email: email,
          plan: (data.plan as PlanType) || PlanType.FREE,
          level: data.level || 1,
          xp: data.xp || 0,
          xpNextLevel: data.xp_next_level || 1000,
          stats: data.stats || { dailyXP: [0,0,0,0,0,0,0], streak: 1, lastActivityDate: new Date().toISOString() },
          joinedAt: data.created_at || createdAt,
          photoUrl: data.photo_url || '',
          bio: data.bio || ''
        };
      } else {
        loadedUser = {
          id: authUserId,
          name: metadata?.full_name || 'Alpha Pioneer',
          email: email,
          plan: PlanType.FREE,
          level: 1,
          xp: 10,
          xpNextLevel: 1000,
          stats: { dailyXP: [0, 0, 0, 0, 0, 0, 10], achievements: [], streak: 1, totalTimeStudy: 0, lastClaimedAt: null, lastActivityDate: new Date().toISOString() },
          joinedAt: createdAt
        };
      }
      if (isMounted.current) setUser(loadedUser);
      return loadedUser;
    } catch (e) { return null; }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    checkApiKeyStatus();
    
    // Watchdog Timer: Se em 5 segundos não carregar, mostra o botão de bypass
    const bypassTimer = setTimeout(() => {
      if (isMounted.current && loading) setShowBypass(true);
    }, 5000);

    // Hard Timeout: Se em 10 segundos não carregar, força o fechamento do loading
    const forceTimer = setTimeout(() => {
      if (isMounted.current && loading) setLoading(false);
    }, 10000);

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted.current) {
          await loadProfile(session.user.id, session.user.user_metadata, session.user.created_at, session.user.email || '');
          setCurrentPage(prev => (['landing', 'login', 'register'].includes(prev) ? 'dashboard' : prev));
        }
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted.current) return;
      if (event === 'SIGNED_IN' && session?.user) {
        setLoading(true);
        await loadProfile(session.user.id, session.user.user_metadata, session.user.created_at, session.user.email || '');
        setCurrentPage('dashboard');
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCurrentPage('landing');
      }
    });

    return () => { 
      isMounted.current = false; 
      subscription.unsubscribe();
      clearTimeout(bypassTimer);
      clearTimeout(forceTimer);
    };
  }, [loadProfile, checkApiKeyStatus]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center gap-8 p-6 text-center">
       <div className="relative">
         <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
         <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
         </div>
       </div>
       <div className="space-y-2">
         <p className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">Iniciando Protocolo Alpha...</p>
         <p className="text-slate-500 dark:text-slate-600 text-[8px] font-bold uppercase tracking-widest">Sincronizando camadas de inteligência</p>
       </div>

       {showBypass && (
         <button 
           onClick={() => setLoading(false)}
           className="mt-4 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-500 hover:border-emerald-500/50 transition-all animate-in fade-in slide-in-from-bottom-2"
         >
           Forçar Entrada no Sistema
         </button>
       )}
    </div>
  );

  if (user && hasApiKey === false) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center space-y-12">
        <div className="w-20 h-20 bg-amber-500/10 rounded-[32px] flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-2xl">
          <Key size={32} />
        </div>
        <div className="max-w-md space-y-4">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Sincronização Necessária</h2>
          <p className="text-slate-400 text-sm font-medium leading-relaxed">Nenhuma chave detectada. Conecte sua chave pessoal ou vá em Configurações > IA para inserir manualmente.</p>
        </div>
        <div className="flex flex-col gap-4">
          <button onClick={handleOpenKeySelector} className="px-12 py-6 bg-emerald-500 text-slate-950 font-black rounded-3xl hover:bg-emerald-400 transition-all uppercase tracking-widest text-[10px] shadow-2xl active:scale-95">Conectar via AI Studio</button>
          <button onClick={() => setCurrentPage('settings')} className="text-[10px] text-slate-500 font-black uppercase tracking-widest hover:text-white transition-colors">Configurar Manualmente</button>
        </div>
      </div>
    );
  }

  return (
    <>
      {activeModule && user && (
        <CoursePlayer module={activeModule} user={user} onClose={() => setActiveModule(null)} onGainXP={() => {}} onUpgrade={() => { setActiveModule(null); setCurrentPage('pricing'); }} />
      )}
      <Layout activePage={currentPage} onNavigate={setCurrentPage} user={user} onLogout={() => supabase.auth.signOut()}>
        {currentPage === 'landing' && (
          <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-8 text-center space-y-16">
            <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-none">MONEYLAB<br/><span className="text-gradient">ACADEMY.</span></h1>
            <div className="flex flex-col md:flex-row gap-6">
              <button onClick={() => setCurrentPage('register')} className="px-12 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black rounded-[40px] uppercase text-xs cursor-pointer hover:bg-emerald-500 transition-all">Criar Conta Alpha</button>
              <button onClick={() => setCurrentPage('login')} className="px-12 py-6 border border-slate-200 dark:border-white/10 text-slate-600 font-black rounded-[40px] uppercase text-[10px] tracking-[0.2em] cursor-pointer">Iniciar Jornada</button>
            </div>
          </div>
        )}
        {currentPage === 'login' && <Auth mode="login" onSuccess={() => {}} onSwitch={setCurrentPage} />}
        {currentPage === 'register' && <Auth mode="register" onSuccess={() => {}} onSwitch={setCurrentPage} />}
        {currentPage === 'dashboard' && user && <Dashboard user={user} onNavigate={setCurrentPage} onGainXP={() => {}} onClaimDaily={() => {}} onSelectModule={setActiveModule} />}
        {currentPage === 'news' && user && <News userPlan={user.plan} onActivity={() => {}} />}
        {currentPage === 'terminal' && user && <TerminalAlpha />}
        {currentPage === 'simulators' && <CompoundInterestSimulator />}
        {currentPage === 'pricing' && user && <Pricing user={user} onUpgrade={() => {}} />}
        {currentPage === 'settings' && user && <Settings user={user} onUpdateProfile={async (upd) => {
          const { error } = await supabase.from('profiles').update({
            name: upd.name,
            bio: upd.bio,
            photo_url: upd.photoUrl
          }).eq('id', user.id);
          if (!error) setUser({ ...user, ...upd });
        }} theme={theme} onUpdateTheme={setTheme} onNavigate={setCurrentPage} onUpgrade={() => {}} />}
        {currentPage === 'course' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MODULES.map(mod => (
              <div key={mod.id} className="p-8 glass rounded-[40px] border border-slate-200 dark:border-white/5 cursor-pointer hover:border-emerald-500 transition-all group" onClick={() => setActiveModule(mod)}>
                <div className="text-4xl mb-4">{mod.icon}</div>
                <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">{mod.title}</h3>
                <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest line-clamp-2">{mod.description}</p>
              </div>
            ))}
          </div>
        )}
      </Layout>
    </>
  );
};

export default App;