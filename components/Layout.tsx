
import React, { useState } from 'react';
import { Page, User } from '../types.ts';
import { LegalFooter } from './Footer.tsx';
import { DoorOpen } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: Page;
  onNavigate: (page: Page) => void;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate, user, onLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  if (!user) return <div className="bg-slate-50 dark:bg-slate-950">{children}</div>;

  const NavButton = ({ id, label, icon }: { id: Page; label: string; icon: string }) => (
    <button 
      onClick={() => onNavigate(id)}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] cursor-pointer ${
        activePage === id 
        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10' 
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
      }`}
    >
      <span className="text-xl">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-[#020617] text-slate-950 dark:text-white transition-colors duration-300 overflow-hidden">
      
      {/* Sidebar - Fixa no Desktop através do overflow-hidden no pai e h-full aqui */}
      <aside className="w-full md:w-80 h-auto md:h-full bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-white/5 relative z-50 overflow-y-auto custom-scrollbar">
        <div className="p-10">
          <h1 className="text-2xl font-black font-heading tracking-tighter flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950 text-lg shadow-lg">M</div>
            <div className="flex flex-col">
                <span className="leading-none text-slate-950 dark:text-white">MONEY<span className="text-emerald-600 dark:text-emerald-500 font-extrabold">LAB</span></span>
                <span className="text-[10px] text-slate-500 uppercase tracking-[0.3em]">Academy</span>
            </div>
          </h1>
        </div>

        <nav className="flex-1 px-6 space-y-2 pb-10">
          <NavButton id="dashboard" label="QG de Comando" icon="⚡" />
          <NavButton id="terminal" label="IA Nexus Alpha" icon="🛰️" />
          <NavButton id="course" label="Forja de Elite" icon="🔥" />
          <NavButton id="news" label="Terminal News" icon="📰" />
          <NavButton id="simulators" label="Labs Econômicos" icon="🧪" />
          <NavButton id="pricing" label="Planos Alpha" icon="💎" />
        </nav>
        
        <div className="p-6 mt-auto">
           <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 p-4 bg-slate-50 dark:bg-red-500/10 text-slate-500 dark:text-red-400 rounded-2xl border border-slate-200 dark:border-red-500/20 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/20 transition-all font-black uppercase tracking-widest text-[10px] cursor-pointer"
          >
            <DoorOpen size={16} /> SAIR DO SISTEMA
          </button>
        </div>
      </aside>

      {/* Área Principal - O scroll agora acontece apenas aqui */}
      <main className="flex-1 overflow-y-auto p-6 md:p-16 relative flex flex-col custom-scrollbar">
        {/* Header de Perfil */}
        <div className="absolute top-8 right-8 z-[100]">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-4 p-2 pl-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-full shadow-md hover:shadow-lg hover:border-emerald-500 transition-all cursor-pointer"
          >
            <div className="flex flex-col items-end pr-2 hidden sm:flex">
              <p className="text-[10px] font-black uppercase text-slate-950 dark:text-white">{user.name}</p>
              <p className="text-[8px] text-emerald-600 font-black uppercase tracking-widest">{user.plan}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-lg overflow-hidden shadow-inner">
              {user.photoUrl ? <img src={user.photoUrl} alt="User" className="w-full h-full object-cover" /> : user.name[0]}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute top-full right-0 mt-3 w-48 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-2 border border-slate-200 dark:border-white/10 animate-in fade-in slide-in-from-top-2">
              <button 
                onClick={() => { onNavigate('settings'); setShowProfileMenu(false); }}
                className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl text-slate-950 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest cursor-pointer"
              >
                ⚙️ Configurações
              </button>
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto relative z-10 flex-1 w-full pt-20 md:pt-0">
          {children}
        </div>
        <LegalFooter />
      </main>
    </div>
  );
};
