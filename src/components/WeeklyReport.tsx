import { useMemo, useState } from 'react';
import { FileText, ChevronLeft, ChevronRight, Download, TrendingUp, TrendingDown, CheckCircle, AlertTriangle } from 'lucide-react';
import { Event, EVENT_CATEGORIES } from '../types';
import { getEventStatus } from '../utils/dateUtils';

interface WeeklyReportProps {
  events: Event[];
}

export default function WeeklyReport({ events }: WeeklyReportProps) {
  const [weekOffset, setWeekOffset] = useState(0);

  // 获取指定周的日期范围
  const weekRange = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + (weekOffset * 7));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return { start: startOfWeek, end: endOfWeek };
  }, [weekOffset]);

  // 获取周内事件
  const weekEvents = useMemo(() => {
    const startStr = weekRange.start.toISOString().split('T')[0];
    const endStr = weekRange.end.toISOString().split('T')[0];
    return events.filter(e => {
      const dateStr = e.date.split('T')[0];
      return dateStr >= startStr && dateStr <= endStr;
    });
  }, [events, weekRange]);

  // 计算统计数据
  const stats = useMemo(() => {
    const total = weekEvents.length;
    const completed = weekEvents.filter(e => e.progress === 100).length;
    const overdue = weekEvents.filter(e => getEventStatus(e.date, e.progress) === 'overdue').length;
    const avgProgress = total > 0 
      ? Math.round(weekEvents.reduce((sum, e) => sum + e.progress, 0) / total)
      : 0;
    
    // 按分类统计
    const byCategory: Record<string, number> = {};
    weekEvents.forEach(e => {
      const cat = e.category || 'other';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });
    
    // 按天统计
    const byDay: { day: string; count: number; completed: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekRange.start);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayEvents = weekEvents.filter(e => e.date.startsWith(dateStr));
      byDay.push({
        day: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()],
        count: dayEvents.length,
        completed: dayEvents.filter(e => e.progress === 100).length,
      });
    }
    
    return { total, completed, overdue, avgProgress, byCategory, byDay };
  }, [weekEvents, weekRange]);

  // 格式化日期
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  // 导出报告
  const exportReport = () => {
    const report = `
# 周报 ${formatDate(weekRange.start)} - ${formatDate(weekRange.end)}

## 📊 总览
- 总事件数: ${stats.total}
- 已完成: ${stats.completed}
- 已逾期: ${stats.overdue}
- 平均进度: ${stats.avgProgress}%
- 完成率: ${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%

## 📅 每日分布
${stats.byDay.map(d => `- 周${d.day}: ${d.count}个事件, ${d.completed}个完成`).join('\n')}

## 🏷️ 分类统计
${Object.entries(stats.byCategory).map(([cat, count]) => {
  const catInfo = EVENT_CATEGORIES.find(c => c.value === cat);
  return `- ${catInfo?.icon || '📌'} ${catInfo?.label || cat}: ${count}个`;
}).join('\n')}

## 📝 事件列表
${weekEvents.map(e => `- [${e.progress === 100 ? '✓' : ' '}] ${e.title} (${e.progress}%)`).join('\n')}
    `.trim();

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `周报_${formatDate(weekRange.start)}_${formatDate(weekRange.end)}.md`;
    a.click();
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" />
          周报
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset(w => w - 1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {formatDate(weekRange.start)} - {formatDate(weekRange.end)}
          </span>
          <button 
            onClick={() => setWeekOffset(w => Math.min(0, w + 1))} 
            disabled={weekOffset >= 0}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* 快速统计 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-lg font-bold">{stats.completed}</span>
          </div>
          <div className="text-xs text-green-600/70 dark:text-green-400/70">已完成</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-lg font-bold">{stats.overdue}</span>
          </div>
          <div className="text-xs text-red-600/70 dark:text-red-400/70">已逾期</div>
        </div>
      </div>

      {/* 完成率 */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-500 dark:text-slate-400">完成率</span>
          <span className={`font-medium ${completionRate >= 80 ? 'text-green-600' : completionRate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
            {completionRate}%
          </span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all ${
              completionRate >= 80 ? 'bg-green-500' : completionRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* 每日分布图 */}
      <div className="mb-4">
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">每日事件</div>
        <div className="flex items-end justify-between gap-1 h-16">
          {stats.byDay.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col-reverse" style={{ height: '40px' }}>
                <div
                  className="w-full bg-indigo-500 rounded-t"
                  style={{ height: `${day.count ? (day.completed / Math.max(...stats.byDay.map(d => d.count || 1))) * 100 : 0}%` }}
                />
                <div
                  className="w-full bg-slate-200 dark:bg-slate-600 rounded-t"
                  style={{ height: `${day.count ? ((day.count - day.completed) / Math.max(...stats.byDay.map(d => d.count || 1))) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 mt-1">{day.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 分类分布 */}
      {Object.keys(stats.byCategory).length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">分类分布</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(stats.byCategory).map(([cat, count]) => {
              const catInfo = EVENT_CATEGORIES.find(c => c.value === cat);
              return (
                <span key={cat} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded">
                  {catInfo?.icon} {count}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* 导出按钮 */}
      <button
        onClick={exportReport}
        disabled={stats.total === 0}
        className="w-full py-2 text-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4" />
        导出周报
      </button>
    </div>
  );
}
