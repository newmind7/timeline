import { useState, useMemo } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react';
import { Event } from '../types';

interface WeekPlanProps {
  events: Event[];
  onAddEvent?: (date: string) => void;
  onEventClick?: (event: Event) => void;
}

export default function WeekPlan({ events, onAddEvent, onEventClick }: WeekPlanProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekData = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset + (weekOffset * 7));
    monday.setHours(0, 0, 0, 0);

    const days: { date: Date; dateStr: string; events: Event[]; isToday: boolean }[] = [];
    const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayEvents = events.filter(e => e.date.startsWith(dateStr));
      const isToday = dateStr === now.toISOString().split('T')[0];

      days.push({
        date,
        dateStr,
        events: dayEvents,
        isToday,
      });
    }

    const weekStart = monday.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    const weekEnd = days[6].date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });

    return { days, dayNames, weekStart, weekEnd };
  }, [events, weekOffset]);

  const getEventStatusColor = (event: Event) => {
    if (event.progress === 100) return 'bg-green-500';
    const eventDate = new Date(event.date);
    if (eventDate < new Date()) return 'bg-red-500';
    return 'bg-blue-500';
  };

  const totalWeekEvents = weekData.days.reduce((sum, d) => sum + d.events.length, 0);
  const completedWeekEvents = weekData.days.reduce(
    (sum, d) => sum + d.events.filter(e => e.progress === 100).length, 
    0
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-violet-500" />
          周计划
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className={`px-2 py-0.5 text-xs rounded ${
              weekOffset === 0 
                ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            本周
          </button>
          <button
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* 周范围和统计 */}
      <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
        <span>{weekData.weekStart} - {weekData.weekEnd}</span>
        <span>{completedWeekEvents}/{totalWeekEvents} 完成</span>
      </div>

      {/* 周视图 */}
      <div className="grid grid-cols-7 gap-1">
        {/* 星期头 */}
        {weekData.dayNames.map((name, index) => (
          <div 
            key={name} 
            className={`text-center text-[10px] py-1 ${
              index >= 5 ? 'text-orange-500' : 'text-slate-500'
            }`}
          >
            {name}
          </div>
        ))}

        {/* 日期格子 */}
        {weekData.days.map((day, index) => (
          <div
            key={day.dateStr}
            className={`relative min-h-[80px] p-1 rounded-lg border ${
              day.isToday
                ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            {/* 日期 */}
            <div className={`text-center text-xs font-medium mb-1 ${
              day.isToday 
                ? 'text-violet-600 dark:text-violet-400' 
                : index >= 5 
                  ? 'text-orange-500' 
                  : 'text-slate-600 dark:text-slate-400'
            }`}>
              {day.date.getDate()}
            </div>

            {/* 事件点 */}
            <div className="space-y-0.5">
              {day.events.slice(0, 3).map(event => (
                <div
                  key={event.id}
                  onClick={() => onEventClick?.(event)}
                  className={`flex items-center gap-1 px-1 py-0.5 rounded text-[10px] cursor-pointer truncate ${
                    event.progress === 100
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                  }`}
                  title={event.title}
                >
                  {event.progress === 100 && <Check className="w-2 h-2" />}
                  <span className="truncate">{event.title}</span>
                </div>
              ))}
              {day.events.length > 3 && (
                <div className="text-[10px] text-slate-400 text-center">
                  +{day.events.length - 3}
                </div>
              )}
            </div>

            {/* 添加按钮 */}
            {day.events.length === 0 && (
              <button
                onClick={() => onAddEvent?.(day.dateStr)}
                className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-slate-50/80 dark:bg-slate-700/80 rounded-lg transition-opacity"
              >
                <Plus className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 周进度 */}
      {totalWeekEvents > 0 && (
        <div className="mt-3">
          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all"
              style={{ width: `${(completedWeekEvents / totalWeekEvents) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
