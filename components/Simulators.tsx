
import React, { useState } from 'react';

export const CompoundInterestSimulator: React.FC = () => {
  const [initial, setInitial] = useState(1000);
  const [monthly, setMonthly] = useState(200);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(10);

  const calculate = () => {
    let total = initial;
    const monthlyRate = (rate / 100) / 12;
    const months = years * 12;

    for (let i = 0; i < months; i++) {
      total = (total + monthly) * (1 + monthlyRate);
    }
    return total;
  };

  const totalValue = calculate();
  const invested = initial + (monthly * years * 12);
  const interest = totalValue - invested;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900">
        <span className="text-2xl">📈</span> Simulador de Liberdade Financeira
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Aporte Inicial (R$)</label>
            <input 
              type="number" 
              value={initial} 
              onChange={(e) => setInitial(Number(e.target.value))}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-bold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Aporte Mensal (R$)</label>
            <input 
              type="number" 
              value={monthly} 
              onChange={(e) => setMonthly(Number(e.target.value))}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-bold"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-1">Taxa Anual (%)</label>
              <input 
                type="number" 
                value={rate} 
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-bold"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-600 mb-1">Tempo (Anos)</label>
              <input 
                type="number" 
                value={years} 
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-bold"
              />
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 p-6 rounded-xl flex flex-col justify-center text-center">
          <p className="text-slate-600 text-sm mb-1 uppercase tracking-wider font-bold">Valor Estimado no Final</p>
          <p className="text-4xl font-extrabold text-emerald-700 mb-4">
            {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-200">
            <div>
              <p className="text-xs text-emerald-600 uppercase font-bold">Investido</p>
              <p className="font-semibold text-slate-700">{invested.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
            <div>
              <p className="text-xs text-emerald-600 uppercase font-bold">Juros Ganhos</p>
              <p className="font-semibold text-slate-700">{interest.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
