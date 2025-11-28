import { useState, useMemo } from 'react';
import { 
  Archive, ArchiveRestore, Trash2, Search, Filter,
  Calendar, CheckCircle, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { Event, EVENT_CATEGORIES } from '../types';

interface ArchivedEvent extends Event {
  archivedAt: string;
}

interface EventArchiveProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (event: Event) => void;
  onPermanentDelete: (id: string) => void;
}

export default function EventArchive({ 
  isOpen, 
  onClose, 
  onRestore, 
  onPermanentDelete 
}: EventArchiveProps) {
  const [archivedEvents, setArchivedEvents] = useState<ArchivedEvent[]>(() => {
    const saved = localStorage.getItem('archivedEvents');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // 按年月分组
  const groupedEvents = useMemo(() => {
    const filtered = archivedEvents.filter(e => 
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const years = [...new Set(filtered.map(e => new Date(e.date).getFullYear()))].sort((a, b) => b - a);
    
    const groups: Record<string, Record<string, ArchivedEvent[]>> = {};
    
    filtered.forEach(event => {
      const date = new Date(event.date);
      const year = date.getFullYear().toString();
      const month = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (selectedYear !== 'all' && year !== selectedYear) return;
      
      if (!groups[year]) groups[year] = {};
      if (!groups[year][month]) groups[year][month] = [];
      groups[year][month].push(event);
    });

    return { groups, years };
  }, [archivedEvents, searchTerm, selectedYear]);

  const handleRestore = (event: ArchivedEvent) => {
    // 从归档中移除
    const updated = archivedEvents.filter(e => e.id !== event.id);
    setArchivedEvents(updated);
    localStorage.setItem('archivedEvents', JSON.stringify(updated));
    
    // 恢复到主列表
    const { archivedAt, ...originalEvent } = event;
    onRestore(originalEvent);
  };

  const handlePermanentDelete = (id: string) => {
    const updated = archivedEvents.filter(e => e.id !== id);
    setArchivedEvents(updated);
    localStorage.setItem('archivedEvents', JSON.stringify(updated));
    onPermanentDelete(id);
    setShowConfirmDelete(null);
  };

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(month)) {
        newSet.delete(month);
      } else {
        newSet.add(month);
      }
      return newSet;
    });
  };

  const getCategoryInfo = (catId?: string) => 
    EVENT_CATEGORIES.find(c => c.value === catId) || { icon: '📌', label: '其他' };

  const formatMonthLabel = (month: string) => {
    const [year, m] = month.split('-');
    return `${year}年${parseInt(m)}月`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800">
          <div className="flex items-center gap-3">
            <Archive className="w-6 h-6 text-slate-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">事件归档</h2>
            <span className="text-sm text-slate-500">({archivedEvents.length})</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* 搜索和筛选 */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索归档事件..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 text-sm"
              />
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 text-sm"
            >
              <option value="all">全部年份</option>
              {groupedEvents.years.map(year => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>
          </div>
        </div>

        {/* 归档列表 */}
        <div className="p-4 overflow-y-auto max-h-[500px]">
          {archivedEvents.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Archive className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">归档为空</p>
              <p className="text-sm">已完成的事件可以归档到这里</p>
            </div>
          ) : Object.keys(groupedEvents.groups).length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>没有找到匹配的事件</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedEvents.groups).map(([year, months]) => (
                <div key={year}>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {year}年
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(months).map(([month, events]) => (
                      <div key={month} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleMonth(month)}
                          className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {formatMonthLabel(month)}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">{events.length}个事件</span>
                            {expandedMonths.has(month) ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </button>
                        
                        {expandedMonths.has(month) && (
                          <div className="p-2 space-y-2">
                            {events.map(event => (
                              <div
                                key={event.id}
                                className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600"
                              >
                                <span className="text-lg">{getCategoryInfo(event.category).icon}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-slate-900 dark:text-white truncate">
                                    {event.title}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(event.date).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>归档于 {new Date(event.archivedAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleRestore(event)}
                                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                                    title="恢复"
                                  >
                                    <ArchiveRestore className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setShowConfirmDelete(event.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                    title="永久删除"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 确认删除弹窗 */}
        {showConfirmDelete && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm mx-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">永久删除</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                确定要永久删除这个事件吗？此操作不可撤销。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDelete(null)}
                  className="flex-1 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg"
                >
                  取消
                </button>
                <button
                  onClick={() => handlePermanentDelete(showConfirmDelete)}
                  className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 归档事件的辅助函数
export function archiveEvent(event: Event) {
  const saved = localStorage.getItem('archivedEvents');
  const archived: ArchivedEvent[] = saved ? JSON.parse(saved) : [];
  
  const archivedEvent: ArchivedEvent = {
    ...event,
    archivedAt: new Date().toISOString(),
  };
  
  archived.push(archivedEvent);
  localStorage.setItem('archivedEvents', JSON.stringify(archived));
  
  return archivedEvent;
}
