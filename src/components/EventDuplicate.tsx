import { useState } from 'react';
import { Copy, Calendar, Check, X, Loader2 } from 'lucide-react';
import { Event } from '../types';

interface EventDuplicateProps {
  event: Event;
  onDuplicate: (newEvent: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export default function EventDuplicate({ event, onDuplicate }: EventDuplicateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [keepProgress, setKeepProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDuplicate = async () => {
    setIsLoading(true);
    try {
      const duplicatedEvent = {
        title: `${event.title} (副本)`,
        description: event.description,
        date: newDate,
        color: event.color,
        progress: keepProgress ? event.progress : 0,
        category: event.category,
        priority: event.priority,
        tags: event.tags,
        reminder: event.reminder,
      };
      
      await onDuplicate(duplicatedEvent);
      setCopied(true);
      
      setTimeout(() => {
        setIsOpen(false);
        setCopied(false);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
        title="复制事件"
      >
        <Copy className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Copy className="w-5 h-5 text-blue-500" />
            复制事件
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* 原事件信息 */}
        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg mb-4">
          <p className="text-sm text-slate-500 mb-1">原事件</p>
          <p className="font-medium text-slate-900 dark:text-white">{event.title}</p>
          <p className="text-xs text-slate-400 mt-1">
            日期: {new Date(event.date).toLocaleDateString()}
          </p>
        </div>

        {/* 新日期选择 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            新事件日期
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700"
            />
          </div>
        </div>

        {/* 快捷日期选择 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setNewDate(new Date().toISOString().split('T')[0])}
            className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            今天
          </button>
          <button
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              setNewDate(tomorrow.toISOString().split('T')[0]);
            }}
            className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            明天
          </button>
          <button
            onClick={() => {
              const nextWeek = new Date();
              nextWeek.setDate(nextWeek.getDate() + 7);
              setNewDate(nextWeek.toISOString().split('T')[0]);
            }}
            className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            下周
          </button>
        </div>

        {/* 保留进度选项 */}
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={keepProgress}
            onChange={(e) => setKeepProgress(e.target.checked)}
            className="w-4 h-4 text-blue-500 rounded"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">
            保留原进度 ({event.progress}%)
          </span>
        </label>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={() => setIsOpen(false)}
            className="flex-1 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg"
          >
            取消
          </button>
          <button
            onClick={handleDuplicate}
            disabled={isLoading || copied}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : copied ? (
              <>
                <Check className="w-4 h-4" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
