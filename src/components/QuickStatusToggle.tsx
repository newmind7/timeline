import { useState } from 'react';
import { 
  Play, Pause, CheckCircle, RotateCcw, Archive,
  ChevronRight, Loader2
} from 'lucide-react';
import { Event } from '../types';
import { archiveEvent } from './EventArchive';

interface QuickStatusToggleProps {
  event: Event;
  onUpdate: (updates: Partial<Event>) => Promise<void>;
  onArchive?: () => void;
  compact?: boolean;
}

const STATUS_OPTIONS = [
  { id: 'not-started', label: '未开始', progress: 0, icon: Play, color: 'slate' },
  { id: 'in-progress', label: '进行中', progress: 50, icon: Pause, color: 'blue' },
  { id: 'completed', label: '已完成', progress: 100, icon: CheckCircle, color: 'green' },
];

export default function QuickStatusToggle({ 
  event, 
  onUpdate, 
  onArchive,
  compact = false 
}: QuickStatusToggleProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const currentStatus = event.progress === 100 
    ? 'completed' 
    : event.progress > 0 
    ? 'in-progress' 
    : 'not-started';

  const handleStatusChange = async (progress: number) => {
    setIsUpdating(true);
    try {
      await onUpdate({ progress });
      setShowOptions(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuickToggle = async () => {
    // 循环切换: 未开始 -> 进行中 -> 完成 -> 未开始
    const nextProgress = event.progress === 0 ? 50 : event.progress < 100 ? 100 : 0;
    await handleStatusChange(nextProgress);
  };

  const handleArchive = () => {
    archiveEvent(event);
    onArchive?.();
    setShowOptions(false);
  };

  const CurrentIcon = STATUS_OPTIONS.find(s => s.id === currentStatus)?.icon || Play;
  const currentColor = STATUS_OPTIONS.find(s => s.id === currentStatus)?.color || 'slate';

  if (compact) {
    return (
      <button
        onClick={handleQuickToggle}
        disabled={isUpdating}
        className={`p-1.5 rounded-lg transition-colors ${
          currentStatus === 'completed'
            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
            : currentStatus === 'in-progress'
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
        } hover:opacity-80`}
        title={`当前: ${STATUS_OPTIONS.find(s => s.id === currentStatus)?.label}`}
      >
        {isUpdating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CurrentIcon className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isUpdating}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
          currentStatus === 'completed'
            ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
            : currentStatus === 'in-progress'
            ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
            : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-700/50 dark:border-slate-600 dark:text-slate-300'
        }`}
      >
        {isUpdating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CurrentIcon className="w-4 h-4" />
        )}
        <span className="text-sm">
          {STATUS_OPTIONS.find(s => s.id === currentStatus)?.label}
        </span>
        <ChevronRight className={`w-4 h-4 transition-transform ${showOptions ? 'rotate-90' : ''}`} />
      </button>

      {showOptions && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowOptions(false)} 
          />
          <div className="absolute right-0 mt-1 z-20 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 min-w-[140px]">
            {STATUS_OPTIONS.map(option => {
              const Icon = option.icon;
              const isActive = currentStatus === option.id;
              
              return (
                <button
                  key={option.id}
                  onClick={() => handleStatusChange(option.progress)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{option.label}</span>
                  {isActive && <CheckCircle className="w-3 h-3 ml-auto text-blue-500" />}
                </button>
              );
            })}
            
            {/* 进度滑块 */}
            <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>自定义进度</span>
                <span>{event.progress}%</span>
              </div>
              <input
                type="range"
                value={event.progress}
                onChange={(e) => handleStatusChange(Number(e.target.value))}
                min={0}
                max={100}
                step={5}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* 重置和归档 */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-1">
              <button
                onClick={() => handleStatusChange(0)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <RotateCcw className="w-4 h-4" />
                <span>重置进度</span>
              </button>
              {event.progress === 100 && onArchive && (
                <button
                  onClick={handleArchive}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                >
                  <Archive className="w-4 h-4" />
                  <span>归档事件</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
