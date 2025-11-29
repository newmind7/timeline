import { useState, useRef, ReactNode } from 'react';
import { Calendar, Clock, Tag, Flag, CheckCircle, AlertTriangle } from 'lucide-react';
import { Event, EVENT_CATEGORIES, PRIORITY_CONFIG } from '../../types';

interface EventPreviewCardProps {
  event: Event;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function EventPreviewCard({ event, children, position = 'top' }: EventPreviewCardProps) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        x: rect.left + rect.width / 2,
        y: position === 'top' ? rect.top : rect.bottom,
      });
    }
    setShow(true);
  };

  const category = EVENT_CATEGORIES.find(c => c.value === event.category);
  const priority = event.priority ? PRIORITY_CONFIG[event.priority] : null;
  const eventDate = new Date(event.date);
  const now = new Date();
  const isOverdue = eventDate < now && event.progress < 100;
  const isComplete = event.progress === 100;
  const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const getStatusText = () => {
    if (isComplete) return '已完成';
    if (isOverdue) return `逾期 ${Math.abs(daysUntil)} 天`;
    if (daysUntil === 0) return '今天';
    if (daysUntil === 1) return '明天';
    if (daysUntil < 7) return `${daysUntil} 天后`;
    return eventDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const getStatusColor = () => {
    if (isComplete) return 'text-green-500';
    if (isOverdue) return 'text-red-500';
    if (daysUntil <= 3) return 'text-amber-500';
    return 'text-blue-500';
  };

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}
    >
      {children}

      {show && (
        <div
          className={`
            absolute z-50 w-64 p-4 
            bg-white dark:bg-slate-800 
            rounded-xl shadow-xl 
            border border-slate-200 dark:border-slate-700
            ${positionStyles[position]}
            animate-fadeIn
          `}
        >
          {/* 颜色条 */}
          <div 
            className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
            style={{ backgroundColor: event.color }}
          />

          {/* 标题 */}
          <h4 className="font-semibold text-slate-900 dark:text-white mb-2 pr-6">
            {event.title}
          </h4>

          {/* 状态徽章 */}
          <div className={`absolute top-3 right-3 ${getStatusColor()}`}>
            {isComplete ? (
              <CheckCircle className="w-5 h-5" />
            ) : isOverdue ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Clock className="w-5 h-5" />
            )}
          </div>

          {/* 描述 */}
          {event.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
              {event.description}
            </p>
          )}

          {/* 信息行 */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>
                {eventDate.toLocaleDateString('zh-CN', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric',
                  weekday: 'short'
                })}
              </span>
            </div>

            <div className={`flex items-center gap-2 ${getStatusColor()}`}>
              <Clock className="w-4 h-4" />
              <span>{getStatusText()}</span>
            </div>

            {category && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Tag className="w-4 h-4" />
                <span>{category.icon} {category.label}</span>
              </div>
            )}

            {priority && (
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4" style={{ color: priority.color }} />
                <span style={{ color: priority.color }}>{priority.label}</span>
              </div>
            )}
          </div>

          {/* 进度条 */}
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>进度</span>
              <span>{event.progress}%</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isComplete ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${event.progress}%` }}
              />
            </div>
          </div>

          {/* 标签 */}
          {event.tags && event.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {event.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag}
                  className="px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 rounded"
                >
                  #{tag}
                </span>
              ))}
              {event.tags.length > 3 && (
                <span className="text-[10px] text-slate-400">+{event.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
