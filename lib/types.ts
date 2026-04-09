export type TaskStatus = 'todo' | 'in-progress' | 'completed';
export type TaskDomain = 'dsa' | 'system-design' | 'frontend' | 'backend';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  domain: TaskDomain;
  dueDate?: string;
  createdAt: string;
}

export interface DSAQuestion {
  id: string;
  title: string;
  problemStatement: string;
  difficulty: Difficulty;
  strategy: string;
  codeImplementation: string;
  language: string;
  tags: string[];
  createdAt: string;
}

export interface SystemDesignNote {
  id: string;
  title: string;
  content: string;
  diagrams?: string[];
  references?: Array<{ title: string; url: string }>;
  createdAt: string;
}

export interface DashboardStats {
  activeSprints: number;
  verifiedTasks: number;
  dsaProblemsCompleted: number;
  systemDesignNotes: number;
}
