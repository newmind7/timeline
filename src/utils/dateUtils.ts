import { TimeScale } from '../types';

export const formatDate = (date: string | Date, format: 'short' | 'long' = 'short'): string => {
  const d = new Date(date);
  if (format === 'short') {
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const getDateRange = (timeScale: TimeScale) => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (timeScale) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      start.setMonth(quarter * 3, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth((quarter + 1) * 3, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
};

export const isEventInRange = (eventDate: string, start: Date, end: Date): boolean => {
  const eDate = new Date(eventDate);
  return eDate >= start && eDate <= end;
};

export const daysUntil = (date: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(date);
  eventDate.setHours(0, 0, 0, 0);
  return Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const getEventStatus = (eventDate: string, progress: number): 'completed' | 'overdue' | 'upcoming' | 'today' => {
  if (progress === 100) return 'completed';

  const days = daysUntil(eventDate);
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  return 'upcoming';
};

export const getMonthDays = (timeScale: TimeScale): string[] => {
  const { start, end } = getDateRange(timeScale);
  const days: string[] = [];
  const current = new Date(start);

  while (current <= end) {
    days.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return days;
};
