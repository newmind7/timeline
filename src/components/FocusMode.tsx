import { useState, useEffect } from 'react';
import { Focus, X, Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';
import { Event, EVENT_CATEGORIES } from '../types';

interface FocusModeProps {
  event: Event | null;
  onClose: () => void;
  onComplete: (event: Event) => void;
}

export default function FocusMode({ event, onClose, onComplete }: FocusModeProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [notes, setNotes] = useState('');

  // 计时器
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        setElapsedTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  // 格式化时间
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // 完成任务
  const handleComplete = () => {
    if (event) {
      onComplete({ ...event, progress: 100 });
    }
    onClose();
  };

  // 重置计时器
  const handleReset = () => {
    setElapsedTime(0);
    setIsRunning(false);
  };

  if (!event) return null;

  const cat = EVENT_CATEGORIES.find(c => c.value === event.category);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 flex items-center justify-center">
      {/* 背景动画 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* 主内容 */}
      <div className="relative z-10 max-w-2xl w-full mx-4 text-center">
        {/* 图标 */}
        <div className="text-6xl mb-6">{cat?.icon || '🎯'}</div>

        {/* 标题 */}
        <h1 className="text-4xl font-bold text-white mb-4">{event.title}</h1>

        {/* 描述 */}
        {event.description && (
          <p className="text-lg text-slate-400 mb-8 max-w-md mx-auto">
            {event.description}
          </p>
        )}

        {/* 计时器 */}
        <div className="mb-8">
          <div className="text-7xl font-mono font-bold text-white mb-4">
            {formatTime(elapsedTime)}
          </div>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`p-4 rounded-full transition-colors ${
                isRunning 
                  ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button
              onClick={handleReset}
              className="p-4 bg-slate-700 hover:bg-slate-600 text-white rounded-full transition-colors"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 进度 */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>当前进度</span>
            <span>{event.progress}%</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
              style={{ width: `${event.progress}%` }}
            />
          </div>
        </div>

        {/* 笔记 */}
        <div className="mb-8">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="记录你的想法和进展..."
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500"
            rows={3}
          />
        </div>

        {/* 完成按钮 */}
        <button
          onClick={handleComplete}
          className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center gap-2 mx-auto"
        >
          <CheckCircle className="w-5 h-5" />
          完成任务
        </button>

        {/* 提示 */}
        <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-sm">
          <Focus className="w-4 h-4" />
          <span>专注模式 · 按 ESC 退出</span>
        </div>
      </div>

      {/* ESC 退出 */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
