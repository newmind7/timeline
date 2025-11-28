import { useMemo } from 'react';
import { PieChart, BarChart3 } from 'lucide-react';
import { Event, EVENT_CATEGORIES } from '../types';
import { getEventStatus } from '../utils/dateUtils';

interface TimeDistributionProps {
  events: Event[];
}

export default function TimeDistribution({ events }: TimeDistributionProps) {
  // 按月份统计
  const monthlyStats = useMemo(() => {
    const stats: { month: string; count: number }[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const count = events.filter(e => e.date.startsWith(monthStr)).length;
      stats.push({
        month: d.toLocaleDateString('zh-CN', { month: 'short' }),
        count,
      });
    }
    return stats;
  }, [events]);

  // 按状态统计
  const statusStats = useMemo(() => {
    const stats = {
      completed: 0,
      overdue: 0,
      today: 0,
      upcoming: 0,
    };
    events.forEach(e => {
      const status = getEventStatus(e.date, e.progress);
      stats[status as keyof typeof stats]++;
    });
    return stats;
  }, [events]);

  // 按分类统计
  const categoryStats = useMemo(() => {
    const stats: { category: string; icon: string; count: number; color: string }[] = [];
    const counts: Record<string, number> = {};
    
    events.forEach(e => {
      const cat = e.category || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    
    EVENT_CATEGORIES.forEach(cat => {
      if (counts[cat.value]) {
        stats.push({
          category: cat.label,
          icon: cat.icon,
          count: counts[cat.value],
          color: cat.color,
        });
      }
    });
    
    return stats.sort((a, b) => b.count - a.count);
  }, [events]);

  const totalEvents = events.length;
  const maxMonthly = Math.max(...monthlyStats.map(s => s.count), 1);

  const statusColors = {
    completed: { bg: 'bg-blue-500', text: 'text-blue-600' },
    overdue: { bg: 'bg-red-500', text: 'text-red-600' },
    today: { bg: 'bg-amber-500', text: 'text-amber-600' },
    upcoming: { bg: 'bg-green-500', text: 'text-green-600' },
  };

  const statusLabels = {
    completed: '已完成',
    overdue: '已逾期',
    today: '今天',
    upcoming: '即将到来',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-cyan-500" />
        <h3 className="font-semibold text-slate-900 dark:text-white">事件分布</h3>
      </div>

      {/* 状态饼图 */}
      <div className="mb-4">
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">状态分布</div>
        <div className="flex items-center gap-4">
          {/* 简易饼图 */}
          <div className="relative w-16 h-16">
            <svg className="w-full h-full transform -rotate-90">
              {(() => {
                let offset = 0;
                const total = Object.values(statusStats).reduce((a, b) => a + b, 0) || 1;
                return Object.entries(statusStats).map(([status, count]) => {
                  const percentage = (count / total) * 100;
                  const strokeDasharray = `${percentage} ${100 - percentage}`;
                  const currentOffset = offset;
                  offset += percentage;
                  return (
                    <circle
                      key={status}
                      cx="32" cy="32" r="28"
                      fill="none"
                      strokeWidth="8"
                      stroke={status === 'completed' ? '#3b82f6' : status === 'overdue' ? '#ef4444' : status === 'today' ? '#f59e0b' : '#22c55e'}
                      strokeDasharray={`${percentage * 1.76} 176`}
                      strokeDashoffset={`${-currentOffset * 1.76}`}
                    />
                  );
                });
              })()}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{totalEvents}</span>
            </div>
          </div>
          
          {/* 图例 */}
          <div className="flex-1 grid grid-cols-2 gap-1 text-xs">
            {Object.entries(statusStats).map(([status, count]) => (
              <div key={status} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${statusColors[status as keyof typeof statusColors].bg}`} />
                <span className="text-slate-600 dark:text-slate-400">{statusLabels[status as keyof typeof statusLabels]}</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 月度趋势 */}
      <div className="mb-4">
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">月度趋势</div>
        <div className="flex items-end justify-between gap-1 h-20">
          {monthlyStats.map((stat, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-cyan-500 rounded-t transition-all hover:bg-cyan-600"
                style={{ height: `${(stat.count / maxMonthly) * 60}px` }}
              />
              <span className="text-xs text-slate-400 mt-1">{stat.month}</span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{stat.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 分类排行 */}
      {categoryStats.length > 0 && (
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">分类排行</div>
          <div className="space-y-2">
            {categoryStats.slice(0, 5).map((stat, i) => (
              <div key={stat.category} className="flex items-center gap-2">
                <span className="text-sm">{stat.icon}</span>
                <span className="text-xs text-slate-600 dark:text-slate-400 w-12">{stat.category}</span>
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${(stat.count / categoryStats[0].count) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-6 text-right">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="text-center py-4 text-slate-400">
          <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">暂无事件数据</p>
        </div>
      )}
    </div>
  );
}
