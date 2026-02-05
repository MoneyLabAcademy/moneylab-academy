
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Module, Lesson, User, PlanType, Quiz } from '../types';
import { generateDeepLesson, generateModuleQuiz } from '../services/geminiService';

interface CoursePlayerProps {
  module: Module;
  user: User;
  onClose: () => void;
  onGainXP: (amount: number) => void;
  onUpgrade: () => void;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({ module, user, onClose, onGainXP, onUpgrade }) => {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(module.lessons[0] || null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [deepContent, setDeepContent] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [acceptedRisk, setAcceptedRisk] = useState(false);
  
  // Quiz state
  const [moduleQuizzes, setModuleQuizzes] = useState<Quiz[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  const isLocked = module.isPremium && user.plan === PlanType.FREE;

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
    setDeepContent(null);
    setWordCount(0);
    setScrollProgress(0);
    setAcceptedRisk(false);
  }, [activeLesson, showQuiz]);

  useEffect(() => {
    if (deepContent && (window as any).MathJax) {
      (window as any).MathJax.typesetPromise().catch((err: any) => console.error("MathJax error:", err));
      const words = deepContent.trim().split(/\s+/).length;
      setWordCount(words);
    }
  }, [deepContent]);

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollProgress(progress);
    }
  };

  const handleDeepDive = async () => {
    if (!activeLesson || generating || !acceptedRisk) return;
    setGenerating(true);
    const text = await generateDeepLesson(module.title, activeLesson.title);
    setDeepContent(text);
    setGenerating(false);
  };

  const startQuiz = async () => {
    setLoadingQuiz(true);
    const quizzes = await generateModuleQuiz(module.title, module.objective);
    setModuleQuizzes(quizzes);
    setLoadingQuiz(false);
    setShowQuiz(true);
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setQuizFinished(false);
    setSelectedOption(null);
    setShowExplanation(false);
  };

  const handleAdvance = () => {
    const currentIndex = module.lessons.findIndex(l => l.id === activeLesson?.id);
    onGainXP(150); 

    if (currentIndex < module.lessons.length - 1) {
      setActiveLesson(module.lessons[currentIndex + 1]);
    } else {
      startQuiz();
    }
  };

  const handleAnswerQuiz = () => {
    if (selectedOption === null) return;
    
    if (selectedOption === moduleQuizzes[currentQuizIndex].correctAnswer) {
      setQuizScore(prev => prev + 1);
    }
    
    setShowExplanation(true);
  };

  const nextQuizQuestion = () => {
    if (currentQuizIndex < moduleQuizzes.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
      onGainXP(1000);
    }
  };

  const content = (
    <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-[#020617] flex overflow-hidden selection:bg-emerald-500/30">
      <div className="absolute top-0 left-0 h-1 bg-emerald-500 shadow-[0_0_15px_#10b981] z-[10002] transition-all duration-100" style={{ width: `${scrollProgress}%` }}></div>

      <aside className="w-80 glass border-r border-slate-200 dark:border-white/5 flex flex-col p-8 shrink-0 relative z-[10001]">
        <button onClick={onClose} className="mb-10 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer">
          <span className="text-lg">←</span> Fechar Forja
        </button>
        
        <div className="mb-10">
          <div className="text-4xl mb-4">{module.icon}</div>
          <h2 className="text-xl font-black uppercase tracking-tighter leading-tight text-slate-900 dark:text-white">{module.title}</h2>
          <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-widest">Status: {isLocked ? '🔒 Restrito' : '🔓 Acesso Total'}</p>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
          {module.lessons.map((lesson, idx) => (
            <button
              key={lesson.id}
              disabled={isLocked && lesson.isPremium}
              onClick={() => { setActiveLesson(lesson); setShowQuiz(false); }}
              className={`w-full text-left p-4 rounded-xl transition-all border ${activeLesson?.id === lesson.id && !showQuiz ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]' : 'border-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500'} ${(isLocked && lesson.isPremium) ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-600">{(idx + 1).toString().padStart(2, '0')}</span>
                <p className="text-[10px] font-black leading-tight truncate uppercase tracking-tighter">{lesson.title}</p>
              </div>
            </button>
          ))}
          <button
              onClick={() => startQuiz()}
              disabled={isLocked || loadingQuiz}
              className={`w-full text-left p-4 rounded-xl transition-all border ${showQuiz ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-600 dark:text-indigo-400' : 'border-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500'} ${isLocked ? 'opacity-30' : 'cursor-pointer'}`}
          >
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-600">🎓</span>
                <p className="text-[10px] font-black leading-tight truncate uppercase tracking-tighter">EXAME DE MAESTRIA (15 PERGUNTAS)</p>
              </div>
          </button>
        </div>
      </aside>

      <main ref={contentRef} onScroll={handleScroll} className="flex-1 relative overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] p-12 lg:p-24 custom-scrollbar">
        {loadingQuiz && (
           <div className="h-full flex flex-col items-center justify-center gap-10">
              <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.5em] animate-pulse">Sintetizando Desafio de 15 Perguntas...</p>
           </div>
        )}

        {!loadingQuiz && showQuiz && (
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8">
            {quizFinished ? (
              <div className="text-center space-y-12 glass p-20 rounded-[60px] border border-emerald-500/20 bg-emerald-500/5">
                <div className="text-8xl">🏆</div>
                <h3 className="text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">MAESTRIA ALCANÇADA</h3>
                <p className="text-2xl text-slate-500 dark:text-slate-400 font-medium">Você acertou <span className="text-emerald-600 dark:text-emerald-500 font-black">{quizScore} de 15</span> questões aprofundadas.</p>
                <div className="flex flex-col items-center gap-4">
                  <div className="px-8 py-3 bg-emerald-500 text-slate-950 font-black rounded-full text-xs uppercase tracking-widest">+1.000 XP ADICIONADO</div>
                  <button onClick={onClose} className="px-16 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black rounded-full hover:bg-emerald-500 transition-all uppercase tracking-widest text-xs shadow-2xl mt-6">FINALIZAR MÓDULO</button>
                </div>
              </div>
            ) : moduleQuizzes.length > 0 && (
              <div className="space-y-12">
                <header className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-8">
                  <div>
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em]">Exame de Maestria</span>
                    <h2 className="text-4xl font-black uppercase text-slate-900 dark:text-white tracking-tighter">Pergunta {currentQuizIndex + 1} de 15</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Score Atual</p>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-500">{quizScore}</p>
                  </div>
                </header>

                <div className="glass p-12 rounded-[48px] border border-slate-200 dark:border-white/5 space-y-10">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-relaxed">{moduleQuizzes[currentQuizIndex].question}</h3>
                  
                  <div className="space-y-4">
                    {moduleQuizzes[currentQuizIndex].options.map((opt, i) => (
                      <button
                        key={i}
                        disabled={showExplanation}
                        onClick={() => setSelectedOption(i)}
                        className={`w-full text-left p-6 rounded-2xl border transition-all font-bold text-sm ${selectedOption === i ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-white' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'} ${showExplanation && i === moduleQuizzes[currentQuizIndex].correctAnswer ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : ''} ${showExplanation && selectedOption === i && i !== moduleQuizzes[currentQuizIndex].correctAnswer ? 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400' : ''}`}
                      >
                        <span className="inline-block w-8 h-8 rounded-lg bg-slate-200 dark:bg-black/40 text-center leading-8 mr-4 text-xs font-black">{String.fromCharCode(65 + i)}</span>
                        {opt}
                      </button>
                    ))}
                  </div>

                  {!showExplanation ? (
                    <button 
                      onClick={handleAnswerQuiz}
                      disabled={selectedOption === null}
                      className={`w-full py-6 font-black rounded-2xl transition-all uppercase tracking-widest text-xs ${selectedOption !== null ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-emerald-500' : 'bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-slate-700 cursor-not-allowed'}`}
                    >
                      VALIDAR RESPOSTA
                    </button>
                  ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
                      <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl">
                        <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">Análise do Avaliador:</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium italic">"{moduleQuizzes[currentQuizIndex].explanation}"</p>
                      </div>
                      <button 
                        onClick={nextQuizQuestion}
                        className="w-full py-6 bg-emerald-500 text-slate-950 font-black rounded-2xl hover:bg-emerald-400 transition-all uppercase tracking-widest text-xs"
                      >
                        PRÓXIMA PERGUNTA →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {!loadingQuiz && !showQuiz && (
          <div className="max-w-5xl mx-auto space-y-16">
            {isLocked ? (
              <div className="h-full flex items-center justify-center text-center">
                <div className="max-w-xl space-y-10 p-16 glass rounded-[60px] border border-slate-200 dark:border-white/10">
                  <div className="text-8xl animate-pulse">💎</div>
                  <h3 className="text-5xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">CONTEÚDO DE <span className="text-indigo-600 dark:text-indigo-500">ALTA DENSIDADE</span></h3>
                  <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">Este tratado de 5000 palavras requer autorização de nível <b>Alpha Elite</b>.</p>
                  <button onClick={onUpgrade} className="px-16 py-6 bg-indigo-500 text-white font-black rounded-[24px] hover:bg-indigo-400 hover:scale-105 transition-all uppercase tracking-widest text-xs shadow-2xl shadow-indigo-500/30">Adquirir Licença Elite</button>
                </div>
              </div>
            ) : (
              <div className="max-w-5xl mx-auto space-y-16">
                <header className="space-y-8">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-8">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.5em]">Tratado Alpha // Módulo {module.id}</span>
                      <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none text-slate-900 dark:text-white">{activeLesson?.title}</h1>
                    </div>
                  </div>
                  
                  {!deepContent && !generating && (
                    <div className="p-16 glass rounded-[60px] border border-emerald-500/20 text-center space-y-8 bg-emerald-500/5">
                      <div className="flex justify-center gap-4 text-4xl">📚 🧪 💹</div>
                      <h4 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">PROTOCOLO DE GERAÇÃO ALPHA</h4>
                      <div className="max-w-2xl mx-auto p-6 bg-slate-50 dark:bg-black/40 rounded-3xl border border-slate-200 dark:border-white/5 text-left space-y-4">
                         <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed uppercase font-bold tracking-tight">
                            Este sistema utiliza os modelos Gemini 3 para sintetizar tratados de 5.000 palavras baseados em axiomas de Harvard e MIT. <br/><br/>
                            <b>CONFORMIDADE:</b> O conteúdo gerado é meramente ilustrativo, teórico e pedagógico. Não garantimos precisão de mercado em tempo real para tomada de decisão financeira.
                         </p>
                         <label className="flex items-center gap-3 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={acceptedRisk} 
                              onChange={() => setAcceptedRisk(!acceptedRisk)}
                              className="w-5 h-5 rounded border-emerald-500/50 bg-transparent text-emerald-500 focus:ring-emerald-500" 
                            />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 group-hover:text-emerald-400">Compreendo que este é um documento puramente teórico</span>
                         </label>
                      </div>
                      <button 
                        disabled={!acceptedRisk}
                        onClick={handleDeepDive}
                        className={`px-16 py-6 font-black rounded-[24px] transition-all uppercase tracking-[0.3em] text-xs shadow-2xl flex items-center gap-4 mx-auto ${acceptedRisk ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 hover:bg-emerald-400 shadow-emerald-500/30' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-700 cursor-not-allowed border border-slate-200 dark:border-white/5'}`}
                      >
                        🚀 INICIAR SÍNTESE DO TRATADO
                      </button>
                    </div>
                  )}
                </header>

                {generating && (
                  <div className="py-32 flex flex-col items-center gap-10 animate-in fade-in zoom-in-95">
                     <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
                     </div>
                     <p className="text-emerald-600 dark:text-emerald-500 font-black text-lg uppercase tracking-[0.4em] animate-pulse">Sincronizando Modelos de Harvard...</p>
                  </div>
                )}

                {deepContent && (
                  <article className="animate-in fade-in slide-in-from-bottom-12 duration-1000 relative">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden flex flex-wrap gap-20 p-20 select-none">
                       {Array.from({length: 20}).map((_, i) => (
                         <span key={i} className="text-8xl font-black uppercase -rotate-45 text-slate-900 dark:text-white">AI DATA THEORY</span>
                       ))}
                    </div>

                    <div className="glass p-12 md:p-24 rounded-[60px] border border-slate-200 dark:border-white/5 bg-white/[0.01] shadow-2xl font-serif text-xl leading-[1.8] text-slate-700 dark:text-slate-300 relative z-10">
                       <div className="mb-20 text-center space-y-4 border-b border-slate-200 dark:border-white/5 pb-10">
                          <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.8em]">SIMULAÇÃO TEÓRICA ALPHA // NÃO É RECOMENDAÇÃO</div>
                          <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white font-heading italic">Tese Acadêmica: {activeLesson?.title}</h2>
                       </div>

                       <div className="whitespace-pre-wrap prose dark:prose-invert prose-emerald max-w-none mathjax-render-area selection:bg-emerald-500 selection:text-slate-950">
                         {deepContent}
                       </div>
                       
                       <div className="mt-24 pt-12 border-t border-slate-200 dark:border-white/5 flex flex-col items-center gap-10">
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.5em]">Fim do Documento Teórico IA</p>
                          <button 
                            onClick={handleAdvance}
                            className="px-20 py-8 bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-black rounded-full hover:bg-emerald-500 transition-all uppercase tracking-[0.4em] text-xs shadow-2xl"
                          >
                            Próximo Tratado →
                          </button>
                       </div>
                    </div>
                  </article>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );

  return createPortal(content, document.body);
};
