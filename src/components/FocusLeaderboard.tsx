import { useState, useMemo } from 'react';
import { Trophy, Clock, Flame, Medal, Crown, Star, TrendingUp } from 'lucide-react';

interface FocusSession {
  date: string;
  duration: number; // 分钟
  type: 'work' | 'break';
}

export default function FocusLeaderboard() {
  const [sessions] = useState<FocusSession[]>(() => {
    const saved = localStorage.getItem('focusSessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');

  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const workSessions = sessions.filter(s => s.type === 'work');
    
    let filteredSessions = workSessions;
    if (period === 'week') {
      filteredSessions = workSessions.filter(s => new Date(s.date) >= weekAgo);
    } else if (period === 'month') {
      filteredSessions = workSessions.filter(s => new Date(s.date) >= monthAgo);
    }

    // 总专注时间
    const totalMinutes = filteredSessions.reduce((sum, s) => sum + s.duration, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    // 按日统计
    const dailyStats: Record<string, number> = {};
    filteredSessions.forEach(s => {
      const date = s.date.split('T')[0];
      dailyStats[date] = (dailyStats[date] || 0) + s.duration;
    });

    // 最高专注日
    const sortedDays = Object.entries(dailyStats).sort((a, b) => b[1] - a[1]);
    const bestDay = sortedDays[0];
    
    // 平均每日
    const activeDays = Object.keys(dailyStats).length;
    const avgPerDay = activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0;

    // 连续天数
    let streak = 0;
    let checkDate = new Date();
    const dates = Object.keys(dailyStats).sort().reverse();
    
    for (let i = 0; i < 30; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (dailyStats[dateStr]) {
        streak++;
      } else if (streak > 0) {
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // 本周每日数据
    const weekData: { day: string; minutes: number }[] = [];
    const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      weekData.push({
        day: dayNames[date.getDay()],
        minutes: dailyStats[dateStr] || 0,
      });
    }

    return {
      totalMinutes,
      totalHours,
      remainingMinutes,
      sessionCount: filteredSessions.length,
      bestDay: bestDay ? { date: bestDay[0], minutes: bestDay[1] } : null,
      avgPerDay,
      streak,
      weekData,
      activeDays,
    };
  }, [sessions, period]);

  const getLevel = (totalHours: number) => {
    if (totalHours >= 100) return { name: '专注大师', icon: Crown, color: 'text-yellow-500' };
    if (totalHours >= 50) return { name: '专注达人', icon: Medal, color: 'text-purple-500' };
    if (totalHours >= 20) return { name: '专注爱好者', icon: Star, color: 'text-blue-500' };
    if (totalHours >= 5) return { name: '专注新手', icon: Flame, color: 'text-orange-500' };
    return { name: '刚刚起步', icon: Clock, color: 'text-slate-500' };
  };

  const level = getLevel(stats.totalHours);
  const maxMinutes = Math.max(...stats.weekData.map(d => d.minutes), 1);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          专注排行
        </h3>
        <div className="flex gap-1">
          {(['week', 'month', 'all'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2 py-1 text-xs rounded ${
                period === p
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {p === 'week' ? '本周' : p === 'month' ? '本月' : '全部'}
            </button>
          ))}
        </div>
      </div>

      {/* 等级展示 */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg">
        <div className={`p-2 rounded-lg bg-white dark:bg-slate-700 ${level.color}`}>
          <level.icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">{level.name}</p>
          <p className="text-xs text-slate-500">累计专注 {stats.totalHours}h {stats.remainingMinutes}m</p>
        </div>
        {stats.streak > 0 && (
          <div className="ml-auto flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs">
            <Flame className="w-3 h-3" />
            {stats.streak}天连续
          </div>
        )}
      </div>

      {/* 本周趋势 */}
      <div className="mb-4">
        <p className="text-xs text-slate-500 mb-2">本周趋势</p>
        <div className="flex items-end justify-between h-16 gap-1">
          {stats.weekData.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className="w-full bg-gradient-to-t from-amber-400 to-orange-400 rounded-t transition-all"
                style={{ 
                  height: `${(day.minutes / maxMinutes) * 100}%`,
                  minHeight: day.minutes > 0 ? '4px' : '0'
                }}
              />
              <span className="text-[10px] text-slate-400">{day.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.sessionCount}</p>
          <p className="text-xs text-slate-500">番茄数</p>
        </div>
        <div className="text-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.avgPerDay}</p>
          <p className="text-xs text-slate-500">日均(分钟)</p>
        </div>
        <div className="text-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.activeDays}</p>
          <p className="text-xs text-slate-500">活跃天数</p>
        </div>
      </div>

      {/* 最佳日 */}
      {stats.bestDay && (
        <div className="mt-3 flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            最佳日: {new Date(stats.bestDay.date).toLocaleDateString()} - {stats.bestDay.minutes}分钟
          </span>
        </div>
      )}
    </div>
  );
}
