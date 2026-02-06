import React, { useState, useRef, useEffect } from 'react';
import { User, PlanType, Page } from '../types';
import { Sun, Moon, Gem, Zap, Globe, Key, Wifi, WifiOff } from 'lucide-react';
import { testApiConnection } from '../services/geminiService';

interface SettingsProps {
  user: User;
  onUpdateProfile: (updates: Partial<User>) => Promise<void>;
  theme: 'light' | 'dark';
  onUpdateTheme: (theme: 'light' | 'dark') => void;
  onNavigate: (page: Page) => void;
  onUpgrade: (plan: PlanType) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onUpdateProfile, theme, onUpdateTheme, onNavigate, onUpgrade }) => {
  const [activeTab, setActiveTab] = useState<'perfil' | 'aparência' | 'assinatura' | 'ia'>('perfil');
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl || '');
  const [saving, setSaving] = useState(false);
  
  // API Key State
  const [tempApiKey, setTempApiKey] = useState(localStorage.getItem('moneylab_alpha_key') || '');
  const [apiStatus, setApiStatus] = useState<'idle' | 'testing' | 'online' | 'offline'>('idle');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(user.name);
    setBio(user.bio || '');
    setPhotoUrl(user.photoUrl || '');
  }, [user.photoUrl, user.name, user.bio]);

  const handleSaveApiKey = () => {
    localStorage.setItem('moneylab_alpha_key', tempApiKey);
    alert("Chave Alpha salva localmente!");
    window.location.reload();
  };

  const handleTestConnection = async () => {
    setApiStatus('testing');
    const isOnline = await testApiConnection();
    setApiStatus(isOnline ? 'online' : 'offline');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onloadstart = () => setSaving(true);
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        setSaving(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateProfile({ name, bio, photoUrl });
      alert("Operação Alpha concluída!");
    } catch (error) {
      alert("Erro ao sincronizar.");
    } finally {
      setSaving(false);
    }
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
          {[
            { id: 'perfil', label: 'Perfil', icon: '👤' },
            { id: 'aparência', label: 'Aparência', icon: '🎨' },
            { id: 'assinatura', label: 'Assinatura', icon: '💎' },
            { id: 'ia', label: 'IA & API', icon: '🛰️' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full text-left px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border ${activeTab === tab.id ? 'bg-emerald-500 text-slate-950 shadow-lg border-emerald-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white border-transparent hover:bg-slate-200 dark:hover:bg-white/5'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 glass rounded-[40px] p-10 border border-slate-200 dark:border-white/5 shadow-xl min-h-[500px]">
          {activeTab === 'perfil' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="flex items-center gap-8 pb-8 border-b border-slate-200 dark:border-white/5">
                <div className="w-24 h-24 rounded-3xl bg-emerald-500 text-white flex items-center justify-center text-4xl font-black shadow-xl overflow-hidden relative">
                  {photoUrl ? <img src={photoUrl} className="w-full h-full object-cover" /> : user.name[0]}
                  {saving && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>}
                </div>
                <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-[10px] font-black rounded-xl hover:bg-emerald-500 transition-all uppercase tracking-widest">ALTERAR FOTO</button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu Nome" className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-950 dark:text-white font-bold" />
                <input type="email" value={user.email} disabled className="w-full p-4 bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl text-slate-400 cursor-not-allowed font-bold" />
              </div>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Sua biografia Alpha..." className="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-950 dark:text-white font-bold" rows={3}></textarea>
              <button onClick={handleSave} className="px-10 py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl hover:bg-emerald-400 transition-all uppercase tracking-widest text-xs w-full">SALVAR PERFIL</button>
            </div>
          )}

          {activeTab === 'ia' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <Key size={24} className="text-emerald-500" />
                   <h3 className="text-2xl font-black uppercase text-slate-900 dark:text-white">Protocolo de IA</h3>
                </div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                  Para rodar o Terminal News (100 notícias) e o Terminal Nexus, você precisa de uma chave Google Gemini. 
                  Você pode usar a chave global do sistema ou inserir sua própria chave paga abaixo.
                </p>
              </div>

              <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[32px] border border-slate-200 dark:border-white/10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sua API Key Gemini</label>
                  <input 
                    type="password" 
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="AIzaSy..." 
                    className="w-full p-4 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-mono" 
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={handleSaveApiKey} className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black rounded-xl hover:bg-emerald-500 transition-all text-[10px] uppercase tracking-widest">SALVAR CHAVE</button>
                  <button onClick={handleTestConnection} className="flex-1 py-4 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-black rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                    {apiStatus === 'testing' ? 'TESTANDO...' : 'TESTAR CONEXÃO'}
                  </button>
                </div>

                {apiStatus !== 'idle' && (
                  <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in ${apiStatus === 'online' ? 'bg-emerald-500/10 text-emerald-500' : apiStatus === 'offline' ? 'bg-red-500/10 text-red-500' : 'bg-slate-100 text-slate-400'}`}>
                    {apiStatus === 'online' ? <Wifi size={16} /> : <WifiOff size={16} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {apiStatus === 'online' ? 'CONEXÃO ALPHA ESTABELECIDA' : apiStatus === 'offline' ? 'CONEXÃO FALHOU: VERIFIQUE SUA CHAVE' : 'TESTANDO LATÊNCIA...'}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Nota Alpha: Chaves armazenadas no localStorage são prioridade sobre o servidor.</p>
              </div>
            </div>
          )}

          {activeTab === 'aparência' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in">
              <button onClick={() => onUpdateTheme('light')} className={`p-8 rounded-[30px] border-2 flex flex-col items-center gap-4 transition-all ${theme === 'light' ? 'bg-white border-emerald-500 shadow-xl' : 'bg-slate-50 border-transparent opacity-60'}`}>
                <Sun size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest">White Mode</span>
              </button>
              <button onClick={() => onUpdateTheme('dark')} className={`p-8 rounded-[30px] border-2 flex flex-col items-center gap-4 transition-all ${theme === 'dark' ? 'bg-slate-900 border-emerald-500 shadow-xl' : 'bg-slate-800 border-transparent opacity-60'}`}>
                <Moon size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Dark Mode</span>
              </button>
            </div>
          )}
          
          {activeTab === 'assinatura' && (
            <div className="animate-in fade-in">
              {/* O mesmo card de assinatura que já tínhamos */}
              <div className="p-8 bg-slate-900 rounded-[32px] text-white space-y-6">
                <h4 className="text-3xl font-black uppercase tracking-tighter">Status: {user.plan}</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed uppercase">Você tem acesso ao Protocolo {user.plan === PlanType.ELITE ? 'Máximo' : 'Standard'}.</p>
                <button onClick={() => onNavigate('pricing')} className="px-8 py-4 bg-emerald-500 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-widest">MUDAR PLANO</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};