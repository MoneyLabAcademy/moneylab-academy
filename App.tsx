
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout } from './components/Layout.tsx';
import { Auth } from './components/Auth.tsx';
import { Settings } from './components/Settings.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { News } from './components/News.tsx';
import { CoursePlayer } from './components/CoursePlayer.tsx';
import { TerminalAlpha } from './components/Terminal.tsx';
import { Pricing } from './components/Pricing.tsx';
import { Page, PlanType, User, Module } from './types.ts';
import { MODULES } from './constants.tsx';
import { CompoundInterestSimulator } from './components/Simulators.tsx';
import { supabase } from './services/supabase.ts';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const isInitialLoad = useRef(true);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('moneylab-theme') as 'light' | 'dark') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('moneylab-theme', theme);
  }, [theme]);

  const loadProfile = useCallback(async (authUserId: string, metadata: any, createdAt: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUserId)
        .maybeSingle();

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
          xpNextLevel: 1000,
          stats: data.stats || { dailyXP: [0,0,0,0,0,0,0], streak: 1, achievements: [] },
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

      setUser(loadedUser);
      localStorage.setItem('moneylab-user-cache', JSON.stringify(loadedUser));
      return loadedUser;
    } catch (e) {
      console.error("Profile load fail:", e);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      if (!isInitialLoad.current) return;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          await loadProfile(session.user.id, session.user.user_metadata, session.user.created_at, session.user.email || '');
          setCurrentPage('dashboard');
        } else {
          const cached = localStorage.getItem('moneylab-user-cache');
          if (cached && isMounted) {
            setUser(JSON.parse(cached));
            setCurrentPage('dashboard');
          }
        }
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        if (isMounted) {
          setLoading(false);
          isInitialLoad.current = false;
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        if (currentPage === 'landing' || currentPage === 'login' || currentPage === 'register') {
           setLoading(true);
           await loadProfile(session.user.id, session.user.user_metadata, session.user.created_at, session.user.email || '');
           setCurrentPage('dashboard');
           setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('moneylab-user-cache');
        setCurrentPage('landing');
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile, currentPage]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center gap-8">
       <div className="relative w-24 h-24">
         <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full"></div>
         <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
       </div>
       <div className="text-center space-y-2">
         <p className="text-emerald-500 font-black text-xs uppercase tracking-[0.5em] animate-pulse">Autenticando Protocolo Alpha</p>
         <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Sincronizando Terminal de Dados...</p>
       </div>
    </div>
  );

  return (
    <>
      {activeModule && user && (
        <CoursePlayer 
          module={activeModule} 
          user={user} 
          onClose={() => setActiveModule(null)} 
          onGainXP={() => {}} 
          onUpgrade={() => { setActiveModule(null); setCurrentPage('pricing'); }}
        />
      )}
      <Layout activePage={currentPage} onNavigate={setCurrentPage} user={user} onLogout={() => supabase.auth.signOut()}>
        {currentPage === 'landing' && (
          <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center p-8 text-center space-y-16">
            <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-none animate-in fade-in slide-in-from-top-8 duration-1000">MONEYLAB<br/><span className="text-gradient">ACADEMY.</span></h1>
            
            <div className="flex flex-col md:flex-row gap-6 items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              {/* Botão para Criar Conta */}
              <button 
                onClick={() => setCurrentPage('register')} 
                className="group relative px-12 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black rounded-[40px] uppercase text-xs cursor-pointer hover:bg-emerald-500 hover:text-white transition-all shadow-2xl hover:shadow-emerald-500/30 overflow-hidden"
              >
                <span className="relative z-10 tracking-widest">Criar Conta Alpha</span>
                <div className="absolute inset-0 bg-emerald-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </button>

              {/* Botão para Iniciar Jornada (Login) */}
              <button 
                onClick={() => setCurrentPage('login')} 
                className="px-12 py-6 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/5 font-black rounded-[40px] uppercase text-[10px] tracking-[0.2em] cursor-pointer transition-all backdrop-blur-sm shadow-sm"
              >
                Iniciar Jornada
              </button>
            </div>

            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] animate-pulse">
              Protocolo Nexus v9.0 // Sincronização Estável
            </p>
          </div>
        )}
        {currentPage === 'login' && <Auth mode="login" onSuccess={() => {}} onSwitch={setCurrentPage} />}
        {currentPage === 'register' && <Auth mode="register" onSuccess={() => {}} onSwitch={setCurrentPage} />}
        {currentPage === 'dashboard' && user && <Dashboard user={user} onNavigate={setCurrentPage} onGainXP={() => {}} onClaimDaily={() => {}} />}
        {currentPage === 'news' && user && <News userPlan={user.plan} onActivity={() => {}} onNavigate={setCurrentPage} />}
        {currentPage === 'terminal' && user && <TerminalAlpha />}
        {currentPage === 'simulators' && <CompoundInterestSimulator />}
        {currentPage === 'pricing' && user && <Pricing user={user} onUpgrade={() => {}} />}
        {currentPage === 'settings' && user && (
          <Settings 
            user={user} 
            onUpdateProfile={async (u) => { setUser({...user, ...u}); }} 
            theme={theme} 
            onUpdateTheme={setTheme} 
            onNavigate={setCurrentPage} 
            onUpgrade={() => {}} 
          />
        )}
        {currentPage === 'course' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES.map(mod => (
              <div key={mod.id} className="p-8 glass rounded-[40px] border border-slate-200 dark:border-white/5 cursor-pointer hover:border-emerald-500/50 transition-all" onClick={() => setActiveModule(mod)}>
                <div className="text-4xl mb-4">{mod.icon}</div>
                <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">{mod.title}</h3>
                <p className="text-xs text-slate-500 mt-2 font-bold uppercase tracking-widest">{mod.description}</p>
              </div>
            ))}
          </div>
        )}
      </Layout>
    </>
  );
};

export default App;
