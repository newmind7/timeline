import { useState, useRef, useMemo } from 'react';
import { Calendar, GripVertical, Check, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { Event, EVENT_CATEGORIES } from '../types';
import { getEventStatus } from '../utils/dateUtils';

interface DraggableTimelineProps {
  events: Event[];
  onUpdateEventDate: (eventId: string, newDate: string) => void;
}

export default function DraggableTimeline({ events, onUpdateEventDate }: DraggableTimelineProps) {
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [viewOffset, setViewOffset] = useState(0); // 周偏移
  const containerRef = useRef<HTMLDivElement>(null);

  // 生成当前视图的7天
  const days = useMemo(() => {
    const result = [];
    const today = new Date();
    today.setDate(today.getDate() + viewOffset * 7);
    
    // 从本周一开始
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      result.push({
        date: date.toISOString().split('T')[0],
        dayName: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()],
        dayNum: date.getDate(),
        month: date.getMonth() + 1,
        isToday: date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0],
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
      });
    }
    return result;
  }, [viewOffset]);

  // 按日期分组事件
  const eventsByDate = useMemo(() => {
    const map: Record<string, Event[]> = {};
    days.forEach(day => {
      map[day.date] = events.filter(e => e.date.startsWith(day.date));
    });
    return map;
  }, [events, days]);

  const handleDragStart = (e: React.DragEvent, event: Event) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', event.id);
  };

  const handleDragOver = (e: React.DragEvent, date: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(date);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, date: string) => {
    e.preventDefault();
    if (draggedEvent && date !== draggedEvent.date.split('T')[0]) {
      onUpdateEventDate(draggedEvent.id, date);
    }
    setDraggedEvent(null);
    setDragOverDate(null);
  };

  const handleDragEnd = () => {
    setDraggedEvent(null);
    setDragOverDate(null);
  };

  const getCategoryInfo = (catId?: string) => 
    EVENT_CATEGORIES.find(c => c.id === catId) || { icon: '📌', label: '其他' };

  const getStatusColor = (date: string, progress: number) => {
    if (progress === 100) return 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700';
    const status = getEventStatus(date);
    switch (status) {
      case 'overdue': return 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700';
      case 'today': return 'bg-amber-100 border-amber-300 dark:bg-amber-900/30 dark:border-amber-700';
      default: return 'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-500" />
          拖拽调整日期
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewOffset(v => v - 1)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewOffset(0)}
            className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            本周
          </button>
          <button
            onClick={() => setViewOffset(v => v + 1)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 日历网格 */}
      <div className="grid grid-cols-7 gap-1" ref={containerRef}>
        {days.map(day => (
          <div
            key={day.date}
            className={`min-h-[120px] border rounded-lg transition-all ${
              day.isToday 
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                : day.isWeekend
                ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                : 'border-slate-200 dark:border-slate-700'
            } ${
              dragOverDate === day.date 
                ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                : ''
            }`}
            onDragOver={(e) => handleDragOver(e, day.date)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, day.date)}
          >
            {/* 日期头 */}
            <div className={`text-center py-1 border-b ${
              day.isToday 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}>
              <div className="text-xs">{day.dayName}</div>
              <div className="text-sm font-medium">{day.dayNum}</div>
            </div>

            {/* 事件列表 */}
            <div className="p-1 space-y-1 overflow-y-auto max-h-[80px]">
              {eventsByDate[day.date]?.map(event => (
                <div
                  key={event.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, event)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-1 p-1 rounded border cursor-move text-xs transition-transform hover:scale-[1.02] ${
                    getStatusColor(event.date, event.progress)
                  } ${
                    draggedEvent?.id === event.id ? 'opacity-50' : ''
                  }`}
                >
                  <GripVertical className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="flex-shrink-0">{getCategoryInfo(event.category).icon}</span>
                  <span className="truncate flex-1">{event.title}</span>
                  {event.progress === 100 && <Check className="w-3 h-3 text-green-500 flex-shrink-0" />}
                </div>
              ))}
              
              {eventsByDate[day.date]?.length === 0 && dragOverDate !== day.date && (
                <div className="text-center text-slate-300 dark:text-slate-600 text-xs py-2">
                  -
                </div>
              )}
              
              {dragOverDate === day.date && draggedEvent && (
                <div className="border-2 border-dashed border-indigo-400 rounded p-1 text-center text-xs text-indigo-500">
                  放置到这里
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 提示 */}
      <p className="mt-3 text-center text-xs text-slate-400">
        💡 拖拽事件卡片到其他日期即可调整日程
      </p>
    </div>
  );
}
