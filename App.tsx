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

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const isInitialLoad = useRef(true);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('moneylab-theme');
      return (saved as 'light' | 'dark') || 'dark';
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

  const saveToSupabase = async (updatedUser: User) => {
    try {
      const profileData = {
        id: updatedUser.id,
        name: updatedUser.name,
        bio: updatedUser.bio,
        photo_url: updatedUser.photoUrl,
        plan: updatedUser.plan,
        xp: updatedUser.xp,
        level: updatedUser.level,
        xp_next_level: updatedUser.xpNextLevel,
        stats: updatedUser.stats
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });
      
      if (error) {
        console.error("SUPABASE SAVE ERROR:", error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error("NETWORK ERROR DURING SAVE:", e);
      return false;
    }
  };

  const loadProfile = useCallback(async (authUserId: string, metadata: any, createdAt: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUserId)
        .maybeSingle();

      if (error) throw error;

      let loadedUser: User;
      const today = new Date().toISOString().split('T')[0];

      if (data) {
        let currentStats = data.stats || { dailyXP: [0,0,0,0,0,0,0], streak: 1, lastActivityDate: null };
        const lastActivityDateStr = currentStats.lastActivityDate || null;
        const lastActivity = lastActivityDateStr ? lastActivityDateStr.split('T')[0] : null;

        // Lógica de reset diário de XP e Streak
        if (lastActivity && lastActivity !== today) {
          const newDailyXP = [...(currentStats.dailyXP || [0,0,0,0,0,0,0]).slice(1), 0];
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          let newStreak = currentStats.streak || 1;
          if (lastActivity !== yesterdayStr) newStreak = 1;

          currentStats = {
            ...currentStats,
            dailyXP: newDailyXP,
            streak: newStreak,
            lastActivityDate: new Date().toISOString()
          };
        } else if (!lastActivity) {
          currentStats.lastActivityDate = new Date().toISOString();
        }

        loadedUser = {
          id: data.id,
          name: data.name || metadata?.full_name || 'Alpha Pioneer',
          email: email,
          plan: (data.plan as PlanType) || PlanType.FREE,
          level: data.level || 1,
          xp: data.xp || 0,
          xpNextLevel: data.xp_next_level || 1000,
          stats: currentStats,
          joinedAt: data.created_at || createdAt,
          photoUrl: data.photo_url || '',
          bio: data.bio || ''
        };
        
        if (lastActivity && lastActivity !== today) {
          await saveToSupabase(loadedUser);
        }
      } else {
        // Novo Perfil
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
        await saveToSupabase(loadedUser);
      }

      setUser(loadedUser);
      localStorage.setItem('moneylab-user-cache', JSON.stringify(loadedUser));
      return loadedUser;
    } catch (e) {
      console.error("PROFILE LOAD ERROR:", e);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          const loaded = await loadProfile(
            session.user.id, 
            session.user.user_metadata, 
            session.user.created_at, 
            session.user.email || ''
          );
          if (loaded) setCurrentPage('dashboard');
        }
      } catch (e) {
        console.error("INIT ERROR:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
        setLoading(true);
        await loadProfile(
          session.user.id, 
          session.user.user_metadata, 
          session.user.created_at, 
          session.user.email || ''
        );
        setCurrentPage('dashboard');
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('moneylab-user-cache');
        setCurrentPage('landing');
      }
    });

    return () => { 
      isMounted = false; 
      subscription.unsubscribe(); 
    };
  }, [loadProfile]);

  const handleGainXP = useCallback(async (amount: number) => {
    setUser(prev => {
      if (!prev) return null;
      
      let newXP = prev.xp + amount;
      let newLevel = prev.level;
      let newXPNextLevel = prev.xpNextLevel;
      
      while (newXP >= newXPNextLevel) {
        newLevel += 1;
        newXPNextLevel = Math.floor(newXPNextLevel * 1.5);
      }
      
      const newDailyXP = [...(prev.stats.dailyXP || [0,0,0,0,0,0,0])];
      if (newDailyXP.length > 0) {
        newDailyXP[newDailyXP.length - 1] += amount;
      }
      
      const updated = {
        ...prev,
        xp: newXP,
        level: newLevel,
        xpNextLevel: newXPNextLevel,
        stats: { ...prev.stats, dailyXP: newDailyXP, lastActivityDate: new Date().toISOString() }
      };
      
      saveToSupabase(updated);
      localStorage.setItem('moneylab-user-cache', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleClaimDaily = async () => {
    if (!user) return;
    const amount = 50;
    handleGainXP(amount);
    setUser(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        stats: {
          ...prev.stats,
          lastClaimedAt: new Date().toISOString(),
          streak: (prev.stats.streak || 0) + 1
        }
      };
      saveToSupabase(updated);
      return updated;
    });
  };

  const handleUpdateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('moneylab-user-cache', JSON.stringify(updated));
    await saveToSupabase(updated);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center gap-8 text-center px-6">
       <div className="relative w-24 h-24">
         <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full"></div>
         <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
       </div>
       <div className="space-y-4">
         <p className="text-emerald-500 font-black text-xs uppercase tracking-[0.5em] animate-pulse">Sincronizando Nucleo Alpha...</p>
         <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest max-w-[200px] mx-auto opacity-50">Isolando frequências de dados e carregando protocolos de segurança</p>
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
          onGainXP={handleGainXP} 
          onUpgrade={() => { setActiveModule(null); setCurrentPage('pricing'); }}
        />
      )}
      <Layout activePage={currentPage} onNavigate={setCurrentPage} user={user} onLogout={() => supabase.auth.signOut()}>
        {currentPage === 'landing' && (
          <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-8 text-center space-y-16">
            <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-none animate-in fade-in slide-in-from-top-8 duration-1000">MONEYLAB<br/><span className="text-gradient">ACADEMY.</span></h1>
            <div className="flex flex-col md:flex-row gap-6 items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              <button onClick={() => setCurrentPage('register')} className="px-12 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black rounded-[40px] uppercase text-xs cursor-pointer hover:bg-emerald-500 hover:text-white transition-all shadow-2xl">Criar Conta Alpha</button>
              <button onClick={() => setCurrentPage('login')} className="px-12 py-6 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-emerald-500 font-black rounded-[40px] uppercase text-[10px] tracking-[0.2em] cursor-pointer">Iniciar Jornada</button>
            </div>
          </div>
        )}
        {currentPage === 'login' && <Auth mode="login" onSuccess={() => {}} onSwitch={setCurrentPage} />}
        {currentPage === 'register' && <Auth mode="register" onSuccess={() => {}} onSwitch={setCurrentPage} />}
        {currentPage === 'dashboard' && user && <Dashboard user={user} onNavigate={setCurrentPage} onGainXP={handleGainXP} onClaimDaily={handleClaimDaily} />}
        {currentPage === 'news' && user && <News userPlan={user.plan} onActivity={() => handleGainXP(20)} onNavigate={setCurrentPage} />}
        {currentPage === 'terminal' && user && <TerminalAlpha />}
        {currentPage === 'simulators' && <CompoundInterestSimulator />}
        {currentPage === 'pricing' && user && <Pricing user={user} onUpgrade={() => {}} />}
        {currentPage === 'settings' && user && <Settings user={user} onUpdateProfile={handleUpdateProfile} theme={theme} onUpdateTheme={setTheme} onNavigate={setCurrentPage} onUpgrade={() => {}} />}
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