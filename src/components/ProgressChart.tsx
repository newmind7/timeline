import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Event } from '../types';
import { getEventStatus } from '../utils/dateUtils';

interface ProgressChartProps {
  events: Event[];
}

export default function ProgressChart({ events }: ProgressChartProps) {
  // 计算最近7天的完成情况
  const weeklyStats = useMemo(() => {
    const stats: { date: string; completed: number; total: number; avgProgress: number }[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEvents = events.filter(e => e.date.startsWith(dateStr));
      const completed = dayEvents.filter(e => e.progress === 100).length;
      const avgProgress = dayEvents.length > 0 
        ? Math.round(dayEvents.reduce((sum, e) => sum + e.progress, 0) / dayEvents.length)
        : 0;

      stats.push({
        date: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
        completed,
        total: dayEvents.length,
        avgProgress,
      });
    }
    
    return stats;
  }, [events]);

  // 计算趋势
  const trend = useMemo(() => {
    if (weeklyStats.length < 2) return 'stable';
    const recent = weeklyStats.slice(-3).reduce((sum, s) => sum + s.avgProgress, 0) / 3;
    const earlier = weeklyStats.slice(0, 3).reduce((sum, s) => sum + s.avgProgress, 0) / 3;
    if (recent > earlier + 5) return 'up';
    if (recent < earlier - 5) return 'down';
    return 'stable';
  }, [weeklyStats]);

  // 总体统计
  const overallStats = useMemo(() => {
    const total = events.length;
    const completed = events.filter(e => e.progress === 100).length;
    const overdue = events.filter(e => getEventStatus(e.date, e.progress) === 'overdue').length;
    const avgProgress = total > 0 
      ? Math.round(events.reduce((sum, e) => sum + e.progress, 0) / total)
      : 0;
    
    return { total, completed, overdue, avgProgress };
  }, [events]);

  const maxValue = Math.max(...weeklyStats.map(s => s.total), 5);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">进度趋势</h3>
        <div className={`flex items-center gap-1 text-sm ${
          trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-slate-400'
        }`}>
          {trend === 'up' && <><TrendingUp className="w-4 h-4" /> 上升</>}
          {trend === 'down' && <><TrendingDown className="w-4 h-4" /> 下降</>}
          {trend === 'stable' && <><Minus className="w-4 h-4" /> 稳定</>}
        </div>
      </div>

      {/* 柱状图 */}
      <div className="flex items-end justify-between gap-1 h-24 mb-2">
        {weeklyStats.map((stat, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col-reverse" style={{ height: '80px' }}>
              {/* 完成的部分 */}
              <div
                className="w-full bg-blue-500 rounded-t transition-all"
                style={{ height: `${(stat.completed / maxValue) * 100}%` }}
              />
              {/* 未完成的部分 */}
              <div
                className="w-full bg-slate-200 dark:bg-slate-600 rounded-t transition-all"
                style={{ height: `${((stat.total - stat.completed) / maxValue) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{stat.date}</span>
          </div>
        ))}
      </div>

      {/* 图例 */}
      <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-500" /> 已完成
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-600" /> 进行中
        </span>
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{overallStats.avgProgress}%</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">平均进度</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {overallStats.total > 0 ? Math.round((overallStats.completed / overallStats.total) * 100) : 0}%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">完成率</div>
        </div>
      </div>
    </div>
  );
}
