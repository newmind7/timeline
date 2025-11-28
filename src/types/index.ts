export interface User {
  id: string;
  email: string;
}

// 事件分类
export type EventCategory = 'work' | 'life' | 'study' | 'health' | 'finance' | 'travel' | 'other';

export const EVENT_CATEGORIES: { value: EventCategory; label: string; icon: string; color: string }[] = [
  { value: 'work', label: '工作', icon: '💼', color: 'blue' },
  { value: 'life', label: '生活', icon: '🏠', color: 'green' },
  { value: 'study', label: '学习', icon: '📚', color: 'purple' },
  { value: 'health', label: '健康', icon: '💪', color: 'orange' },
  { value: 'finance', label: '财务', icon: '💰', color: 'yellow' },
  { value: 'travel', label: '旅行', icon: '✈️', color: 'cyan' },
  { value: 'other', label: '其他', icon: '📌', color: 'slate' },
];

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  date: string;
  color: string;
  progress: number;
  category?: EventCategory; // 事件分类
  tags?: string[];          // 自定义标签
  reminder?: boolean;       // 是否开启提醒
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
export type LayoutType = 'horizontal' | 'vertical' | 'calendar' | 'week' | 'kanban' | 'gantt' | 'list' | 'map' | '3d';

// 视图配置
export const VIEW_TYPES: { value: LayoutType; label: string; icon: string }[] = [
  { value: 'vertical', label: '时间轴', icon: '📋' },
  { value: 'horizontal', label: '横向轴', icon: '📊' },
  { value: 'calendar', label: '月历', icon: '📅' },
  { value: 'week', label: '周视图', icon: '🗓️' },
  { value: 'kanban', label: '看板', icon: '📌' },
  { value: 'gantt', label: '甘特图', icon: '📈' },
  { value: 'list', label: '列表', icon: '📝' },
  { value: 'map', label: '足迹', icon: '🗺️' },
  { value: '3d', label: '3D', icon: '🌌' },
];

// 事件优先级
export type EventPriority = 'high' | 'medium' | 'low';

export const PRIORITY_CONFIG: { value: EventPriority; label: string; icon: string; color: string }[] = [
  { value: 'high', label: '高', icon: '🔴', color: 'red' },
  { value: 'medium', label: '中', icon: '🟡', color: 'yellow' },
  { value: 'low', label: '低', icon: '🟢', color: 'green' },
];

// 事件模板类型
export interface EventTemplate {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  recurrence?: 'none' | 'yearly' | 'monthly' | 'weekly'; // 重复类型
  category: 'birthday' | 'anniversary' | 'goal' | 'holiday' | 'custom';
}

// 预设模板
export const PRESET_TEMPLATES: EventTemplate[] = [
  { id: 'birthday', name: '生日', icon: '🎂', color: 'pink', recurrence: 'yearly', category: 'birthday' },
  { id: 'anniversary', name: '纪念日', icon: '💕', color: 'red', recurrence: 'yearly', category: 'anniversary' },
  { id: 'work-goal', name: '工作目标', icon: '💼', color: 'blue', recurrence: 'none', category: 'goal' },
  { id: 'personal-goal', name: '个人目标', icon: '🎯', color: 'green', recurrence: 'none', category: 'goal' },
  { id: 'travel', name: '旅行计划', icon: '✈️', color: 'cyan', recurrence: 'none', category: 'custom' },
  { id: 'health', name: '健康目标', icon: '💪', color: 'orange', recurrence: 'none', category: 'goal' },
  { id: 'study', name: '学习计划', icon: '📚', color: 'purple', recurrence: 'none', category: 'goal' },
  { id: 'finance', name: '财务目标', icon: '💰', color: 'yellow', recurrence: 'none', category: 'goal' },
  { id: 'holiday', name: '节日', icon: '🎉', color: 'red', recurrence: 'yearly', category: 'holiday' },
  { id: 'custom', name: '自定义', icon: '📌', color: 'slate', recurrence: 'none', category: 'custom' },
];

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
