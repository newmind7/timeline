import { useMemo } from 'react';
import { 
  BarChart3, CheckCircle, Clock, AlertTriangle, 
  Calendar, TrendingUp, Zap, Target
} from 'lucide-react';
import { Event } from '../types';

interface QuickStatsProps {
  events: Event[];
}

export default function QuickStats({ events }: QuickStatsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 基础统计
    const total = events.length;
    const completed = events.filter(e => e.progress === 100).length;
    const inProgress = events.filter(e => e.progress > 0 && e.progress < 100).length;
    const notStarted = events.filter(e => e.progress === 0).length;

    // 今日
    const todayEvents = events.filter(e => e.date.startsWith(today));
    const todayCompleted = todayEvents.filter(e => e.progress === 100).length;

    // 本周
    const weekEvents = events.filter(e => new Date(e.date) >= weekAgo);
    const weekCompleted = weekEvents.filter(e => e.progress === 100).length;

    // 逾期
    const overdue = events.filter(e => 
      new Date(e.date) < now && e.progress < 100
    ).length;

    // 即将到来（7天内）
    const upcoming = events.filter(e => {
      const date = new Date(e.date);
      const diff = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= 7 && e.progress < 100;
    }).length;

    // 完成率
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const weekRate = weekEvents.length > 0 
      ? Math.round((weekCompleted / weekEvents.length) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      todayEvents: todayEvents.length,
      todayCompleted,
      weekEvents: weekEvents.length,
      weekCompleted,
      overdue,
      upcoming,
      completionRate,
      weekRate,
    };
  }, [events]);

  const statCards = [
    { 
      label: '总事件', 
      value: stats.total, 
      icon: Calendar, 
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    { 
      label: '已完成', 
      value: stats.completed, 
      icon: CheckCircle, 
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20'
    },
    { 
      label: '进行中', 
      value: stats.inProgress, 
      icon: Zap, 
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20'
    },
    { 
      label: '已逾期', 
      value: stats.overdue, 
      icon: AlertTriangle, 
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20'
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-500" />
          快捷统计
        </h3>
        <span className="text-xs text-slate-500">
          完成率 {stats.completionRate}%
        </span>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {statCards.map(card => (
          <div 
            key={card.label} 
            className={`p-2 rounded-lg ${card.bg} text-center`}
          >
            <card.icon className={`w-4 h-4 mx-auto ${card.color} mb-1`} />
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {card.value}
            </p>
            <p className="text-[10px] text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* 进度条 */}
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>今日 {stats.todayCompleted}/{stats.todayEvents}</span>
            <span>{stats.todayEvents > 0 ? Math.round((stats.todayCompleted / stats.todayEvents) * 100) : 0}%</span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
              style={{ 
                width: `${stats.todayEvents > 0 ? (stats.todayCompleted / stats.todayEvents) * 100 : 0}%` 
              }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>本周 {stats.weekCompleted}/{stats.weekEvents}</span>
            <span>{stats.weekRate}%</span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
              style={{ width: `${stats.weekRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* 快捷信息 */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <Clock className="w-4 h-4 text-purple-500" />
          <div>
            <p className="text-xs text-slate-500">即将到来</p>
            <p className="font-medium text-slate-900 dark:text-white">{stats.upcoming} 个</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <Target className="w-4 h-4 text-slate-500" />
          <div>
            <p className="text-xs text-slate-500">未开始</p>
            <p className="font-medium text-slate-900 dark:text-white">{stats.notStarted} 个</p>
          </div>
        </div>
      </div>
    </div>
  );
}
