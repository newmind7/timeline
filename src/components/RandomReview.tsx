import { useState, useEffect, useMemo } from 'react';
import { History, RefreshCw, Calendar, Clock, ChevronRight, Sparkles } from 'lucide-react';
import { Event, EVENT_CATEGORIES } from '../types';

interface RandomReviewProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
}

export default function RandomReview({ events, onSelectEvent }: RandomReviewProps) {
  const [mode, setMode] = useState<'today' | 'random'>('today');
  const [randomEvent, setRandomEvent] = useState<Event | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  // 获取"那年今日"的事件
  const onThisDayEvents = useMemo(() => {
    return events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.getMonth() + 1 === todayMonth && 
             eventDate.getDate() === todayDay &&
             eventDate.getFullYear() !== today.getFullYear();
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, todayMonth, todayDay]);

  // 获取已完成的历史事件（用于随机回顾）
  const completedEvents = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return events.filter(e => {
      const eventDate = new Date(e.date);
      return e.progress === 100 && eventDate < thirtyDaysAgo;
    });
  }, [events]);

  // 随机选择一个事件
  const pickRandomEvent = () => {
    if (completedEvents.length === 0) return;
    setIsRefreshing(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * completedEvents.length);
      setRandomEvent(completedEvents[randomIndex]);
      setIsRefreshing(false);
    }, 300);
  };

  // 初始化随机事件
  useEffect(() => {
    if (mode === 'random' && !randomEvent && completedEvents.length > 0) {
      pickRandomEvent();
    }
  }, [mode, completedEvents.length]);

  // 计算时间差
  const getTimeDiff = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const now = new Date();
    const diffYears = now.getFullYear() - eventDate.getFullYear();
    const diffMonths = now.getMonth() - eventDate.getMonth();
    const diffDays = Math.floor((now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffYears > 0) {
      return `${diffYears}年前`;
    } else if (diffMonths > 0) {
      return `${diffMonths}个月前`;
    } else {
      return `${diffDays}天前`;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  const renderEventCard = (event: Event, showTimeDiff = true) => {
    const cat = EVENT_CATEGORIES.find(c => c.value === event.category);
    return (
      <button
        key={event.id}
        onClick={() => onSelectEvent(event)}
        className="w-full p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-left hover:shadow-md transition-all group"
      >
        <div className="flex items-start gap-3">
          <div className="text-2xl">{cat?.icon || '📌'}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900 dark:text-white truncate">
                {event.title}
              </span>
              {showTimeDiff && (
                <span className="text-xs px-2 py-0.5 bg-amber-200/50 dark:bg-amber-800/50 text-amber-700 dark:text-amber-300 rounded-full whitespace-nowrap">
                  {getTimeDiff(event.date)}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(event.date)}
            </div>
            {event.description && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                {event.description}
              </p>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors flex-shrink-0" />
        </div>
      </button>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-4 h-4 text-amber-500" />
          时光回顾
        </h3>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
          <button
            onClick={() => setMode('today')}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              mode === 'today' 
                ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            那年今日
          </button>
          <button
            onClick={() => setMode('random')}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              mode === 'random' 
                ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            随机回顾
          </button>
        </div>
      </div>

      {mode === 'today' ? (
        <>
          {/* 那年今日 */}
          <div className="mb-3 text-center">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {todayMonth}月{todayDay}日
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500">
              看看往年的今天发生了什么
            </div>
          </div>

          {onThisDayEvents.length > 0 ? (
            <div className="space-y-2">
              {onThisDayEvents.map(event => renderEventCard(event))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Sparkles className="w-10 h-10 mx-auto mb-2 text-amber-300" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                往年的今天没有记录
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                继续记录，明年就能看到啦！
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* 随机回顾 */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              回忆一个历史时刻
            </div>
            <button
              onClick={pickRandomEvent}
              disabled={completedEvents.length === 0}
              className={`p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded transition-colors ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {randomEvent ? (
            renderEventCard(randomEvent)
          ) : completedEvents.length === 0 ? (
            <div className="text-center py-6">
              <History className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                还没有可回顾的历史事件
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                完成更多事件后再来回顾吧！
              </p>
            </div>
          ) : null}
        </>
      )}

      {/* 统计信息 */}
      {events.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
          <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
            <span>共 {events.length} 个事件</span>
            <span>{completedEvents.length} 个已完成</span>
          </div>
        </div>
      )}
    </div>
  );
}
