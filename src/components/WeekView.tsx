import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Edit2, Clock } from 'lucide-react';
import { Event, EVENT_CATEGORIES } from '../types';
import { getEventStatus } from '../utils/dateUtils';

interface WeekViewProps {
  events: Event[];
  onEditEvent: (event: Event) => void;
  onAddEvent?: () => void;
}

export default function WeekView({ events, onEditEvent, onAddEvent }: WeekViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // 获取本周的日期范围
  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day); // 调整到周日

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentDate]);

  // 时间段（每2小时一个时间段）
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let hour = 0; hour < 24; hour += 2) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }, []);

  // 获取某天的事件
  const getEventsForDay = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return events.filter(e => e.date.startsWith(dateStr));
  };

  // 判断是否为今天
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

  const goToPrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 获取事件颜色
  const getEventBgColor = (event: Event) => {
    const status = getEventStatus(event.date, event.progress);
    switch (status) {
      case 'completed': return 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/50 dark:border-blue-700 dark:text-blue-300';
      case 'overdue': return 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300';
      case 'today': return 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/50 dark:border-amber-700 dark:text-amber-300';
      default: return 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/50 dark:border-green-700 dark:text-green-300';
    }
  };

  // 格式化周范围标题
  const weekTitle = useMemo(() => {
    const start = weekDates[0];
    const end = weekDates[6];
    if (start.getMonth() === end.getMonth()) {
      return `${start.getFullYear()}年${months[start.getMonth()]} ${start.getDate()}日 - ${end.getDate()}日`;
    }
    return `${months[start.getMonth()]}${start.getDate()}日 - ${months[end.getMonth()]}${end.getDate()}日`;
  }, [weekDates]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {weekTitle}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300"
          >
            本周
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevWeek}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={goToNextWeek}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* 日期头部 */}
      <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-700">
        <div className="p-3 text-center text-sm font-medium text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700">
          <Clock className="w-4 h-4 mx-auto" />
        </div>
        {weekDates.map((date, index) => (
          <div
            key={index}
            className={`p-3 text-center border-r border-slate-200 dark:border-slate-700 last:border-r-0 ${
              isToday(date) ? 'bg-blue-50 dark:bg-blue-900/30' : ''
            }`}
          >
            <div className={`text-xs font-medium ${
              index === 0 || index === 6 
                ? 'text-red-500 dark:text-red-400' 
                : 'text-slate-500 dark:text-slate-400'
            }`}>
              {weekDays[index]}
            </div>
            <div className={`text-lg font-bold mt-1 ${
              isToday(date) 
                ? 'w-8 h-8 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center'
                : 'text-slate-900 dark:text-white'
            }`}>
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* 全天事件区域 */}
      <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-700 min-h-[60px]">
        <div className="p-2 text-xs text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 flex items-center justify-center">
          全天
        </div>
        {weekDates.map((date, index) => {
          const dayEvents = getEventsForDay(date);
          return (
            <div
              key={index}
              className={`p-1 border-r border-slate-200 dark:border-slate-700 last:border-r-0 ${
                isToday(date) ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => {
                  const cat = EVENT_CATEGORIES.find(c => c.value === event.category);
                  return (
                    <button
                      key={event.id}
                      onClick={() => onEditEvent(event)}
                      className={`w-full text-left text-xs px-1.5 py-1 rounded border truncate ${getEventBgColor(event)} hover:opacity-80 transition-opacity`}
                      title={event.title}
                    >
                      {cat?.icon} {event.title}
                    </button>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    +{dayEvents.length - 3}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 时间网格 */}
      <div className="max-h-[400px] overflow-y-auto">
        {timeSlots.map((time, timeIndex) => (
          <div
            key={time}
            className="grid grid-cols-8 border-b border-slate-100 dark:border-slate-700/50 min-h-[40px]"
          >
            <div className="p-2 text-xs text-slate-400 dark:text-slate-500 border-r border-slate-200 dark:border-slate-700 flex items-start justify-center">
              {time}
            </div>
            {weekDates.map((date, dayIndex) => (
              <div
                key={dayIndex}
                className={`border-r border-slate-100 dark:border-slate-700/50 last:border-r-0 ${
                  isToday(date) ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                } hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer`}
                onClick={onAddEvent}
              />
            ))}
          </div>
        ))}
      </div>

      {/* 图例 */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-200 border border-green-400" />
          <span className="text-slate-600 dark:text-slate-400">即将到来</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-200 border border-amber-400" />
          <span className="text-slate-600 dark:text-slate-400">今天</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-200 border border-red-400" />
          <span className="text-slate-600 dark:text-slate-400">已逾期</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-200 border border-blue-400" />
          <span className="text-slate-600 dark:text-slate-400">已完成</span>
        </div>
      </div>
    </div>
  );
}
