
import React from 'react';

export const LegalFooter: React.FC = () => {
  return (
    <footer className="mt-20 py-10 border-t border-white/5 text-slate-500">
      <div className="max-w-7xl mx-auto px-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">MoneyLab Academy // Compliance</h4>
            <p className="text-[10px] leading-relaxed font-medium uppercase tracking-tighter">
              AVISO LEGAL: Todo o conteúdo gerado nesta plataforma é estritamente educacional e informativo. A MoneyLab Academy não fornece recomendações de investimento, consultoria financeira, jurídica ou contábil. Investimentos em mercados financeiros envolvem riscos de perda de capital.
            </p>
          </div>
          <div className="space-y-4 md:text-right">
             <p className="text-[10px] leading-relaxed font-medium uppercase tracking-tighter">
               O uso de Inteligência Artificial para geração de tratados econômicos visa a expansão do conhecimento teórico. Decisões baseadas nestas informações são de inteira responsabilidade do usuário. Consulte sempre um profissional certificado (CNPI/CEA/CFA) antes de investir.
             </p>
             <p className="text-[9px] font-bold text-slate-700">© 2025 MONEYLAB CORP. TODOS OS DIREITOS RESERVADOS.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
