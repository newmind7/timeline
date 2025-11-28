import { useMemo } from 'react';
import { Grid3X3, AlertTriangle, Star, Clock, Inbox } from 'lucide-react';
import { Event } from '../types';

interface EisenhowerMatrixProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
}

type Quadrant = 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'not-urgent-not-important';

export default function EisenhowerMatrix({ events, onEventClick }: EisenhowerMatrixProps) {
  const matrix = useMemo(() => {
    const now = new Date();
    const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    // 未完成的事件
    const activeEvents = events.filter(e => e.progress < 100);
    
    const categorize = (event: Event): Quadrant => {
      const eventDate = new Date(event.date);
      const isUrgent = eventDate <= threeDays;
      const isImportant = event.priority === 'p0' || event.priority === 'p1';
      
      if (isUrgent && isImportant) return 'urgent-important';
      if (!isUrgent && isImportant) return 'not-urgent-important';
      if (isUrgent && !isImportant) return 'urgent-not-important';
      return 'not-urgent-not-important';
    };

    const result: Record<Quadrant, Event[]> = {
      'urgent-important': [],
      'not-urgent-important': [],
      'urgent-not-important': [],
      'not-urgent-not-important': [],
    };

    activeEvents.forEach(event => {
      const quadrant = categorize(event);
      result[quadrant].push(event);
    });

    return result;
  }, [events]);

  const quadrants = [
    {
      key: 'urgent-important' as Quadrant,
      title: '紧急且重要',
      subtitle: '立即执行',
      icon: AlertTriangle,
      color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      iconColor: 'text-red-500',
      badge: 'bg-red-500',
    },
    {
      key: 'not-urgent-important' as Quadrant,
      title: '重要不紧急',
      subtitle: '计划执行',
      icon: Star,
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      iconColor: 'text-blue-500',
      badge: 'bg-blue-500',
    },
    {
      key: 'urgent-not-important' as Quadrant,
      title: '紧急不重要',
      subtitle: '委托他人',
      icon: Clock,
      color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
      iconColor: 'text-amber-500',
      badge: 'bg-amber-500',
    },
    {
      key: 'not-urgent-not-important' as Quadrant,
      title: '不紧急不重要',
      subtitle: '考虑删除',
      icon: Inbox,
      color: 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600',
      iconColor: 'text-slate-500',
      badge: 'bg-slate-500',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-violet-500" />
          四象限法则
        </h3>
        <span className="text-xs text-slate-500">
          {events.filter(e => e.progress < 100).length} 待处理
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {quadrants.map(q => {
          const items = matrix[q.key];
          const Icon = q.icon;
          
          return (
            <div
              key={q.key}
              className={`p-3 rounded-lg border ${q.color} min-h-[100px]`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${q.iconColor}`} />
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {q.title}
                  </p>
                  <p className="text-[10px] text-slate-500">{q.subtitle}</p>
                </div>
                {items.length > 0 && (
                  <span className={`px-1.5 py-0.5 text-[10px] text-white rounded-full ${q.badge}`}>
                    {items.length}
                  </span>
                )}
              </div>

              <div className="space-y-1 max-h-[80px] overflow-y-auto">
                {items.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick?.(event)}
                    className="flex items-center gap-1.5 p-1.5 bg-white/50 dark:bg-slate-800/50 rounded text-xs cursor-pointer hover:bg-white dark:hover:bg-slate-700"
                  >
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: event.color }}
                    />
                    <span className="truncate text-slate-600 dark:text-slate-400">
                      {event.title}
                    </span>
                  </div>
                ))}
                {items.length > 3 && (
                  <p className="text-[10px] text-slate-400 text-center">
                    +{items.length - 3} 更多
                  </p>
                )}
                {items.length === 0 && (
                  <p className="text-[10px] text-slate-400 text-center py-2">
                    暂无事件
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 提示 */}
      <p className="mt-3 text-[10px] text-slate-400 text-center">
        💡 基于优先级(P0/P1)和截止日期(3天内)自动分类
      </p>
    </div>
  );
}
