import { useState, useEffect, useMemo } from 'react';
import { Timer, Flame, TrendingUp, Target, Award, Clock } from 'lucide-react';

interface FocusSession {
  date: string;
  duration: number; // minutes
  completed: boolean;
  type: 'work' | 'break';
}

export default function FocusStats() {
  const [sessions, setSessions] = useState<FocusSession[]>(() => {
    const saved = localStorage.getItem('focusSessions');
    return saved ? JSON.parse(saved) : [];
  });

  // 监听番茄钟完成事件
  useEffect(() => {
    const handlePomodoroComplete = (e: CustomEvent<{ duration: number; type: 'work' | 'break' }>) => {
      const newSession: FocusSession = {
        date: new Date().toISOString(),
        duration: e.detail.duration,
        completed: true,
        type: e.detail.type,
      };
      setSessions(prev => {
        const updated = [...prev, newSession];
        localStorage.setItem('focusSessions', JSON.stringify(updated));
        return updated;
      });
    };

    window.addEventListener('pomodoro-complete', handlePomodoroComplete as EventListener);
    return () => {
      window.removeEventListener('pomodoro-complete', handlePomodoroComplete as EventListener);
    };
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const workSessions = sessions.filter(s => s.type === 'work' && s.completed);
    
    const todaySessions = workSessions.filter(s => s.date.startsWith(today));
    const weekSessions = workSessions.filter(s => new Date(s.date) >= weekAgo);
    const monthSessions = workSessions.filter(s => new Date(s.date) >= monthAgo);

    const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    const weekMinutes = weekSessions.reduce((sum, s) => sum + s.duration, 0);
    const monthMinutes = monthSessions.reduce((sum, s) => sum + s.duration, 0);

    // 计算连续天数
    const sessionDates = [...new Set(workSessions.map(s => s.date.split('T')[0]))].sort().reverse();
    let streak = 0;
    let checkDate = new Date(today);
    
    for (const date of sessionDates) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (date === dateStr) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (date < dateStr) {
        break;
      }
    }

    // 最近7天的分布
    const last7Days: { date: string; day: string; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayMinutes = workSessions
        .filter(s => s.date.startsWith(dateStr))
        .reduce((sum, s) => sum + s.duration, 0);
      
      last7Days.push({
        date: dateStr,
        day: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
        minutes: dayMinutes,
      });
    }

    const maxDayMinutes = Math.max(...last7Days.map(d => d.minutes), 1);

    return {
      todayCount: todaySessions.length,
      todayMinutes,
      weekCount: weekSessions.length,
      weekMinutes,
      monthMinutes,
      streak,
      totalSessions: workSessions.length,
      totalMinutes: workSessions.reduce((sum, s) => sum + s.duration, 0),
      last7Days,
      maxDayMinutes,
    };
  }, [sessions]);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  // 模拟添加测试数据（开发用）
  const addTestSession = () => {
    const testSession: FocusSession = {
      date: new Date().toISOString(),
      duration: 25,
      completed: true,
      type: 'work',
    };
    setSessions(prev => {
      const updated = [...prev, testSession];
      localStorage.setItem('focusSessions', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Timer className="w-4 h-4 text-red-500" />
          专注统计
        </h3>
        {stats.streak > 0 && (
          <div className="flex items-center gap-1 text-orange-500">
            <Flame className="w-4 h-4" />
            <span className="text-sm font-medium">{stats.streak}天</span>
          </div>
        )}
      </div>

      {/* 今日统计 */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1">今日专注</p>
            <p className="text-xl font-bold text-red-600">
              {stats.todayCount} <span className="text-sm font-normal">个番茄</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-1">专注时长</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {formatTime(stats.todayMinutes)}
            </p>
          </div>
        </div>
      </div>

      {/* 本周图表 */}
      <div className="mb-4">
        <div className="text-xs text-slate-500 mb-2">本周专注</div>
        <div className="flex items-end gap-1 h-12">
          {stats.last7Days.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div 
                className={`w-full rounded-t transition-all ${
                  day.date === new Date().toISOString().split('T')[0]
                    ? 'bg-red-500'
                    : 'bg-red-300 dark:bg-red-700'
                }`}
                style={{ 
                  height: `${(day.minutes / stats.maxDayMinutes) * 100}%`,
                  minHeight: day.minutes > 0 ? '4px' : '0'
                }}
                title={`${day.date}: ${day.minutes}分钟`}
              />
              <div className="text-[10px] text-slate-400 mt-1">{day.day}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
          <span className="text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            本周
          </span>
          <span className="font-medium text-slate-900 dark:text-white">
            {stats.weekCount}个 · {formatTime(stats.weekMinutes)}
          </span>
        </div>
        <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
          <span className="text-slate-500 flex items-center gap-1">
            <Award className="w-3 h-3" />
            累计
          </span>
          <span className="font-medium text-slate-900 dark:text-white">
            {stats.totalSessions}个
          </span>
        </div>
      </div>

      {/* 空状态 */}
      {stats.totalSessions === 0 && (
        <div className="text-center py-4 text-slate-400 mt-2">
          <Timer className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">使用番茄钟开始专注</p>
          <p className="text-xs">完成番茄后这里会记录统计</p>
        </div>
      )}
    </div>
  );
}
