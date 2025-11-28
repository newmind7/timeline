import { useState, useEffect, useMemo } from 'react';
import { Timer, Play, Pause, RotateCcw, Clock } from 'lucide-react';

interface DurationRecord {
  eventId: string;
  startTime: string;
  endTime?: string;
  duration: number; // 秒
}

interface EventDurationProps {
  eventId: string;
  onDurationChange?: (totalSeconds: number) => void;
}

export default function EventDuration({ eventId, onDurationChange }: EventDurationProps) {
  const [records, setRecords] = useState<DurationRecord[]>(() => {
    const saved = localStorage.getItem(`duration_${eventId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [isRunning, setIsRunning] = useState(false);
  const [currentStart, setCurrentStart] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // 计算总时长
  const totalSeconds = useMemo(() => {
    const recordedSeconds = records.reduce((sum, r) => sum + r.duration, 0);
    return recordedSeconds + elapsedSeconds;
  }, [records, elapsedSeconds]);

  // 保存记录
  useEffect(() => {
    localStorage.setItem(`duration_${eventId}`, JSON.stringify(records));
    onDurationChange?.(totalSeconds);
  }, [records, eventId, totalSeconds, onDurationChange]);

  // 计时器
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && currentStart) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - new Date(currentStart).getTime()) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, currentStart]);

  const handleStart = () => {
    const now = new Date().toISOString();
    setCurrentStart(now);
    setIsRunning(true);
    setElapsedSeconds(0);
  };

  const handlePause = () => {
    if (!currentStart) return;

    const endTime = new Date().toISOString();
    const duration = Math.floor((new Date(endTime).getTime() - new Date(currentStart).getTime()) / 1000);

    const newRecord: DurationRecord = {
      eventId,
      startTime: currentStart,
      endTime,
      duration,
    };

    setRecords(prev => [...prev, newRecord]);
    setIsRunning(false);
    setCurrentStart(null);
    setElapsedSeconds(0);
  };

  const handleReset = () => {
    if (confirm('确定要清除所有时长记录吗？')) {
      setRecords([]);
      setIsRunning(false);
      setCurrentStart(null);
      setElapsedSeconds(0);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    if (minutes > 0) {
      return `${minutes}分钟`;
    }
    return `${seconds}秒`;
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Timer className="w-4 h-4 text-orange-500" />
          用时追踪
        </div>
        {records.length > 0 && (
          <button
            onClick={handleReset}
            className="p-1 text-slate-400 hover:text-red-500"
            title="重置"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 计时器显示 */}
      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg mb-2">
        <div className="flex items-center gap-3">
          <div className={`text-2xl font-mono font-bold ${isRunning ? 'text-orange-500' : 'text-slate-700 dark:text-slate-300'}`}>
            {formatTime(isRunning ? elapsedSeconds : 0)}
          </div>
          {isRunning && (
            <div className="flex items-center gap-1 text-xs text-orange-500">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              计时中
            </div>
          )}
        </div>
        
        <button
          onClick={isRunning ? handlePause : handleStart}
          className={`p-2 rounded-full ${
            isRunning
              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-500 hover:bg-orange-200'
              : 'bg-green-100 dark:bg-green-900/30 text-green-500 hover:bg-green-200'
          }`}
        >
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
      </div>

      {/* 总时长 */}
      <div className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-orange-500" />
          <span className="text-slate-600 dark:text-slate-400">累计用时</span>
        </div>
        <span className="font-medium text-orange-600 dark:text-orange-400">
          {formatDuration(totalSeconds)}
        </span>
      </div>

      {/* 记录列表 */}
      {records.length > 0 && (
        <div className="mt-2 max-h-[100px] overflow-y-auto">
          <p className="text-xs text-slate-500 mb-1">记录 ({records.length}次)</p>
          <div className="space-y-1">
            {records.slice(-5).reverse().map((record, index) => (
              <div 
                key={index} 
                className="flex justify-between text-xs text-slate-500"
              >
                <span>
                  {new Date(record.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span>{formatDuration(record.duration)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
