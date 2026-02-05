
import { Module, PlanType, Lesson } from './types.ts';

const generate15Lessons = (moduleId: string, moduleTitle: string, isPremium: boolean): Lesson[] => {
  const topics = [
    "Como o jogo começa", "Regras do sistema", "O que faz o preço mudar",
    "Equilíbrio: O ponto ideal", "Entendendo reações", "Impacto no seu futuro",
    "Exemplos da vida real", "Onde o sistema falha", "Novas tecnologias",
    "O papel do governo", "Contas sem medo", "Prevendo o amanhã",
    "Estratégia de mestre", "Protegendo o que é seu", "Resumo Alpha"
  ];

  return topics.map((topic, i) => ({
    id: `l${moduleId}-${i + 1}`,
    title: `${topic}`,
    type: i % 5 === 0 ? 'deep-dive' : i % 2 === 0 ? 'theory' : 'practical',
    duration: '15-20min',
    isPremium: isPremium || i > 2,
    content: `[SISTEMA MONEYLAB - CONTEÚDO SIMPLIFICADO]\n\nEste tópico sobre ${topic} foi preparado para ser direto ao ponto. \n\nClique no botão 'EXPANDIR VIA TERMINAL IA' abaixo para ver a explicação completa com exemplos divertidos e analogias fáceis que a nossa IA preparou para você.`
  }));
};

// Ajustando isPremium: Módulos 1 a 18 agora são gratuitos (isPremium: false)
export const MODULES: Module[] = [
  {
    id: 'm1',
    title: 'O Início: Como o Mundo Funciona',
    description: 'Entenda por que as coisas custam dinheiro e como as trocas acontecem.',
    objective: 'Aprender a base de tudo: por que não podemos ter tudo o que queremos.',
    application: 'Entender como o dinheiro circula no seu dia a dia.',
    icon: '🌍',
    isPremium: false,
    lessons: generate15Lessons('1', 'Introdução', false),
    quizzes: [{ id: 'q1-1', question: 'Por que a economia existe?', options: ['Porque o dinheiro é infinito', 'Porque os recursos são limitados', 'Para o governo mandar', 'Para as lojas ganharem'], correctAnswer: 1, explanation: 'Como os recursos são limitados e nossos desejos não, precisamos de economia para escolher bem.' }]
  },
  {
    id: 'm2',
    title: 'FPP: O Poder das Suas Escolhas',
    description: 'Aprenda a decidir o que produzir e o que você ganha ou perde em cada escolha.',
    objective: 'Dominar o conceito de que escolher uma coisa significa abrir mão de outra.',
    application: 'Melhorar suas decisões pessoais e de tempo.',
    icon: '⚖️',
    isPremium: false,
    lessons: generate15Lessons('2', 'Escolhas', false),
    quizzes: []
  },
  {
    id: 'm3',
    title: 'Matemática Amigável',
    description: 'A lógica dos números explicada de um jeito que qualquer um entende.',
    objective: 'Perder o medo das equações básicas da economia.',
    application: 'Calcular trocas e lucros simples.',
    icon: '🔢',
    isPremium: false,
    lessons: generate15Lessons('3', 'Matemática', false),
    quizzes: []
  },
  {
    id: 'm4',
    title: 'Oferta e Procura',
    description: 'Por que o preço do ingresso ou do jogo sobe e desce?',
    objective: 'Entender como os compradores e vendedores decidem o preço.',
    application: 'Saber a hora certa de comprar algo.',
    icon: '🛒',
    isPremium: false,
    lessons: generate15Lessons('4', 'Oferta e Procura', false),
    quizzes: []
  },
  {
    id: 'm5',
    title: 'Ganhando o Máximo (Otimização)',
    description: 'Como empresas decidem quanto produzir para não ter prejuízo.',
    objective: 'Entender o conceito de lucro máximo de forma visual.',
    application: 'Entender a lógica por trás de grandes negócios.',
    icon: '💰',
    isPremium: false,
    lessons: generate15Lessons('5', 'Lucro', false),
    quizzes: []
  },
  {
    id: 'm6',
    title: 'Elasticidade: O Povo Reage?',
    description: 'Se o preço subir, as pessoas param de comprar? Vamos descobrir.',
    objective: 'Entender a sensibilidade dos consumidores.',
    application: 'Analisar se um negócio é bom ou arriscado.',
    icon: '🎈',
    isPremium: false,
    lessons: generate15Lessons('6', 'Reações', false),
    quizzes: []
  },
  {
    id: 'm7',
    title: 'Dinheiro no Tempo (Juros)',
    description: 'O segredo para fazer o dinheiro trabalhar para você enquanto você dorme.',
    objective: 'Dominar os juros compostos da forma mais simples possível.',
    application: 'Começar a planejar sua independência financeira.',
    icon: '⏳',
    isPremium: false,
    lessons: generate15Lessons('7', 'Juros', false),
    quizzes: []
  },
  {
    id: 'm8',
    title: 'Desejos do Consumidor',
    description: 'O que faz a gente querer comprar uma marca e não outra?',
    objective: 'Entender a lógica da satisfação e do marketing.',
    application: 'Ser um consumidor mais consciente.',
    icon: '🛍️',
    isPremium: false,
    lessons: generate15Lessons('8', 'Desejos', false),
    quizzes: []
  },
  {
    id: 'm9',
    title: 'Por Dentro das Fábricas',
    description: 'Como as grandes marcas produzem em escala e reduzem custos.',
    objective: 'Entender como o mundo corporativo se organiza.',
    application: 'Ter visão de dono de empresa.',
    icon: '🏭',
    isPremium: false,
    lessons: generate15Lessons('9', 'Fábricas', false),
    quizzes: []
  },
  {
    id: 'm10',
    title: 'Monopólios e Competição',
    description: 'Por que algumas empresas dominam tudo e outras lutam para surpreender.',
    objective: 'Identificar quem manda no mercado.',
    application: 'Saber investir nas empresas certas.',
    icon: '👑',
    isPremium: false,
    lessons: generate15Lessons('10', 'Competição', false),
    quizzes: []
  },
  {
    id: 'm11',
    title: 'Quando as Coisas Dão Errado',
    description: 'Poluição, trânsito e outros problemas que o mercado nem sempre resolve.',
    objective: 'Entender as falhas do sistema e o papel das regras.',
    application: 'Ter uma visão crítica sobre sustentabilidade.',
    icon: '🛑',
    isPremium: false,
    lessons: generate15Lessons('11', 'Falhas', false),
    quizzes: []
  },
  {
    id: 'm12',
    title: 'A Riqueza do País (PIB)',
    description: 'Como a gente mede se o Brasil está indo bem ou mal.',
    objective: 'Aprender o que é o PIB sem complicação.',
    application: 'Entender o noticiário da TV.',
    icon: '🇧🇷',
    isPremium: false,
    lessons: generate15Lessons('12', 'PIB', false),
    quizzes: []
  },
  {
    id: 'm13',
    title: 'Inflação: O Vilão dos Preços',
    description: 'Por que o seu dinheiro comprava mais coisas no passado do que hoje.',
    objective: 'Entender a perda do poder de compra e como se proteger.',
    application: 'Aprender a guardar dinheiro de forma inteligente.',
    icon: '🎈',
    isPremium: false,
    lessons: generate15Lessons('13', 'Inflação', false),
    quizzes: []
  },
  {
    id: 'm14',
    title: 'Governo e Impostos',
    description: 'Para onde vai o seu dinheiro e como o governo mexe na economia.',
    objective: 'Entender juros (Selic) e gastos públicos.',
    application: 'Ser um cidadão que entende de política econômica.',
    icon: '🏛️',
    isPremium: false,
    lessons: generate15Lessons('14', 'Governo', false),
    quizzes: []
  },
  {
    id: 'm15',
    title: 'O Mundo Conectado',
    description: 'Dólar, importação e por que tudo o que acontece lá fora afeta você.',
    objective: 'Entender o comércio global e viagens.',
    application: 'Entender por que eletrônicos ficam caros ou baratos.',
    icon: '✈️',
    isPremium: false,
    lessons: generate15Lessons('15', 'Mundo', false),
    quizzes: []
  },
  {
    id: 'm16',
    title: 'Teoria dos Jogos',
    description: 'Aprenda a negociar e prever o que os outros vão fazer.',
    objective: 'Dominar a estratégia em negociações reais.',
    application: 'Usar a lógica para ganhar discussões ou acordos.',
    icon: '♟️',
    isPremium: false,
    lessons: generate15Lessons('16', 'Jogos', false),
    quizzes: []
  },
  {
    id: 'm17',
    title: 'Guia do Investidor Iniciante',
    description: 'Como sair do zero e começar a construir seu patrimônio.',
    objective: 'Aprender a diferença entre ativos e passivos.',
    application: 'Dar os primeiros passos nos investimentos.',
    icon: '🚀',
    isPremium: false,
    lessons: generate15Lessons('17', 'Investidor', false),
    quizzes: []
  },
  {
    id: 'm18',
    title: 'Dados e Previsões',
    description: 'Como usar planilhas e IA para tentar adivinhar o futuro do mercado.',
    objective: 'Aprender o básico de estatística aplicada.',
    application: 'Usar tecnologia para analisar investimentos.',
    icon: '📊',
    isPremium: false,
    lessons: generate15Lessons('18', 'Dados', false),
    quizzes: []
  },
  {
    id: 'm19',
    title: 'Seguros e Proteção',
    description: 'Como não perder tudo se algo der errado no mercado.',
    objective: 'Entender proteção de carteira e risco.',
    application: 'Ter segurança nos seus planos financeiros.',
    icon: '🛡️',
    isPremium: true,
    lessons: generate15Lessons('19', 'Proteção', true),
    quizzes: []
  },
  {
    id: 'm20',
    title: 'Cripto e o Futuro do Dinheiro',
    description: 'Bitcoin, Ethereum e por que o dinheiro digital veio para ficar.',
    objective: 'Entender a tecnologia por trás das criptomoedas.',
    application: 'Estar pronto para a nova economia digital.',
    icon: '₿',
    isPremium: true,
    lessons: generate15Lessons('20', 'Cripto', true),
    quizzes: []
  },
  {
    id: 'm21',
    title: 'Investindo em Ideias (Startups)',
    description: 'Como funciona o mundo das empresas que valem bilhões.',
    objective: 'Entender como nascem e crescem as gigantes de tecnologia.',
    application: 'Conhecer o mundo do empreendedorismo moderno.',
    icon: '🦄',
    isPremium: true,
    lessons: generate15Lessons('21', 'Startups', true),
    quizzes: []
  },
  {
    id: 'm22',
    title: 'Quanto Vale uma Empresa?',
    description: 'Aprenda a calcular o preço real de uma ação.',
    objective: 'Saber se uma ação está barata ou cara.',
    application: 'Escolher bons investimentos na Bolsa.',
    icon: '💎',
    isPremium: true,
    lessons: generate15Lessons('22', 'Valuation', true),
    quizzes: []
  },
  {
    id: 'm23',
    title: 'A Cabeça do Mercado',
    description: 'Por que as pessoas entram em pânico ou ficam eufóricas.',
    objective: 'Controlar suas emoções e entender o comportamento de massa.',
    application: 'Não cair em bolhas ou golpes financeiros.',
    icon: '🧠',
    isPremium: true,
    lessons: generate15Lessons('23', 'Psicologia', true),
    quizzes: []
  },
  {
    id: 'm24',
    title: 'Robôs Investidores',
    description: 'Como os algoritmos operam na bolsa de valores em milissegundos.',
    objective: 'Entender a tecnologia dos grandes bancos e fundos.',
    application: 'Conhecer as regras do jogo moderno.',
    icon: '🤖',
    isPremium: true,
    lessons: generate15Lessons('24', 'Robôs', true),
    quizzes: []
  },
  {
    id: 'm25',
    title: 'Legado e Liberdade',
    description: 'Como manter e crescer sua riqueza por gerações.',
    objective: 'Planejar o futuro a longo prazo.',
    application: 'Construir uma vida livre e segura.',
    icon: '🏰',
    isPremium: true,
    lessons: generate15Lessons('25', 'Liberdade', true),
    quizzes: []
  }
];

export const PLANS = [
  {
    type: PlanType.FREE,
    name: 'Explorador',
    price: '0',
    features: [
      'Acesso a 18 Módulos',
      'XP e Níveis',
      'Acesso a 10 notícias',
      'Simulador de Juros'
    ],
    buttonText: 'Começar Agora',
    color: 'bg-slate-900 text-white'
  },
  {
    type: PlanType.PRO,
    name: 'Pro Trader',
    price: '29,90',
    features: [
      'Todos os módulos',
      'IA Nexus ALPHA liberada',
      '+50 notícias'
    ],
    buttonText: 'Subir de Nível',
    color: 'bg-emerald-500 text-slate-950',
    popular: true
  },
  {
    type: PlanType.ELITE,
    name: 'Alpha Elite',
    price: '57,40',
    features: [
      'Plano Família',
      'Badge Elite no Ranking',
      '+100 notícias',
      'Inclui tudo do plano PRO'
    ],
    buttonText: 'Ser Alpha Elite',
    color: 'bg-indigo-500 text-white'
  }
];
