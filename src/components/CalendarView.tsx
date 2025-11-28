import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Event, EVENT_CATEGORIES } from '../types';
import { getEventStatus } from '../utils/dateUtils';

interface CalendarViewProps {
  events: Event[];
  onEditEvent: (event: Event) => void;
  onAddEvent?: () => void;
}

export default function CalendarView({ events, onEditEvent, onAddEvent }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // 获取当月信息
  const { year, month, daysInMonth, firstDayOfWeek, weeks } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();

    // 生成日历格子
    const weeks: (number | null)[][] = [];
    let week: (number | null)[] = [];
    
    // 填充月初空白
    for (let i = 0; i < firstDayOfWeek; i++) {
      week.push(null);
    }
    
    // 填充日期
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    
    // 填充月末空白
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      weeks.push(week);
    }

    return { year, month, daysInMonth, firstDayOfWeek, weeks };
  }, [currentDate]);

  // 获取某天的事件
  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date.startsWith(dateStr));
  };

  // 判断是否为今天
  const isToday = (day: number) => {
    const today = new Date();
    return (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    );
  };

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 获取事件颜色
  const getEventColor = (event: Event) => {
    const status = getEventStatus(event.date, event.progress);
    switch (status) {
      case 'completed': return 'bg-blue-500';
      case 'overdue': return 'bg-red-500';
      case 'today': return 'bg-amber-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {year}年 {monthNames[month]}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300"
          >
            今天
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
        {weekDays.map((day, i) => (
          <div
            key={day}
            className={`py-3 text-center text-sm font-medium ${
              i === 0 || i === 6 
                ? 'text-red-500 dark:text-red-400' 
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日历格子 */}
      <div className="grid grid-cols-7">
        {weeks.map((week, weekIndex) =>
          week.map((day, dayIndex) => {
            const dayEvents = day ? getEventsForDay(day) : [];
            const isCurrentDay = day && isToday(day);
            
            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`min-h-[100px] border-b border-r border-slate-200 dark:border-slate-700 p-1 ${
                  day ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-900'
                } ${dayIndex === 6 ? 'border-r-0' : ''}`}
              >
                {day && (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 text-sm rounded-full ${
                          isCurrentDay
                            ? 'bg-blue-600 text-white font-bold'
                            : dayIndex === 0 || dayIndex === 6
                            ? 'text-red-500 dark:text-red-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {day}
                      </span>
                      {onAddEvent && (
                        <button
                          onClick={onAddEvent}
                          className="p-1 opacity-0 hover:opacity-100 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => {
                        const cat = EVENT_CATEGORIES.find(c => c.value === event.category);
                        return (
                          <button
                            key={event.id}
                            onClick={() => onEditEvent(event)}
                            className={`w-full text-left text-xs px-1.5 py-0.5 rounded truncate text-white ${getEventColor(event)} hover:opacity-80 transition-opacity`}
                            title={event.title}
                          >
                            {cat?.icon} {event.title}
                          </button>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 pl-1">
                          +{dayEvents.length - 3} 更多
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
