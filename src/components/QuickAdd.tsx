import { useState, useRef, useEffect } from 'react';
import { Plus, X, Calendar, Tag } from 'lucide-react';
import { Event, EVENT_CATEGORIES, EventCategory } from '../types';

interface QuickAddProps {
  onAdd: (event: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
}

export default function QuickAdd({ onAdd }: QuickAddProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<EventCategory>('other');
  const [showCategories, setShowCategories] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const cat = EVENT_CATEGORIES.find(c => c.value === category);
    
    onAdd({
      title: title.trim(),
      description: '',
      date: new Date(date).toISOString(),
      color: cat?.color || 'blue',
      progress: 0,
      category,
      reminder: true,
    });

    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('other');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // 快捷日期设置
  const setQuickDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split('T')[0]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        title="快速添加事件"
      >
        <Plus className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-6 z-40 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-blue-600 text-white">
        <span className="font-medium">快速添加</span>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-blue-700 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-3 space-y-3">
        {/* 标题输入 */}
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入事件标题..."
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          autoFocus
        />

        {/* 日期选择 */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          />
        </div>

        {/* 快捷日期 */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setQuickDate(0)}
            className="flex-1 px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            今天
          </button>
          <button
            type="button"
            onClick={() => setQuickDate(1)}
            className="flex-1 px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            明天
          </button>
          <button
            type="button"
            onClick={() => setQuickDate(7)}
            className="flex-1 px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            下周
          </button>
          <button
            type="button"
            onClick={() => setQuickDate(30)}
            className="flex-1 px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            下月
          </button>
        </div>

        {/* 分类选择 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCategories(!showCategories)}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <Tag className="w-4 h-4 text-slate-400" />
            <span className="flex-1 text-left text-slate-700 dark:text-slate-300">
              {EVENT_CATEGORIES.find(c => c.value === category)?.icon}{' '}
              {EVENT_CATEGORIES.find(c => c.value === category)?.label}
            </span>
          </button>

          {showCategories && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-2 grid grid-cols-4 gap-1">
              {EVENT_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => {
                    setCategory(cat.value);
                    setShowCategories(false);
                  }}
                  className={`p-2 text-xs rounded transition-colors ${
                    category === cat.value
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="text-lg">{cat.icon}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={!title.trim()}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
        >
          添加事件
        </button>
      </form>
    </div>
  );
}
