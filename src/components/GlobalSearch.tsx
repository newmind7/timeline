import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Calendar, Tag } from 'lucide-react';
import { Event, EVENT_CATEGORIES } from '../types';
import { formatDate, getEventStatus } from '../utils/dateUtils';

interface GlobalSearchProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
}

export default function GlobalSearch({ events, onSelectEvent }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // 搜索结果
  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return events.filter(event => 
      event.title.toLowerCase().includes(lowerQuery) ||
      event.description?.toLowerCase().includes(lowerQuery) ||
      EVENT_CATEGORIES.find(c => c.value === event.category)?.label.includes(query)
    ).slice(0, 8);
  }, [events, query]);

  // 键盘快捷键打开搜索
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K 打开搜索
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      // Escape 关闭搜索
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // 打开时聚焦输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (event: Event) => {
    onSelectEvent(event);
    setIsOpen(false);
    setQuery('');
  };

  const getStatusColor = (event: Event) => {
    const status = getEventStatus(event.date, event.progress);
    switch (status) {
      case 'completed': return 'text-blue-600';
      case 'overdue': return 'text-red-600';
      case 'today': return 'text-amber-600';
      default: return 'text-green-600';
    }
  };

  const getStatusLabel = (event: Event) => {
    const status = getEventStatus(event.date, event.progress);
    switch (status) {
      case 'completed': return '已完成';
      case 'overdue': return '已逾期';
      case 'today': return '今天';
      default: return '即将到来';
    }
  };

  return (
    <>
      {/* 搜索按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline">搜索事件</span>
        <kbd className="hidden md:inline px-1.5 py-0.5 text-xs bg-slate-200 dark:bg-slate-600 rounded">⌘K</kbd>
      </button>

      {/* 搜索模态框 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* 搜索面板 */}
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
            {/* 搜索输入 */}
            <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索事件标题、描述或分类..."
                className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="px-2 py-1 text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 rounded"
              >
                ESC
              </button>
            </div>

            {/* 搜索结果 */}
            <div className="max-h-96 overflow-y-auto">
              {query && results.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>未找到匹配的事件</p>
                  <p className="text-sm mt-1">尝试其他关键词</p>
                </div>
              ) : (
                <div className="py-2">
                  {results.map((event) => {
                    const cat = EVENT_CATEGORIES.find(c => c.value === event.category);
                    return (
                      <button
                        key={event.id}
                        onClick={() => handleSelect(event)}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                      >
                        {/* 分类图标 */}
                        <div className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-600 rounded-lg text-xl">
                          {cat?.icon || '📌'}
                        </div>

                        {/* 事件信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 dark:text-white truncate">
                            {event.title}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(event.date, 'short')}
                            </span>
                            <span className={`${getStatusColor(event)}`}>
                              {getStatusLabel(event)}
                            </span>
                            {cat && (
                              <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {cat.label}
                              </span>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">
                              {event.description}
                            </p>
                          )}
                        </div>

                        {/* 进度 */}
                        <div className="text-right">
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {event.progress}%
                          </div>
                          <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full mt-1">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${event.progress}%` }}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 无搜索时的提示 */}
              {!query && (
                <div className="p-6 text-center text-slate-400 dark:text-slate-500">
                  <p className="text-sm">输入关键词搜索事件</p>
                  <p className="text-xs mt-2">支持按标题、描述、分类搜索</p>
                </div>
              )}
            </div>

            {/* 底部提示 */}
            {results.length > 0 && (
              <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-500 dark:text-slate-400">
                找到 {results.length} 个匹配结果
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
