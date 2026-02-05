
import React from 'react';
import { PlanType, User } from '../types.ts';
import { PLANS } from '../constants.tsx';

interface PricingProps {
  user: User;
  onUpgrade: (plan: PlanType) => void;
}

export const Pricing: React.FC<PricingProps> = ({ user, onUpgrade }) => {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <header className="text-center space-y-6 max-w-3xl mx-auto">
        <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-tight">
          ESCOLHA SEU <span className="text-gradient">NÍVEL DE ACESSO</span>
        </h2>
        <p className="text-slate-400 text-lg uppercase tracking-widest font-bold">
          Desbloqueie ferramentas de elite e acelere sua jornada alpha.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {PLANS.map((plan) => {
          const isCurrentPlan = user.plan === plan.type;
          const isPopular = plan.type === PlanType.PRO;

          return (
            <div 
              key={plan.type}
              className={`relative p-10 glass rounded-[60px] border flex flex-col transition-all duration-500 hover:scale-[1.02] ${
                isPopular ? 'border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.1)]' : 'border-white/5'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-lg z-10">
                  MAIS ESCOLHIDO
                </div>
              )}

              <div className="mb-10 pt-4">
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 text-slate-900 dark:text-white leading-none">{plan.name}</h3>
                <div className="flex items-end gap-1.5 h-16">
                  <span className="text-2xl font-black text-slate-500 dark:text-slate-400 mb-1">R$</span>
                  <span className="text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-none inline-block align-bottom">{plan.price}</span>
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest ml-1 mb-1">/ único</span>
                </div>
              </div>

              <div className="space-y-4 mb-12 flex-1">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-[10px] shrink-0 mt-0.5">
                      ✓
                    </div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide leading-snug">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => !isCurrentPlan && onUpgrade(plan.type)}
                disabled={isCurrentPlan}
                className={`w-full py-6 rounded-[30px] font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-xl ${
                  isCurrentPlan 
                    ? 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-600 cursor-default border border-slate-200 dark:border-white/5' 
                    : `${plan.color} hover:shadow-2xl hover:scale-105 active:scale-95 cursor-pointer`
                }`}
              >
                {isCurrentPlan ? 'PLANO ATUAL' : plan.buttonText}
              </button>
            </div>
          );
        })}
      </div>

      <div className="p-12 glass rounded-[60px] border border-slate-200 dark:border-white/5 text-center bg-white/[0.01]">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-4">Garantia Alpha</p>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed font-medium">
          Ao fazer o upgrade, você ganha acesso imediato a novos módulos e ferramentas de IA. 
          Sua evolução é nossa prioridade técnica.
        </p>
      </div>
    </div>
  );
};
