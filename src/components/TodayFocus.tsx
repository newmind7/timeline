import { useMemo } from 'react';
import { Zap, Clock, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Event, EVENT_CATEGORIES } from '../types';
import { getEventStatus } from '../utils/dateUtils';

interface TodayFocusProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
}

export default function TodayFocus({ events, onSelectEvent }: TodayFocusProps) {
  const today = new Date().toISOString().split('T')[0];

  // 获取今日事件
  const todayEvents = useMemo(() => {
    return events
      .filter(e => e.date.startsWith(today))
      .sort((a, b) => a.progress - b.progress);
  }, [events, today]);

  // 获取紧急事件（未完成且今天或已逾期）
  const urgentEvents = useMemo(() => {
    return events
      .filter(e => {
        const status = getEventStatus(e.date, e.progress);
        return status === 'overdue' || status === 'today';
      })
      .filter(e => e.progress < 100)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [events]);

  // 计算今日进度
  const todayProgress = useMemo(() => {
    if (todayEvents.length === 0) return 0;
    const completed = todayEvents.filter(e => e.progress === 100).length;
    return Math.round((completed / todayEvents.length) * 100);
  }, [todayEvents]);

  // 获取下一个待完成事件
  const nextTask = useMemo(() => {
    return todayEvents.find(e => e.progress < 100) || urgentEvents[0];
  }, [todayEvents, urgentEvents]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const getDaysOverdue = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-yellow-500" />
        <h3 className="font-semibold text-slate-900 dark:text-white">今日焦点</h3>
        {todayEvents.length > 0 && (
          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
            {todayEvents.filter(e => e.progress === 100).length}/{todayEvents.length}
          </span>
        )}
      </div>

      {/* 今日进度 */}
      {todayEvents.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500 dark:text-slate-400">今日进度</span>
            <span className={`font-medium ${todayProgress === 100 ? 'text-green-600' : 'text-slate-700 dark:text-slate-300'}`}>
              {todayProgress}%
            </span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${todayProgress === 100 ? 'bg-green-500' : 'bg-yellow-500'}`}
              style={{ width: `${todayProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 下一个任务 */}
      {nextTask && (
        <div className="mb-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">下一个任务</div>
          <button
            onClick={() => onSelectEvent(nextTask)}
            className="w-full p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-left hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {EVENT_CATEGORIES.find(c => c.value === nextTask.category)?.icon || '📌'}
                </span>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">{nextTask.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {nextTask.progress}% 完成
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-yellow-600 transition-colors" />
            </div>
          </button>
        </div>
      )}

      {/* 紧急事件 */}
      {urgentEvents.length > 0 && (
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            需要关注
          </div>
          <div className="space-y-2">
            {urgentEvents.map(event => {
              const status = getEventStatus(event.date, event.progress);
              const daysOverdue = getDaysOverdue(event.date);
              const cat = EVENT_CATEGORIES.find(c => c.value === event.category);
              
              return (
                <button
                  key={event.id}
                  onClick={() => onSelectEvent(event)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                    status === 'overdue' 
                      ? 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30' 
                      : 'bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                  }`}
                >
                  <span className="text-sm">{cat?.icon || '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {event.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {status === 'overdue' ? `逾期${daysOverdue}天` : '今天截止'}
                    </div>
                  </div>
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    {event.progress}%
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {todayEvents.length === 0 && urgentEvents.length === 0 && (
        <div className="text-center py-4">
          <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-500" />
          <p className="text-sm text-slate-600 dark:text-slate-400">今天没有待办事项</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">享受你的时光吧！</p>
        </div>
      )}
    </div>
  );
}
