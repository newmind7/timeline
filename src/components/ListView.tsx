import { useState, useMemo } from 'react';
import { Edit2, Trash2, ChevronUp, ChevronDown, Check, X } from 'lucide-react';
import { Event, EVENT_CATEGORIES } from '../types';
import { getEventStatus, formatDate } from '../utils/dateUtils';

interface ListViewProps {
  events: Event[];
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (id: string) => void;
  onProgressChange: (eventId: string, progress: number) => void;
}

type SortField = 'title' | 'date' | 'progress' | 'category' | 'status';
type SortDirection = 'asc' | 'desc';

export default function ListView({ events, onEditEvent, onDeleteEvent, onProgressChange }: ListViewProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 排序事件
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'progress':
          comparison = a.progress - b.progress;
          break;
        case 'category':
          comparison = (a.category || 'other').localeCompare(b.category || 'other');
          break;
        case 'status':
          const statusA = getEventStatus(a.date, a.progress);
          const statusB = getEventStatus(b.date, b.progress);
          comparison = statusA.localeCompare(statusB);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [events, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === events.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(events.map(e => e.id)));
    }
  };

  const handleBatchComplete = () => {
    selectedIds.forEach(id => {
      onProgressChange(id, 100);
    });
    setSelectedIds(new Set());
  };

  const handleBatchDelete = () => {
    if (confirm(`确定要删除选中的 ${selectedIds.size} 个事件吗？`)) {
      selectedIds.forEach(id => {
        onDeleteEvent(id);
      });
      setSelectedIds(new Set());
    }
  };

  const getStatusBadge = (event: Event) => {
    const status = getEventStatus(event.date, event.progress);
    const styles = {
      completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
      overdue: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
      today: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
      upcoming: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    };
    const labels = {
      completed: '已完成',
      overdue: '已逾期',
      today: '今天',
      upcoming: '即将到来',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4" /> 
      : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
      {/* 批量操作栏 */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800">
          <span className="text-sm text-blue-700 dark:text-blue-300">
            已选择 {selectedIds.size} 个事件
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBatchComplete}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Check className="w-4 h-4" />
              全部完成
            </button>
            <button
              onClick={handleBatchDelete}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <X className="w-4 h-4" />
              取消
            </button>
          </div>
        </div>
      )}

      {/* 表头 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="w-12 p-3">
                <input
                  type="checkbox"
                  checked={selectedIds.size === events.length && events.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-300"
                />
              </th>
              <th 
                className="text-left p-3 font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-1">
                  标题
                  <SortIcon field="title" />
                </div>
              </th>
              <th 
                className="text-left p-3 font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1">
                  日期
                  <SortIcon field="date" />
                </div>
              </th>
              <th 
                className="text-left p-3 font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center gap-1">
                  分类
                  <SortIcon field="category" />
                </div>
              </th>
              <th 
                className="text-left p-3 font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  状态
                  <SortIcon field="status" />
                </div>
              </th>
              <th 
                className="text-left p-3 font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600"
                onClick={() => handleSort('progress')}
              >
                <div className="flex items-center gap-1">
                  进度
                  <SortIcon field="progress" />
                </div>
              </th>
              <th className="w-24 p-3 font-medium text-slate-700 dark:text-slate-300">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">
                  暂无事件
                </td>
              </tr>
            ) : (
              sortedEvents.map(event => {
                const cat = EVENT_CATEGORIES.find(c => c.value === event.category);
                return (
                  <tr 
                    key={event.id}
                    className={`border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                      selectedIds.has(event.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(event.id)}
                        onChange={() => toggleSelect(event.id)}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {event.title}
                      </div>
                      {event.description && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                          {event.description}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(event.date, 'short')}
                    </td>
                    <td className="p-3">
                      {cat && (
                        <span className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                          {cat.icon} {cat.label}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {getStatusBadge(event)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${event.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {event.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => onEditEvent(event)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteEvent(event.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 统计信息 */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-sm text-slate-600 dark:text-slate-400">
        共 {events.length} 个事件 · 
        已完成 {events.filter(e => e.progress === 100).length} 个 · 
        逾期 {events.filter(e => getEventStatus(e.date, e.progress) === 'overdue').length} 个
      </div>
    </div>
  );
}
