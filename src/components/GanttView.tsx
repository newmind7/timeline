import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { Event, EVENT_CATEGORIES } from '../types';
import { getEventStatus } from '../utils/dateUtils';

interface GanttViewProps {
  events: Event[];
  onEditEvent: (event: Event) => void;
}

export default function GanttView({ events, onEditEvent }: GanttViewProps) {
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() - 7); // 从一周前开始
    return today;
  });

  const daysToShow = 30; // 显示30天

  // 生成日期范围
  const dateRange = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [startDate]);

  // 按日期排序事件
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  // 判断是否为今天
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  // 判断是否为周末
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  // 获取事件在甘特图中的位置
  const getEventPosition = (eventDate: string) => {
    const eventD = new Date(eventDate);
    const startD = new Date(startDate);
    const diffTime = eventD.getTime() - startD.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 获取事件颜色
  const getEventBarColor = (event: Event) => {
    const status = getEventStatus(event.date, event.progress);
    switch (status) {
      case 'completed': return 'bg-blue-500';
      case 'overdue': return 'bg-red-500';
      case 'today': return 'bg-amber-500';
      default: return 'bg-green-500';
    }
  };

  const navigatePrev = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() - 7);
    setStartDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + 7);
    setStartDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    today.setDate(today.getDate() - 7);
    setStartDate(today);
  };

  const formatMonthDay = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatWeekday = (date: Date) => {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return days[date.getDay()];
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
      {/* 头部控制 */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">甘特图视图</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300"
          >
            今天
          </button>
          <button
            onClick={navigatePrev}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={navigateNext}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* 日期头部 */}
          <div className="flex border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
            {/* 事件名称列 */}
            <div className="w-48 flex-shrink-0 p-3 border-r border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300">
              事件
            </div>
            {/* 日期列 */}
            <div className="flex flex-1">
              {dateRange.map((date, index) => (
                <div
                  key={index}
                  className={`flex-1 min-w-[30px] text-center py-2 border-r border-slate-100 dark:border-slate-700 ${
                    isToday(date) ? 'bg-blue-50 dark:bg-blue-900/30' :
                    isWeekend(date) ? 'bg-slate-50 dark:bg-slate-700/50' : ''
                  }`}
                >
                  <div className={`text-xs font-medium ${
                    isToday(date) ? 'text-blue-600 dark:text-blue-400' :
                    isWeekend(date) ? 'text-red-500 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {formatWeekday(date)}
                  </div>
                  <div className={`text-xs ${
                    isToday(date) ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-500'
                  }`}>
                    {formatMonthDay(date)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 事件行 */}
          {sortedEvents.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              暂无事件
            </div>
          ) : (
            sortedEvents.map(event => {
              const position = getEventPosition(event.date);
              const cat = EVENT_CATEGORIES.find(c => c.value === event.category);
              const isVisible = position >= 0 && position < daysToShow;

              return (
                <div
                  key={event.id}
                  className="flex border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 group"
                >
                  {/* 事件名称 */}
                  <div className="w-48 flex-shrink-0 p-3 border-r border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <span className="text-sm">{cat?.icon}</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate flex-1">
                      {event.title}
                    </span>
                    <button
                      onClick={() => onEditEvent(event)}
                      className="p-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 甘特条 */}
                  <div className="flex flex-1 relative">
                    {dateRange.map((date, index) => (
                      <div
                        key={index}
                        className={`flex-1 min-w-[30px] border-r border-slate-50 dark:border-slate-700/50 ${
                          isToday(date) ? 'bg-blue-50/50 dark:bg-blue-900/20' :
                          isWeekend(date) ? 'bg-slate-50/50 dark:bg-slate-700/30' : ''
                        }`}
                      />
                    ))}
                    
                    {/* 事件条 */}
                    {isVisible && (
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 h-6 rounded-full ${getEventBarColor(event)} flex items-center px-2 cursor-pointer hover:opacity-80 transition-opacity shadow-sm`}
                        style={{
                          left: `calc(${(position / daysToShow) * 100}% + 2px)`,
                          width: `calc(${(1 / daysToShow) * 100}% - 4px)`,
                          minWidth: '60px',
                        }}
                        onClick={() => onEditEvent(event)}
                        title={`${event.title} - ${event.progress}%`}
                      >
                        <span className="text-xs text-white truncate font-medium">
                          {event.progress}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 图例 */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-slate-600 dark:text-slate-400">即将到来</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-slate-600 dark:text-slate-400">今天</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-slate-600 dark:text-slate-400">已逾期</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-slate-600 dark:text-slate-400">已完成</span>
        </div>
      </div>
    </div>
  );
}
