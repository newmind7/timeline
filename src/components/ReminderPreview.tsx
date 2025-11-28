import { useState, useEffect, useMemo } from 'react';
import { Bell, Clock, AlertTriangle, ChevronRight, Calendar, X, Check } from 'lucide-react';
import { Event } from '../types';

interface Reminder {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  reminderTime: string;
  minutesBefore: number;
}

interface ReminderPreviewProps {
  events: Event[];
  onEventClick?: (eventId: string) => void;
}

export default function ReminderPreview({ events, onEventClick }: ReminderPreviewProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('dismissedReminders');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('dismissedReminders', JSON.stringify(dismissedIds));
  }, [dismissedIds]);

  // 获取未来24小时内的提醒
  const upcomingReminders = useMemo(() => {
    const reminders: Reminder[] = [];
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    events.forEach(event => {
      if (event.progress === 100) return;

      const eventDate = new Date(event.date);
      if (eventDate < now) return;

      // 检查localStorage中的提醒设置
      const savedReminders = localStorage.getItem(`reminders_${event.id}`);
      if (savedReminders) {
        const reminderMinutes: number[] = JSON.parse(savedReminders);
        reminderMinutes.forEach(minutes => {
          const reminderTime = new Date(eventDate.getTime() - minutes * 60 * 1000);
          if (reminderTime > now && reminderTime < tomorrow) {
            reminders.push({
              eventId: event.id,
              eventTitle: event.title,
              eventDate: event.date,
              reminderTime: reminderTime.toISOString(),
              minutesBefore: minutes,
            });
          }
        });
      } else if (event.reminder) {
        // 默认提前1小时提醒
        const reminderTime = new Date(eventDate.getTime() - 60 * 60 * 1000);
        if (reminderTime > now && reminderTime < tomorrow) {
          reminders.push({
            eventId: event.id,
            eventTitle: event.title,
            eventDate: event.date,
            reminderTime: reminderTime.toISOString(),
            minutesBefore: 60,
          });
        }
      }
    });

    return reminders
      .filter(r => !dismissedIds.includes(`${r.eventId}_${r.minutesBefore}`))
      .sort((a, b) => new Date(a.reminderTime).getTime() - new Date(b.reminderTime).getTime());
  }, [events, dismissedIds]);

  const formatTimeUntil = (reminderTime: string) => {
    const diff = new Date(reminderTime).getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}小时${minutes}分钟后`;
    }
    return `${minutes}分钟后`;
  };

  const formatMinutesBefore = (minutes: number) => {
    if (minutes >= 1440) return `${Math.floor(minutes / 1440)}天前`;
    if (minutes >= 60) return `${Math.floor(minutes / 60)}小时前`;
    return `${minutes}分钟前`;
  };

  const dismissReminder = (eventId: string, minutesBefore: number) => {
    setDismissedIds(prev => [...prev, `${eventId}_${minutesBefore}`]);
  };

  if (upcomingReminders.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-orange-500" />
          提醒预览
        </h3>
        <div className="text-center py-4 text-slate-400">
          <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">24小时内无提醒</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-orange-500" />
          提醒预览
        </h3>
        <span className="px-2 py-0.5 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
          {upcomingReminders.length} 个
        </span>
      </div>

      <div className="space-y-2 max-h-[250px] overflow-y-auto">
        {upcomingReminders.map((reminder, index) => {
          const isUrgent = new Date(reminder.reminderTime).getTime() - Date.now() < 60 * 60 * 1000;
          
          return (
            <div
              key={`${reminder.eventId}_${reminder.minutesBefore}_${index}`}
              className={`p-3 rounded-lg border transition-all ${
                isUrgent
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                  : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {isUrgent && <AlertTriangle className="w-3 h-3 text-orange-500" />}
                    <span className={`text-sm font-medium truncate ${
                      isUrgent ? 'text-orange-700 dark:text-orange-400' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {reminder.eventTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeUntil(reminder.reminderTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      提前{formatMinutesBefore(reminder.minutesBefore)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onEventClick?.(reminder.eventId)}
                    className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                    title="查看事件"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => dismissReminder(reminder.eventId, reminder.minutesBefore)}
                    className="p-1 text-slate-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
                    title="忽略此提醒"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
