import { useState, useMemo } from 'react';
import { FileText, ChevronLeft, ChevronRight, Download, TrendingUp, TrendingDown, Minus, Award } from 'lucide-react';
import { Event, EVENT_CATEGORIES } from '../types';

interface WeeklySummaryProps {
  events: Event[];
}

export default function WeeklySummary({ events }: WeeklySummaryProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  const summary = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset + (weekOffset * 7));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // 本周事件
    const weekEvents = events.filter(e => {
      const date = new Date(e.date);
      return date >= monday && date <= sunday;
    });

    // 上周数据（用于对比）
    const lastMonday = new Date(monday);
    lastMonday.setDate(monday.getDate() - 7);
    const lastSunday = new Date(sunday);
    lastSunday.setDate(sunday.getDate() - 7);
    
    const lastWeekEvents = events.filter(e => {
      const date = new Date(e.date);
      return date >= lastMonday && date <= lastSunday;
    });

    // 统计
    const total = weekEvents.length;
    const completed = weekEvents.filter(e => e.progress === 100).length;
    const inProgress = weekEvents.filter(e => e.progress > 0 && e.progress < 100).length;
    const overdue = weekEvents.filter(e => new Date(e.date) < now && e.progress < 100).length;

    const lastTotal = lastWeekEvents.length;
    const lastCompleted = lastWeekEvents.filter(e => e.progress === 100).length;

    // 完成率
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const lastCompletionRate = lastTotal > 0 ? Math.round((lastCompleted / lastTotal) * 100) : 0;
    const rateChange = completionRate - lastCompletionRate;

    // 按分类统计
    const categoryStats = EVENT_CATEGORIES.map(cat => ({
      ...cat,
      count: weekEvents.filter(e => e.category === cat.value).length,
      completed: weekEvents.filter(e => e.category === cat.value && e.progress === 100).length,
    })).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

    // 按天统计
    const dayStats: { day: string; count: number; completed: number }[] = [];
    const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayEvents = weekEvents.filter(e => e.date.startsWith(dateStr));
      dayStats.push({
        day: dayNames[i],
        count: dayEvents.length,
        completed: dayEvents.filter(e => e.progress === 100).length,
      });
    }

    // 最佳日
    const bestDay = [...dayStats].sort((a, b) => b.completed - a.completed)[0];

    // 高亮事件（已完成的重要事件）
    const highlights = weekEvents
      .filter(e => e.progress === 100)
      .slice(0, 3);

    return {
      weekStart: monday.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      weekEnd: sunday.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      total,
      completed,
      inProgress,
      overdue,
      completionRate,
      rateChange,
      categoryStats,
      dayStats,
      bestDay,
      highlights,
    };
  }, [events, weekOffset]);

  const exportSummary = () => {
    const content = `
# 周报 ${summary.weekStart} - ${summary.weekEnd}

## 📊 概览
- 总事件: ${summary.total}
- 已完成: ${summary.completed}
- 进行中: ${summary.inProgress}
- 已逾期: ${summary.overdue}
- 完成率: ${summary.completionRate}%

## 📈 趋势
完成率较上周${summary.rateChange >= 0 ? '提升' : '下降'} ${Math.abs(summary.rateChange)}%

## 📁 分类统计
${summary.categoryStats.map(c => `- ${c.icon} ${c.label}: ${c.completed}/${c.count}`).join('\n')}

## 🏆 本周亮点
${summary.highlights.map(e => `- ✅ ${e.title}`).join('\n') || '暂无'}

## 📅 每日统计
${summary.dayStats.map(d => `- ${d.day}: ${d.completed}/${d.count}`).join('\n')}

---
生成时间: ${new Date().toLocaleString('zh-CN')}
    `.trim();

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `周报_${summary.weekStart}-${summary.weekEnd}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTrendIcon = () => {
    if (summary.rateChange > 5) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (summary.rateChange < -5) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-500" />
          周摘要
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>
          <span className="text-xs text-slate-500">
            {summary.weekStart} - {summary.weekEnd}
          </span>
          <button
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
            disabled={weekOffset >= 0}
          >
            <ChevronRight className={`w-4 h-4 ${weekOffset >= 0 ? 'text-slate-300' : 'text-slate-500'}`} />
          </button>
        </div>
      </div>

      {/* 完成率 */}
      <div className="flex items-center justify-between mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
        <div>
          <p className="text-xs text-slate-500">完成率</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {summary.completionRate}%
          </p>
        </div>
        <div className="flex items-center gap-1">
          {getTrendIcon()}
          <span className={`text-sm ${summary.rateChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {summary.rateChange >= 0 ? '+' : ''}{summary.rateChange}%
          </span>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
          <p className="text-lg font-bold text-slate-900 dark:text-white">{summary.total}</p>
          <p className="text-[10px] text-slate-500">总计</p>
        </div>
        <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{summary.completed}</p>
          <p className="text-[10px] text-slate-500">完成</p>
        </div>
        <div className="text-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{summary.inProgress}</p>
          <p className="text-[10px] text-slate-500">进行</p>
        </div>
        <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
          <p className="text-lg font-bold text-red-600 dark:text-red-400">{summary.overdue}</p>
          <p className="text-[10px] text-slate-500">逾期</p>
        </div>
      </div>

      {/* 最佳日 */}
      {summary.bestDay && summary.bestDay.completed > 0 && (
        <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4">
          <Award className="w-4 h-4 text-yellow-500" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            最佳日: {summary.bestDay.day} ({summary.bestDay.completed}个完成)
          </span>
        </div>
      )}

      {/* 导出按钮 */}
      <button
        onClick={exportSummary}
        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4" />
        导出周报
      </button>
    </div>
  );
}
