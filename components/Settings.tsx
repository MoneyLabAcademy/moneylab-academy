
import React, { useState, useRef, useEffect } from 'react';
import { User, PlanType, Page } from '../types';
import { Sun, Moon, Gem, Zap, Globe } from 'lucide-react';

interface SettingsProps {
  user: User;
  onUpdateProfile: (updates: Partial<User>) => Promise<void>;
  theme: 'light' | 'dark';
  onUpdateTheme: (theme: 'light' | 'dark') => void;
  onNavigate: (page: Page) => void;
  onUpgrade: (plan: PlanType) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onUpdateProfile, theme, onUpdateTheme, onNavigate, onUpgrade }) => {
  const [activeTab, setActiveTab] = useState<'perfil' | 'aparência' | 'assinatura'>('perfil');
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl || '');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(user.name);
    setBio(user.bio || '');
    setPhotoUrl(user.photoUrl || '');
  }, [user.photoUrl, user.name, user.bio]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("O arquivo deve ser uma imagem.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("O arquivo é muito grande. O limite Alpha é 2MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadstart = () => setSaving(true);
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhotoUrl(base64String);
        setSaving(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateProfile({ name, bio, photoUrl });
      alert("Operação Alpha concluída: Dados sincronizados.");
    } catch (error) {
      alert("Erro ao sincronizar dados.");
    } finally {
      setSaving(false);
    }
  };

  const renderAssinaturaCard = () => {
    const isElite = user.plan === PlanType.ELITE;
    const isPro = user.plan === PlanType.PRO;
    const isFree = user.plan === PlanType.FREE;

    if (isElite) {
      return (
        <div className="relative p-12 bg-gradient-to-br from-indigo-900 via-slate-900 to-violet-900 rounded-[50px] text-white border border-indigo-500/30 overflow-hidden group shadow-[0_20px_50px_rgba(79,70,229,0.3)] animate-in zoom-in-95 duration-500">
          {/* Shimmer Effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full h-full -skew-x-12 animate-shine"></div>
          </div>
          
          <div className="absolute top-0 right-0 p-12 text-8xl opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all animate-pulse">💎</div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
                 <Gem size={20} className="text-indigo-300" />
               </div>
               <p className="text-[10px] text-indigo-300 font-black uppercase tracking-[0.4em]">Protocolo Supremo Ativado</p>
            </div>
            
            <h4 className="text-6xl font-black mb-10 uppercase tracking-tighter flex items-center gap-4">
              {user.plan}
              <span className="text-xs bg-indigo-500 px-4 py-1.5 rounded-full tracking-widest font-black shadow-lg shadow-indigo-500/50">MAX</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Acesso Total Vitalício</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">IA Nexus Grounding 100%</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Badge Elite no Ranking</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Suporte Alpha Prioritário</span>
                </div>
            </div>
            
            <button 
              onClick={() => onNavigate('pricing')}
              className="w-full py-6 bg-white text-indigo-950 font-black rounded-[24px] hover:bg-indigo-100 transition-all uppercase tracking-[0.2em] text-[11px] shadow-2xl cursor-pointer"
            >
              VER TODOS OS PLANOS
            </button>
          </div>
        </div>
      );
    }

    if (isPro) {
      return (
        <div className="relative p-12 bg-gradient-to-br from-emerald-900 to-slate-900 rounded-[50px] text-white border border-emerald-500/20 overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 p-12 text-7xl opacity-10 group-hover:rotate-12 transition-transform">⚡</div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-400/30">
                 <Zap size={20} className="text-emerald-400" />
               </div>
               <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.4em]">Protocolo Avançado</p>
            </div>
            
            <h4 className="text-5xl font-black mb-10 uppercase tracking-tighter">{user.plan}</h4>
            
            <div className="space-y-4 mb-12">
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">IA Nexus Alpha Liberada</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Todos os 25 Módulos</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">+50 Notícias com IA Insight</span>
                </div>
            </div>
            
            <button 
              onClick={() => onUpgrade(PlanType.ELITE)}
              className="w-full py-6 bg-emerald-500 text-slate-950 font-black rounded-[24px] hover:bg-emerald-400 transition-all uppercase tracking-[0.2em] text-[11px] cursor-pointer"
            >
              UPGRADE PARA ELITE 💎
            </button>
          </div>
        </div>
      );
    }

    // Default: Explorador
    return (
      <div className="p-12 bg-white dark:bg-slate-900 rounded-[50px] border border-slate-200 dark:border-white/5 relative overflow-hidden group shadow-lg">
        <div className="absolute top-0 right-0 p-12 text-7xl opacity-5 dark:opacity-10">🌍</div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
               <Globe size={20} className="text-slate-400" />
             </div>
             <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Protocolo Inicial</p>
          </div>
          
          <h4 className="text-5xl font-black mb-10 uppercase tracking-tighter text-slate-900 dark:text-white">EXPLORADOR</h4>
          
          <div className="space-y-4 mb-12">
              <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Acesso a 18 Módulos</span>
              </div>
              <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Notícias Limitadas</span>
              </div>
          </div>
          
          <button 
            onClick={() => onNavigate('pricing')}
            className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black rounded-[24px] hover:bg-emerald-500 dark:hover:bg-emerald-500 dark:hover:text-white transition-all uppercase tracking-[0.2em] text-[11px] cursor-pointer"
          >
            MUDAR DE PLANO ⚡
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h2 className="text-5xl font-black text-slate-950 dark:text-white font-heading uppercase tracking-tighter">
          Configurações <span className="text-gradient">Alpha</span>
        </h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Gerencie sua identidade e seu sistema.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        <nav className="w-full md:w-64 space-y-2">
          {['perfil', 'aparência', 'assinatura'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`w-full text-left px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border ${activeTab === tab ? 'bg-emerald-500 text-slate-950 shadow-lg border-emerald-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white border-transparent hover:bg-slate-200 dark:hover:bg-white/5'}`}
            >
              {tab === 'perfil' ? '👤 ' : tab === 'aparência' ? '🎨 ' : '💎 '}
              {tab}
            </button>
          ))}
        </nav>

        <div className="flex-1 glass rounded-[40px] p-10 border border-slate-200 dark:border-white/5 shadow-xl">
          {activeTab === 'perfil' && (
            <div className="space-y-8">
              <div className="flex items-center gap-8 pb-8 border-b border-slate-200 dark:border-white/5">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-indigo-600 text-white flex items-center justify-center text-4xl font-black shadow-xl overflow-hidden relative">
                  {photoUrl ? <img src={photoUrl} className="w-full h-full object-cover" /> : user.name[0]}
                  {saving && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>}
                </div>
                <div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-[10px] font-black rounded-xl hover:bg-emerald-500 transition-all uppercase tracking-widest">ALTERAR FOTO</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Nome de Operador</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-950 dark:text-white font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">E-mail</label>
                  <input type="email" value={user.email} disabled className="w-full p-4 bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl text-slate-400 cursor-not-allowed font-bold" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-950 dark:text-white font-bold" rows={3}></textarea>
              </div>

              <button onClick={handleSave} className="px-10 py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl hover:bg-emerald-400 transition-all uppercase tracking-widest text-xs w-full md:w-auto">SALVAR ALTERAÇÕES</button>
            </div>
          )}

          {activeTab === 'aparência' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-4">
                <h3 className="text-xl font-black uppercase text-slate-950 dark:text-white">Interface do Sistema</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Escolha a estética que melhor se adapta ao seu ambiente de foco.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button 
                  onClick={() => onUpdateTheme('light')}
                  className={`p-8 rounded-[30px] border-2 flex flex-col items-center gap-6 transition-all ${theme === 'light' ? 'bg-white border-emerald-500 shadow-2xl scale-105' : 'bg-slate-50 border-slate-100 opacity-60 hover:opacity-100 hover:border-slate-300'}`}
                >
                  <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shadow-inner">
                    <Sun size={32} strokeWidth={2.5} />
                  </div>
                  <div className="text-center">
                    <span className="block text-sm font-black uppercase tracking-widest text-slate-950">White Mode</span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Clareza e Alto Contraste</span>
                  </div>
                </button>

                <button 
                  onClick={() => onUpdateTheme('dark')}
                  className={`p-8 rounded-[30px] border-2 flex flex-col items-center gap-6 transition-all ${theme === 'dark' ? 'bg-slate-900 border-emerald-500 shadow-2xl scale-105' : 'bg-slate-800 border-slate-700 opacity-60 hover:opacity-100 hover:border-slate-600'}`}
                >
                  <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
                    <Moon size={32} strokeWidth={2.5} />
                  </div>
                  <div className="text-center">
                    <span className="block text-sm font-black uppercase tracking-widest text-white">Dark Mode</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Cyber-Finance Estético</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'assinatura' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
               {renderAssinaturaCard()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
