import { useState, useMemo } from 'react';
import { Calendar, TrendingUp, Trophy, Target, ChevronLeft, ChevronRight, Download, BarChart3 } from 'lucide-react';
import { Event, EVENT_CATEGORIES } from '../types';

interface PeriodSummaryProps {
  events: Event[];
}

type Period = 'month' | 'year';

export default function PeriodSummary({ events }: PeriodSummaryProps) {
  const [period, setPeriod] = useState<Period>('month');
  const [offset, setOffset] = useState(0); // 0 = current, -1 = previous, etc.

  const periodData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let label: string;

    if (period === 'month') {
      const targetMonth = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      startDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
      endDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
      label = `${targetMonth.getFullYear()}年${targetMonth.getMonth() + 1}月`;
    } else {
      const targetYear = now.getFullYear() + offset;
      startDate = new Date(targetYear, 0, 1);
      endDate = new Date(targetYear, 11, 31);
      label = `${targetYear}年`;
    }

    // 筛选时间段内的事件
    const periodEvents = events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate >= startDate && eventDate <= endDate;
    });

    const completed = periodEvents.filter(e => e.progress === 100);
    const completionRate = periodEvents.length > 0 
      ? Math.round((completed.length / periodEvents.length) * 100) 
      : 0;

    // 按分类统计
    const categoryStats: Record<string, { total: number; completed: number }> = {};
    periodEvents.forEach(e => {
      const cat = e.category || 'other';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { total: 0, completed: 0 };
      }
      categoryStats[cat].total++;
      if (e.progress === 100) {
        categoryStats[cat].completed++;
      }
    });

    // 找出最活跃的分类
    const topCategory = Object.entries(categoryStats)
      .sort((a, b) => b[1].total - a[1].total)[0];

    // 计算日均事件数
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const avgPerDay = (periodEvents.length / totalDays).toFixed(1);

    // 按周统计（用于月度）或按月统计（用于年度）
    const trendData: { label: string; count: number }[] = [];
    if (period === 'month') {
      // 按周统计
      for (let week = 0; week < 5; week++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(startDate.getDate() + week * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const weekEvents = periodEvents.filter(e => {
          const d = new Date(e.date);
          return d >= weekStart && d <= weekEnd;
        });
        
        trendData.push({
          label: `第${week + 1}周`,
          count: weekEvents.length,
        });
      }
    } else {
      // 按月统计
      for (let month = 0; month < 12; month++) {
        const monthEvents = periodEvents.filter(e => {
          const d = new Date(e.date);
          return d.getMonth() === month;
        });
        
        trendData.push({
          label: `${month + 1}月`,
          count: monthEvents.length,
        });
      }
    }

    const maxTrend = Math.max(...trendData.map(t => t.count), 1);

    return {
      label,
      startDate,
      endDate,
      total: periodEvents.length,
      completed: completed.length,
      completionRate,
      categoryStats,
      topCategory,
      avgPerDay,
      trendData,
      maxTrend,
    };
  }, [events, period, offset]);

  const getCategoryInfo = (catId: string) => {
    return EVENT_CATEGORIES.find(c => c.id === catId) || { icon: '📌', label: '其他' };
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-500" />
          周期总结
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setPeriod('month')}
            className={`px-2 py-1 text-xs rounded ${
              period === 'month' 
                ? 'bg-indigo-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            月度
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-2 py-1 text-xs rounded ${
              period === 'year' 
                ? 'bg-indigo-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            年度
          </button>
        </div>
      </div>

      {/* 时间导航 */}
      <div className="flex items-center justify-between mb-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2">
        <button
          onClick={() => setOffset(o => o - 1)}
          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-medium text-slate-900 dark:text-white">{periodData.label}</span>
        <button
          onClick={() => setOffset(o => Math.min(0, o + 1))}
          disabled={offset >= 0}
          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{periodData.total}</div>
          <div className="text-xs text-slate-500">总事件</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{periodData.completed}</div>
          <div className="text-xs text-slate-500">已完成</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">{periodData.completionRate}%</div>
          <div className="text-xs text-slate-500">完成率</div>
        </div>
      </div>

      {/* 趋势图 */}
      <div className="mb-4">
        <div className="text-xs text-slate-500 mb-2">事件趋势</div>
        <div className="flex items-end gap-1 h-16">
          {periodData.trendData.map((item, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-indigo-500 rounded-t transition-all hover:bg-indigo-600"
                style={{ height: `${(item.count / periodData.maxTrend) * 100}%`, minHeight: item.count > 0 ? '4px' : '0' }}
                title={`${item.label}: ${item.count}个事件`}
              />
              <div className="text-[10px] text-slate-400 mt-1 truncate w-full text-center">
                {period === 'year' ? item.label.replace('月', '') : item.label.replace('第', '').replace('周', '')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 分类统计 */}
      {periodData.topCategory && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">最活跃分类</span>
            <span className="flex items-center gap-1">
              <span>{getCategoryInfo(periodData.topCategory[0]).icon}</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {getCategoryInfo(periodData.topCategory[0]).label}
              </span>
              <span className="text-slate-400">({periodData.topCategory[1].total})</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-slate-500">日均事件</span>
            <span className="font-medium text-slate-900 dark:text-white">{periodData.avgPerDay}</span>
          </div>
        </div>
      )}

      {/* 空状态 */}
      {periodData.total === 0 && (
        <div className="text-center py-4 text-slate-400">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">该时段暂无事件记录</p>
        </div>
      )}
    </div>
  );
}
