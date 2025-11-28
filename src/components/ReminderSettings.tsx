import { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, Check, X, Plus, Trash2 } from 'lucide-react';
import { Event } from '../types';

interface Reminder {
  id: string;
  eventId: string;
  time: string; // '1h', '1d', '1w', 'custom'
  customMinutes?: number;
  enabled: boolean;
  notified: boolean;
}

interface ReminderSettingsProps {
  event: Event;
  onUpdate: (reminders: Reminder[]) => void;
}

const PRESET_TIMES = [
  { id: '15m', label: '15分钟前', minutes: 15 },
  { id: '30m', label: '30分钟前', minutes: 30 },
  { id: '1h', label: '1小时前', minutes: 60 },
  { id: '2h', label: '2小时前', minutes: 120 },
  { id: '1d', label: '1天前', minutes: 1440 },
  { id: '2d', label: '2天前', minutes: 2880 },
  { id: '1w', label: '1周前', minutes: 10080 },
];

export default function ReminderSettings({ event, onUpdate }: ReminderSettingsProps) {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem(`reminders_${event.id}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [isAdding, setIsAdding] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(60);

  useEffect(() => {
    localStorage.setItem(`reminders_${event.id}`, JSON.stringify(reminders));
    onUpdate(reminders);
  }, [reminders, event.id, onUpdate]);

  const addReminder = (time: string, minutes: number) => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      eventId: event.id,
      time,
      customMinutes: time === 'custom' ? minutes : undefined,
      enabled: true,
      notified: false,
    };
    setReminders(prev => [...prev, newReminder]);
    setIsAdding(false);
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const getReminderLabel = (reminder: Reminder) => {
    if (reminder.time === 'custom') {
      const mins = reminder.customMinutes || 0;
      if (mins < 60) return `${mins}分钟前`;
      if (mins < 1440) return `${Math.floor(mins / 60)}小时前`;
      return `${Math.floor(mins / 1440)}天前`;
    }
    return PRESET_TIMES.find(t => t.id === reminder.time)?.label || reminder.time;
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Bell className="w-4 h-4 text-amber-500" />
          提醒设置
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          添加提醒
        </button>
      </div>

      {/* 已有提醒 */}
      {reminders.length > 0 ? (
        <div className="space-y-2 mb-3">
          {reminders.map(reminder => (
            <div
              key={reminder.id}
              className={`flex items-center gap-2 p-2 rounded-lg ${
                reminder.enabled 
                  ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' 
                  : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 opacity-60'
              }`}
            >
              <button
                onClick={() => toggleReminder(reminder.id)}
                className={`p-1 rounded ${reminder.enabled ? 'text-amber-500' : 'text-slate-400'}`}
              >
                {reminder.enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">
                {getReminderLabel(reminder)}
              </span>
              {reminder.notified && (
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <Check className="w-3 h-3" /> 已提醒
                </span>
              )}
              <button
                onClick={() => deleteReminder(reminder.id)}
                className="p-1 text-red-400 hover:text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 text-center py-2 mb-3">暂无提醒</p>
      )}

      {/* 添加提醒 */}
      {isAdding && (
        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-3">
          <p className="text-xs text-slate-500 mb-2">选择提醒时间</p>
          
          {/* 预设选项 */}
          <div className="flex flex-wrap gap-1">
            {PRESET_TIMES.map(preset => (
              <button
                key={preset.id}
                onClick={() => addReminder(preset.id, preset.minutes)}
                className="px-2 py-1 text-xs bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* 自定义时间 */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(Number(e.target.value))}
              min={1}
              max={10080}
              className="w-20 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700"
            />
            <span className="text-xs text-slate-500">分钟前</span>
            <button
              onClick={() => addReminder('custom', customMinutes)}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              添加
            </button>
          </div>

          <button
            onClick={() => setIsAdding(false)}
            className="w-full py-1 text-xs text-slate-500 hover:text-slate-700"
          >
            取消
          </button>
        </div>
      )}
    </div>
  );
}

// 检查并发送提醒的Hook
export function useReminders(events: Event[]) {
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      
      events.forEach(event => {
        const saved = localStorage.getItem(`reminders_${event.id}`);
        if (!saved) return;
        
        const reminders: Reminder[] = JSON.parse(saved);
        const eventDate = new Date(event.date);
        
        reminders.forEach(reminder => {
          if (!reminder.enabled || reminder.notified) return;
          
          const preset = PRESET_TIMES.find(t => t.id === reminder.time);
          const minutesBefore = preset?.minutes || reminder.customMinutes || 0;
          const reminderTime = new Date(eventDate.getTime() - minutesBefore * 60 * 1000);
          
          if (now >= reminderTime && now < eventDate) {
            // 发送通知
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`⏰ 提醒: ${event.title}`, {
                body: `距离事件开始还有 ${Math.ceil((eventDate.getTime() - now.getTime()) / 60000)} 分钟`,
                icon: '/favicon.ico',
                tag: `reminder-${reminder.id}`,
              });
            }
            
            // 标记已提醒
            const updatedReminders = reminders.map(r => 
              r.id === reminder.id ? { ...r, notified: true } : r
            );
            localStorage.setItem(`reminders_${event.id}`, JSON.stringify(updatedReminders));
          }
        });
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000); // 每分钟检查
    
    return () => clearInterval(interval);
  }, [events]);
}
