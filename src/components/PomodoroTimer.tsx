import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Target, Settings, X } from 'lucide-react';

interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const DEFAULT_SETTINGS: PomodoroSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
};

export default function PomodoroTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const getModeTime = useCallback((m: TimerMode) => {
    switch (m) {
      case 'work': return settings.workMinutes * 60;
      case 'shortBreak': return settings.shortBreakMinutes * 60;
      case 'longBreak': return settings.longBreakMinutes * 60;
    }
  }, [settings]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // 播放提示音
      playNotificationSound();
      
      if (mode === 'work') {
        const newCount = completedPomodoros + 1;
        setCompletedPomodoros(newCount);
        
        // 每4个番茄钟后长休息
        if (newCount % settings.longBreakInterval === 0) {
          setMode('longBreak');
          setTimeLeft(settings.longBreakMinutes * 60);
        } else {
          setMode('shortBreak');
          setTimeLeft(settings.shortBreakMinutes * 60);
        }
      } else {
        setMode('work');
        setTimeLeft(settings.workMinutes * 60);
      }
      setIsRunning(false);
      
      // 发送通知
      if (Notification.permission === 'granted') {
        new Notification('番茄钟', {
          body: mode === 'work' ? '休息一下吧！' : '继续专注工作！',
          icon: '🍅',
        });
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, completedPomodoros, settings]);

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQB+h+D2yI0dGl+U0N2rZyElZqHN0auDRjlrpr/BmG9WTnePr7SggHxwd4OEhISEhISD');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((getModeTime(mode) - timeLeft) / getModeTime(mode)) * 100;

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(getModeTime(newMode));
    setIsRunning(false);
  };

  const handleReset = () => {
    setTimeLeft(getModeTime(mode));
    setIsRunning(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-40 right-6 z-40 w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        title="番茄钟"
      >
        🍅
      </button>
    );
  }

  return (
    <div className="fixed bottom-40 right-6 z-40 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* 头部 */}
      <div className={`flex items-center justify-between p-3 ${
        mode === 'work' ? 'bg-red-500' : mode === 'shortBreak' ? 'bg-green-500' : 'bg-blue-500'
      } text-white`}>
        <span className="font-medium flex items-center gap-2">
          🍅 番茄钟
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowSettings(!showSettings)} className="p-1 hover:bg-white/20 rounded">
            <Settings className="w-4 h-4" />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">专注时长</span>
            <select
              value={settings.workMinutes}
              onChange={(e) => setSettings({...settings, workMinutes: Number(e.target.value)})}
              className="px-2 py-1 text-xs border rounded dark:bg-slate-600 dark:border-slate-500"
            >
              {[15, 20, 25, 30, 45, 60].map(m => <option key={m} value={m}>{m}分钟</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">短休息</span>
            <select
              value={settings.shortBreakMinutes}
              onChange={(e) => setSettings({...settings, shortBreakMinutes: Number(e.target.value)})}
              className="px-2 py-1 text-xs border rounded dark:bg-slate-600 dark:border-slate-500"
            >
              {[3, 5, 10].map(m => <option key={m} value={m}>{m}分钟</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">长休息</span>
            <select
              value={settings.longBreakMinutes}
              onChange={(e) => setSettings({...settings, longBreakMinutes: Number(e.target.value)})}
              className="px-2 py-1 text-xs border rounded dark:bg-slate-600 dark:border-slate-500"
            >
              {[10, 15, 20, 30].map(m => <option key={m} value={m}>{m}分钟</option>)}
            </select>
          </div>
        </div>
      )}

      {/* 模式切换 */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        {[
          { key: 'work', label: '专注', icon: <Target className="w-4 h-4" /> },
          { key: 'shortBreak', label: '短休', icon: <Coffee className="w-4 h-4" /> },
          { key: 'longBreak', label: '长休', icon: <Coffee className="w-4 h-4" /> },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => handleModeChange(key as TimerMode)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              mode === key
                ? key === 'work' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                : key === 'shortBreak' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <span className="flex items-center justify-center gap-1">{icon} {label}</span>
          </button>
        ))}
      </div>

      {/* 计时器 */}
      <div className="p-6 text-center">
        {/* 进度环 */}
        <div className="relative w-40 h-40 mx-auto mb-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80" cy="80" r="70"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-200 dark:text-slate-700"
            />
            <circle
              cx="80" cy="80" r="70"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * progress) / 100}
              strokeLinecap="round"
              className={mode === 'work' ? 'text-red-500' : mode === 'shortBreak' ? 'text-green-500' : 'text-blue-500'}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-slate-900 dark:text-white font-mono">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`p-4 rounded-full text-white ${
              mode === 'work' ? 'bg-red-500 hover:bg-red-600' 
              : mode === 'shortBreak' ? 'bg-green-500 hover:bg-green-600'
              : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <div className="w-11" /> {/* 占位 */}
        </div>
      </div>

      {/* 统计 */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-700/50 text-center text-sm text-slate-600 dark:text-slate-400">
        今日已完成 <span className="font-bold text-red-500">{completedPomodoros}</span> 个番茄钟
      </div>
    </div>
  );
}
