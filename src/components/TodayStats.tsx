import { useMemo } from 'react';
import { 
  Calendar, CheckCircle, Clock, AlertTriangle, 
  TrendingUp, Zap, Target, Award
} from 'lucide-react';
import { Event } from '../types';
import { getEventStatus } from '../utils/dateUtils';

interface TodayStatsProps {
  events: Event[];
}

export default function TodayStats({ events }: TodayStatsProps) {
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    // 今日事件
    const todayEvents = events.filter(e => e.date.startsWith(today));
    const todayCompleted = todayEvents.filter(e => e.progress === 100);
    
    // 本周事件
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const thisWeekEvents = events.filter(e => new Date(e.date) >= weekStart);
    const thisWeekCompleted = thisWeekEvents.filter(e => e.progress === 100);
    
    // 逾期事件
    const overdue = events.filter(e => getEventStatus(e.date) === 'overdue' && e.progress < 100);
    
    // 进行中
    const inProgress = events.filter(e => e.progress > 0 && e.progress < 100);
    
    // 即将到来（7天内）
    const upcoming = events.filter(e => {
      const eventDate = new Date(e.date);
      const diff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= 7 && e.progress < 100;
    });

    // 连续完成天数
    let streak = 0;
    let checkDate = new Date(today);
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const dayEvents = events.filter(e => e.date.startsWith(dateStr));
      const dayCompleted = dayEvents.filter(e => e.progress === 100);
      
      if (dayEvents.length > 0 && dayCompleted.length === dayEvents.length) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dayEvents.length === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        if (streak === 0) continue; // 跳过没有事件的日子
      } else {
        break;
      }
      
      if (streak > 30) break; // 最多追溯30天
    }

    return {
      todayTotal: todayEvents.length,
      todayCompleted: todayCompleted.length,
      todayProgress: todayEvents.length > 0 
        ? Math.round((todayCompleted.length / todayEvents.length) * 100) 
        : 0,
      weekTotal: thisWeekEvents.length,
      weekCompleted: thisWeekCompleted.length,
      weekProgress: thisWeekEvents.length > 0
        ? Math.round((thisWeekCompleted.length / thisWeekEvents.length) * 100)
        : 0,
      overdue: overdue.length,
      inProgress: inProgress.length,
      upcoming: upcoming.length,
      streak,
    };
  }, [events]);

  const cards = [
    {
      title: '今日任务',
      value: `${stats.todayCompleted}/${stats.todayTotal}`,
      subtitle: stats.todayTotal > 0 ? `完成 ${stats.todayProgress}%` : '暂无任务',
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: '本周进度',
      value: `${stats.weekProgress}%`,
      subtitle: `${stats.weekCompleted}/${stats.weekTotal} 已完成`,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: '进行中',
      value: stats.inProgress,
      subtitle: '持续努力中',
      icon: Zap,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      title: '即将到来',
      value: stats.upcoming,
      subtitle: '7天内',
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-500" />
          今日概览
        </h3>
        {stats.streak > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs rounded-full">
            <Award className="w-3 h-3" />
            {stats.streak}天连胜
          </div>
        )}
      </div>

      {/* 统计卡片网格 */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card, index) => (
          <div
            key={card.title}
            className={`relative overflow-hidden rounded-xl p-3 ${card.bgColor}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{card.title}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {card.value}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {card.subtitle}
                </p>
              </div>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color}`}>
                <card.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            
            {/* 装饰圆 */}
            <div className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br ${card.color} opacity-10`} />
          </div>
        ))}
      </div>

      {/* 逾期警告 */}
      {stats.overdue > 0 && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              {stats.overdue} 个事件已逾期
            </p>
            <p className="text-xs text-red-500">建议尽快处理或重新安排</p>
          </div>
        </div>
      )}

      {/* 全部完成提示 */}
      {stats.todayTotal > 0 && stats.todayCompleted === stats.todayTotal && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              🎉 今日任务全部完成！
            </p>
            <p className="text-xs text-green-500">太棒了，继续保持！</p>
          </div>
        </div>
      )}
    </div>
  );
}
