import { useState, useEffect } from 'react';
import { Star, Calendar, ChevronRight, Trash2 } from 'lucide-react';
import { Event } from '../types';

interface StarredEventsProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
}

export default function StarredEvents({ events, onEventClick }: StarredEventsProps) {
  const [starredIds, setStarredIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('starredEvents');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('starredEvents', JSON.stringify(starredIds));
  }, [starredIds]);

  const starredEvents = events.filter(e => starredIds.includes(e.id));

  const toggleStar = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredIds(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const getStatusColor = (event: Event) => {
    if (event.progress === 100) return 'border-green-400 bg-green-50 dark:bg-green-900/20';
    const eventDate = new Date(event.date);
    if (eventDate < new Date()) return 'border-red-400 bg-red-50 dark:bg-red-900/20';
    return 'border-amber-400 bg-amber-50 dark:bg-amber-900/20';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return '今天';
    if (diff === 1) return '明天';
    if (diff === -1) return '昨天';
    if (diff < -1) return `${Math.abs(diff)}天前`;
    if (diff <= 7) return `${diff}天后`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  if (starredEvents.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-yellow-500" />
          星标事件
        </h3>
        <div className="text-center py-6 text-slate-400">
          <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">暂无星标事件</p>
          <p className="text-xs">点击事件卡片上的⭐标记重要事件</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          星标事件
        </h3>
        <span className="text-xs text-slate-500">{starredEvents.length} 个</span>
      </div>

      <div className="space-y-2 max-h-[250px] overflow-y-auto">
        {starredEvents.map(event => (
          <div
            key={event.id}
            onClick={() => onEventClick?.(event)}
            className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(event)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {event.title}
                  </h4>
                  {event.progress === 100 && (
                    <span className="text-xs text-green-500">✓</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(event.date)}
                  </span>
                  <span>{event.progress}%</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => toggleStar(event.id, e)}
                  className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded"
                >
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </button>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            </div>
            
            {/* 进度条 */}
            <div className="mt-2 h-1 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  event.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${event.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 导出星标切换函数供其他组件使用
export function useStarredEvents() {
  const [starredIds, setStarredIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('starredEvents');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('starredEvents', JSON.stringify(starredIds));
  }, [starredIds]);

  const toggleStar = (eventId: string) => {
    setStarredIds(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const isStarred = (eventId: string) => starredIds.includes(eventId);

  return { starredIds, toggleStar, isStarred };
}
