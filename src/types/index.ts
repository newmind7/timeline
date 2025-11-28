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

// 复盘记录类型
export interface DailyReview {
  id: string;
  user_id: string;
  date: string;
  successes: string[];  // 成功点
  failures: string[];   // 失败点
  improvements: string[]; // 明日改进
  rating: number;       // 评分 1-5
  notes?: string;       // 额外备注
  created_at: string;
  updated_at: string;
}
