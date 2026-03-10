export interface User {
  id: number;
  email: string;
  username: string;
  role: 'user' | 'admin';
  credits: number;
  created_at?: string;
}

export interface HistoryItem {
  id: number;
  user_id: number;
  question: string;
  solution: string;
  type: 'text' | 'image';
  created_at: string;
}

export interface Formula {
  name: string;
  formula: string;
  description: string;
}

export interface LeaderboardUser {
  username: string;
  solves: number;
}

export interface AdminStats {
  totalUsers: number;
  totalSolves: number;
  recentSolves: any[];
}
