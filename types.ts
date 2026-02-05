
export enum PlanType {
  FREE = 'FREE',
  PRO = 'PRO',
  ELITE = 'ELITE'
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  category: 'Economia' | 'Tecnologia' | 'IA' | 'Mercado' | 'Brasil' | 'Internacional';
  region: 'BR' | 'INT';
  timestamp: string;
  url: string;
  summary: string;
  aiInsight: string;
  marketImpact: 'Alto' | 'Médio' | 'Baixo';
  isHot?: boolean;
}

export interface UserStats {
  dailyXP: number[];
  achievements: { id: string; name: string; icon: string; date: string }[];
  streak: number;
  totalTimeStudy: number;
  lastClaimedAt: string | null;
  lastActivityDate: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  bio?: string;
  plan: PlanType;
  level: number;
  xp: number;
  xpNextLevel: number;
  stats: UserStats;
  joinedAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'theory' | 'practical' | 'deep-dive';
  duration: string;
  isPremium: boolean;
  content: string;
}

export interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  objective: string;
  application: string;
  icon: string;
  isPremium: boolean;
  lessons: Lesson[];
  quizzes: Quiz[];
}

export type Page = 'landing' | 'login' | 'register' | 'dashboard' | 'course' | 'simulators' | 'pricing' | 'settings' | 'news' | 'terminal';
