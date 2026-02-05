
import React, { useState } from 'react';
import { Page } from '../types';
import { supabase } from '../services/supabase';
import { ArrowRight, AlertCircle } from 'lucide-react';

interface AuthProps {
  mode: 'login' | 'register';
  onSuccess: () => void;
  onSwitch: (page: Page) => void;
}

export const Auth: React.FC<AuthProps> = ({ mode, onSuccess, onSwitch }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'register') {
        const { error: signUpError } = await supabase.auth.signUp({
          email, password, options: { data: { full_name: name } }
        });
        if (signUpError) throw signUpError;
        alert('Protocolo de Recrutamento Iniciado! Verifique seu email para validar seu acesso.');
        onSwitch('login');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'Acesso Negado: Credenciais não reconhecidas pelo sistema.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-[#020617] animate-in fade-in duration-700">
      {/* Lado Esquerdo - Painel de Status Alpha */}
      <div className="hidden md:flex md:w-5/12 gradient-finance p-16 flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse"></div>
        
        {/* Topo - Identidade */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">M</div>
             <h1 className="text-xl font-black font-heading tracking-tighter uppercase">MoneyLab Academy</h1>
          </div>
        </div>

        {/* Rodapé - Estilo Mensagem/Chat */}
        <div className="relative z-10 animate-in slide-in-from-bottom-8 duration-1000">
          <div className="flex items-start gap-4">
            {/* Bloco de Perfil Menor */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative mb-2">
                <div className="absolute inset-0 rounded-full border border-emerald-500/40 animate-ping opacity-20"></div>
                <div className="relative w-10 h-10 rounded-full border border-emerald-500 p-0.5 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  <img 
                    src="https://i.pravatar.cc/100?img=12" 
                    alt="Perfil" 
                    className="w-full h-full rounded-full object-cover grayscale"
                  />
                </div>
              </div>
              <div className="text-center">
                <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest leading-none">Alpha</p>
                <p className="text-[7px] text-white/30 font-bold uppercase tracking-widest mt-0.5">#0942</p>
              </div>
            </div>

            {/* Balão de Mensagem */}
            <div className="flex-1 relative">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl rounded-tl-none shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Aluno Premium</span>
                </div>
                <p className="text-[12px] md:text-[13px] font-medium leading-relaxed text-white/80 italic">
                  “O MoneyLab mudou minha visão sobre o jogo do dinheiro. Hoje opero com clareza total no mercado.”
                </p>
              </div>
              {/* Seta do Balão */}
              <div className="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-white/5 border-l-[10px] border-l-transparent"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário (Agora realmente alto com pt-6 md:pt-10) */}
      <div className="flex-1 flex items-start justify-center p-8 md:p-16 lg:p-24 pt-6 md:pt-10 bg-white dark:bg-[#020617] overflow-y-auto">
        <div className="w-full max-w-md space-y-10">
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white font-heading uppercase tracking-tighter leading-none">
              {mode === 'login' ? 'ACESSO AO COMANDO' : 'CRIAR CONTA ALPHA'}
            </h2>
            <div className="flex items-center gap-3">
              <div className="h-[2px] w-8 bg-emerald-500"></div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
                {mode === 'login' ? 'Insira suas credenciais Alpha' : 'Cadastre seu token de acesso'}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-5 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <input 
                  type="text" required placeholder="Ex: Lucas Alpha" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[20px] outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 dark:text-white font-bold transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" 
                />
              </div>
            )}
            <div className="space-y-2">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail de Acesso</label>
               <input 
                type="email" required placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[20px] outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 dark:text-white font-bold transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" 
              />
            </div>
            <div className="space-y-2">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha Segura</label>
               <input 
                type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[20px] outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 dark:text-white font-bold transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" 
              />
            </div>
            
            <button 
              disabled={loading} 
              className="group relative w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black rounded-[24px] hover:bg-emerald-500 dark:hover:bg-emerald-500 dark:hover:text-white transition-all uppercase tracking-[0.3em] text-xs cursor-pointer shadow-2xl overflow-hidden mt-4"
            >
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative flex items-center justify-center gap-3">
                {loading ? 'PROCESSANDO...' : mode === 'login' ? 'ENTRAR NO SISTEMA' : 'INICIAR MINHA JORNADA'}
                {!loading && <ArrowRight size={14} />}
              </span>
            </button>
          </form>

          <div className="text-center pt-8 pb-10 space-y-6">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
              {mode === 'login' ? 'Ainda não é Alpha?' : 'Já possui conta?'}
            </p>
            <button 
              onClick={() => onSwitch(mode === 'login' ? 'register' : 'login')} 
              className="px-8 py-3 border border-slate-200 dark:border-white/10 rounded-full text-xs font-black text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer uppercase tracking-widest"
            >
              {mode === 'login' ? 'Criar Conta Grátis' : 'Voltar para Login'}
            </button>
            
            <div className="pt-4">
               <button 
                onClick={() => onSwitch('landing')} 
                className="text-[10px] font-black text-slate-400 dark:text-slate-600 hover:text-emerald-500 transition-colors uppercase tracking-[0.5em] cursor-pointer"
              >
                ← Voltar à Base
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
