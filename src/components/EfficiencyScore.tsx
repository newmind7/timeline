import { useMemo } from 'react';
import { Gauge, TrendingUp, TrendingDown, Minus, Award, Zap, Target, Clock } from 'lucide-react';
import { Event } from '../types';

interface EfficiencyScoreProps {
  events: Event[];
}

export default function EfficiencyScore({ events }: EfficiencyScoreProps) {
  const scores = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // 今日事件
    const todayEvents = events.filter(e => e.date.startsWith(today));
    const todayCompleted = todayEvents.filter(e => e.progress === 100);
    
    // 本周事件
    const thisWeekEvents = events.filter(e => new Date(e.date) >= weekAgo);
    const thisWeekCompleted = thisWeekEvents.filter(e => e.progress === 100);
    
    // 上周事件（用于对比）
    const lastWeekEvents = events.filter(e => {
      const date = new Date(e.date);
      return date >= twoWeeksAgo && date < weekAgo;
    });
    const lastWeekCompleted = lastWeekEvents.filter(e => e.progress === 100);

    // 计算完成率
    const todayRate = todayEvents.length > 0 
      ? (todayCompleted.length / todayEvents.length) * 100 : 0;
    const weekRate = thisWeekEvents.length > 0 
      ? (thisWeekCompleted.length / thisWeekEvents.length) * 100 : 0;
    const lastWeekRate = lastWeekEvents.length > 0 
      ? (lastWeekCompleted.length / lastWeekEvents.length) * 100 : 0;

    // 计算逾期率
    const overdueEvents = thisWeekEvents.filter(e => 
      new Date(e.date) < now && e.progress < 100
    );
    const overdueRate = thisWeekEvents.length > 0 
      ? (overdueEvents.length / thisWeekEvents.length) * 100 : 0;

    // 计算平均进度
    const avgProgress = thisWeekEvents.length > 0
      ? thisWeekEvents.reduce((sum, e) => sum + e.progress, 0) / thisWeekEvents.length
      : 0;

    // 综合评分（100分制）
    // 完成率权重40%，逾期惩罚20%，平均进度40%
    const baseScore = (weekRate * 0.4) + (avgProgress * 0.4) + ((100 - overdueRate) * 0.2);
    const finalScore = Math.round(Math.max(0, Math.min(100, baseScore)));

    // 周环比
    const weekChange = weekRate - lastWeekRate;

    return {
      todayRate: Math.round(todayRate),
      weekRate: Math.round(weekRate),
      overdueRate: Math.round(overdueRate),
      avgProgress: Math.round(avgProgress),
      finalScore,
      weekChange: Math.round(weekChange),
      todayCompleted: todayCompleted.length,
      todayTotal: todayEvents.length,
      weekCompleted: thisWeekCompleted.length,
      weekTotal: thisWeekEvents.length,
    };
  }, [events]);

  const getScoreLevel = (score: number) => {
    if (score >= 90) return { label: 'S', color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' };
    if (score >= 80) return { label: 'A', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' };
    if (score >= 70) return { label: 'B', color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' };
    if (score >= 60) return { label: 'C', color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' };
    return { label: 'D', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' };
  };

  const level = getScoreLevel(scores.finalScore);

  const getTrendIcon = (change: number) => {
    if (change > 5) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < -5) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getAdvice = () => {
    if (scores.overdueRate > 30) return '💡 建议优先处理逾期任务';
    if (scores.avgProgress < 50) return '💡 尝试将大任务拆分成小步骤';
    if (scores.weekRate < 50) return '💡 设定更小的每日目标';
    if (scores.finalScore >= 80) return '🎉 太棒了！保持这个节奏';
    return '💡 每天完成1-2个小任务开始';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Gauge className="w-4 h-4 text-cyan-500" />
          效率评分
        </h3>
        <div className="flex items-center gap-1">
          {getTrendIcon(scores.weekChange)}
          <span className={`text-xs ${scores.weekChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {scores.weekChange >= 0 ? '+' : ''}{scores.weekChange}%
          </span>
        </div>
      </div>

      {/* 主分数 */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className={`w-20 h-20 rounded-full ${level.bg} flex items-center justify-center`}>
          <div className="text-center">
            <span className={`text-3xl font-bold ${level.color}`}>{level.label}</span>
            <p className="text-[10px] text-slate-500">{scores.finalScore}分</p>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-slate-600 dark:text-slate-400">完成率</span>
            <span className="font-medium text-slate-900 dark:text-white">{scores.weekRate}%</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-slate-600 dark:text-slate-400">平均进度</span>
            <span className="font-medium text-slate-900 dark:text-white">{scores.avgProgress}%</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-red-500" />
            <span className="text-slate-600 dark:text-slate-400">逾期率</span>
            <span className="font-medium text-slate-900 dark:text-white">{scores.overdueRate}%</span>
          </div>
        </div>
      </div>

      {/* 今日/本周统计 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
          <p className="text-xs text-slate-500">今日</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {scores.todayCompleted}/{scores.todayTotal}
          </p>
          <div className="h-1 bg-slate-200 dark:bg-slate-600 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-blue-500"
              style={{ width: `${scores.todayRate}%` }}
            />
          </div>
        </div>
        <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
          <p className="text-xs text-slate-500">本周</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {scores.weekCompleted}/{scores.weekTotal}
          </p>
          <div className="h-1 bg-slate-200 dark:bg-slate-600 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-green-500"
              style={{ width: `${scores.weekRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* 建议 */}
      <div className="p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
        <p className="text-xs text-cyan-700 dark:text-cyan-400">{getAdvice()}</p>
      </div>
    </div>
  );
}
