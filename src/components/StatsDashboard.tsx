import { useMemo } from 'react';
import { 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Target,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Event } from '../types';
import { getEventStatus } from '../utils/dateUtils';

interface StatsDashboardProps {
  events: Event[];
}

export default function StatsDashboard({ events }: StatsDashboardProps) {
  const stats = useMemo(() => {
    if (events.length === 0) return null;

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisWeek = new Date(now);
    thisWeek.setDate(now.getDate() - now.getDay());

    // 状态统计
    let completed = 0;
    let overdue = 0;
    let upcoming = 0;
    let today = 0;

    // 进度统计
    let totalProgress = 0;
    
    // 本月/本周统计
    let thisMonthEvents = 0;
    let thisWeekEvents = 0;

    events.forEach(event => {
      const status = getEventStatus(event.date, event.progress);
      const eventDate = new Date(event.date);

      switch (status) {
        case 'completed': completed++; break;
        case 'overdue': overdue++; break;
        case 'upcoming': upcoming++; break;
        case 'today': today++; break;
      }

      totalProgress += event.progress;

      if (eventDate >= thisMonth) thisMonthEvents++;
      if (eventDate >= thisWeek) thisWeekEvents++;
    });

    const avgProgress = Math.round(totalProgress / events.length);
    const completionRate = Math.round((completed / events.length) * 100);

    // 颜色分布
    const colorCounts: Record<string, number> = {};
    events.forEach(e => {
      colorCounts[e.color] = (colorCounts[e.color] || 0) + 1;
    });

    return {
      total: events.length,
      completed,
      overdue,
      upcoming,
      today,
      avgProgress,
      completionRate,
      thisMonthEvents,
      thisWeekEvents,
      colorCounts,
    };
  }, [events]);

  if (!stats) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="text-center text-slate-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-2 text-slate-300" />
          <p>暂无数据统计</p>
          <p className="text-sm">添加一些事件后查看统计</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-slate-800">数据统计</h3>
      </div>

      {/* 主要指标 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5" />
            <span className="text-sm opacity-90">完成率</span>
          </div>
          <div className="text-3xl font-bold">{stats.completionRate}%</div>
          <div className="text-xs opacity-75 mt-1">{stats.completed}/{stats.total} 个事件</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm opacity-90">平均进度</span>
          </div>
          <div className="text-3xl font-bold">{stats.avgProgress}%</div>
          <div className="text-xs opacity-75 mt-1">所有事件平均</div>
        </div>
      </div>

      {/* 状态分布 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-600 mb-3">状态分布</h4>
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <CheckCircle className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-blue-700">{stats.completed}</div>
            <div className="text-xs text-blue-600">已完成</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 text-center">
            <Clock className="w-5 h-5 text-amber-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-amber-700">{stats.today}</div>
            <div className="text-xs text-amber-600">今天</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <Calendar className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-green-700">{stats.upcoming}</div>
            <div className="text-xs text-green-600">即将到来</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-red-700">{stats.overdue}</div>
            <div className="text-xs text-red-600">已逾期</div>
          </div>
        </div>
      </div>

      {/* 时间分布 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-600 mb-3">时间分布</h4>
        <div className="flex gap-4">
          <div className="flex-1 bg-slate-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-slate-800">{stats.thisWeekEvents}</div>
            <div className="text-xs text-slate-500">本周事件</div>
          </div>
          <div className="flex-1 bg-slate-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-slate-800">{stats.thisMonthEvents}</div>
            <div className="text-xs text-slate-500">本月事件</div>
          </div>
        </div>
      </div>

      {/* 进度可视化 */}
      <div>
        <h4 className="text-sm font-medium text-slate-600 mb-3">整体进度</h4>
        <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
            style={{ width: `${stats.avgProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>0%</span>
          <span>平均进度 {stats.avgProgress}%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
