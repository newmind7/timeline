import { useMemo } from 'react';
import { Edit2, Trash2, Clock, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { Event, EVENT_CATEGORIES } from '../types';
import { getEventStatus, formatDate } from '../utils/dateUtils';

interface KanbanViewProps {
  events: Event[];
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (id: string) => void;
  onProgressChange: (eventId: string, progress: number) => void;
}

type StatusColumn = 'upcoming' | 'today' | 'overdue' | 'completed';

const COLUMNS: { key: StatusColumn; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'upcoming', label: '即将到来', icon: <Clock className="w-4 h-4" />, color: 'border-green-500 bg-green-50 dark:bg-green-900/20' },
  { key: 'today', label: '今天', icon: <Calendar className="w-4 h-4" />, color: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' },
  { key: 'overdue', label: '已逾期', icon: <AlertTriangle className="w-4 h-4" />, color: 'border-red-500 bg-red-50 dark:bg-red-900/20' },
  { key: 'completed', label: '已完成', icon: <CheckCircle className="w-4 h-4" />, color: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' },
];

export default function KanbanView({ events, onEditEvent, onDeleteEvent, onProgressChange }: KanbanViewProps) {
  // 按状态分组事件
  const groupedEvents = useMemo(() => {
    const groups: Record<StatusColumn, Event[]> = {
      upcoming: [],
      today: [],
      overdue: [],
      completed: [],
    };

    events.forEach(event => {
      const status = getEventStatus(event.date, event.progress) as StatusColumn;
      if (groups[status]) {
        groups[status].push(event);
      }
    });

    // 按日期排序
    Object.values(groups).forEach(group => {
      group.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    return groups;
  }, [events]);

  // 快速完成事件
  const handleQuickComplete = (event: Event) => {
    onProgressChange(event.id, 100);
  };

  return (
    <div className="h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
        {COLUMNS.map(column => (
          <div
            key={column.key}
            className={`flex flex-col rounded-xl border-t-4 ${column.color} bg-white dark:bg-slate-800 shadow-sm`}
          >
            {/* 列标题 */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className={`${
                  column.key === 'upcoming' ? 'text-green-600' :
                  column.key === 'today' ? 'text-amber-600' :
                  column.key === 'overdue' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {column.icon}
                </span>
                <h3 className="font-semibold text-slate-900 dark:text-white">{column.label}</h3>
              </div>
              <span className="px-2 py-0.5 text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                {groupedEvents[column.key].length}
              </span>
            </div>

            {/* 事件列表 */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {groupedEvents[column.key].length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                  <p className="text-sm">暂无事件</p>
                </div>
              ) : (
                groupedEvents[column.key].map(event => {
                  const cat = EVENT_CATEGORIES.find(c => c.value === event.category);
                  return (
                    <div
                      key={event.id}
                      className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 hover:shadow-md transition-shadow group"
                    >
                      {/* 事件头部 */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 dark:text-white truncate">
                            {event.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {formatDate(event.date, 'short')}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditEvent(event)}
                            className="p-1 text-slate-400 hover:text-blue-600"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteEvent(event.id)}
                            className="p-1 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* 分类标签 */}
                      {cat && (
                        <span className="inline-block text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded mb-2">
                          {cat.icon} {cat.label}
                        </span>
                      )}

                      {/* 进度条 */}
                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500 dark:text-slate-400">进度</span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{event.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5">
                          <div
                            className={`h-full rounded-full transition-all ${
                              event.progress === 100 ? 'bg-blue-500' :
                              column.key === 'overdue' ? 'bg-red-500' :
                              column.key === 'today' ? 'bg-amber-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${event.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* 快速完成按钮 */}
                      {column.key !== 'completed' && (
                        <button
                          onClick={() => handleQuickComplete(event)}
                          className="w-full py-1.5 text-xs text-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                        >
                          ✓ 标记完成
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
