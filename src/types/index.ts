export interface User {
  id: string;
  email: string;
}

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  date: string;
  color: string;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  id: string;
  event_id: string;
  title: string;
  completed: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export type TimeScale = 'day' | 'week' | 'month' | 'quarter' | 'year';
export type LayoutType = 'horizontal' | 'vertical';
