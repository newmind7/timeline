import { useState, useMemo } from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, Target, Clock, 
  CheckCircle, AlertTriangle, Zap, Award, Calendar,
  ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';
import { Event, EVENT_CATEGORIES, PRIORITY_LEVELS } from '../types';
import { getEventStatus } from '../utils/dateUtils';

interface DataInsightsProps {
  events: Event[];
}

interface Insight {
  id: string;
  type: 'positive' | 'warning' | 'neutral' | 'tip';
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description: string;
  trend?: 'up' | 'down' | 'stable';
}

export default function DataInsights({ events }: DataInsightsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const insights = useMemo(() => {
    const result: Insight[] = [];
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // 时间段
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 基础统计
    const completed = events.filter(e => e.progress === 100);
    const overdue = events.filter(e => getEventStatus(e.date) === 'overdue' && e.progress < 100);
    const thisWeekEvents = events.filter(e => new Date(e.date) >= weekAgo);
    const lastWeekEvents = events.filter(e => new Date(e.date) >= lastWeekStart && new Date(e.date) < weekAgo);
    
    const completionRate = events.length > 0 ? (completed.length / events.length) * 100 : 0;
    const thisWeekCompleted = thisWeekEvents.filter(e => e.progress === 100).length;
    const lastWeekCompleted = lastWeekEvents.filter(e => e.progress === 100).length;

    // 1. 完成率分析
    result.push({
      id: 'completion-rate',
      type: completionRate >= 70 ? 'positive' : completionRate >= 40 ? 'neutral' : 'warning',
      icon: <Target className="w-4 h-4" />,
      title: '总体完成率',
      value: `${Math.round(completionRate)}%`,
      description: `${completed.length}/${events.length} 个事件已完成`,
      trend: thisWeekCompleted > lastWeekCompleted ? 'up' : thisWeekCompleted < lastWeekCompleted ? 'down' : 'stable',
    });

    // 2. 逾期分析
    if (overdue.length > 0) {
      const oldestOverdue = overdue.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
      const daysDiff = Math.floor((now.getTime() - new Date(oldestOverdue.date).getTime()) / (1000 * 60 * 60 * 24));
      result.push({
        id: 'overdue',
        type: 'warning',
        icon: <AlertTriangle className="w-4 h-4" />,
        title: '逾期事件',
        value: overdue.length,
        description: `最久逾期 ${daysDiff} 天`,
      });
    }

    // 3. 本周效率
    const weekEfficiency = thisWeekEvents.length > 0 
      ? (thisWeekCompleted / thisWeekEvents.length) * 100 
      : 0;
    result.push({
      id: 'week-efficiency',
      type: weekEfficiency >= 60 ? 'positive' : 'neutral',
      icon: <Zap className="w-4 h-4" />,
      title: '本周效率',
      value: `${Math.round(weekEfficiency)}%`,
      description: `完成 ${thisWeekCompleted} 个事件`,
      trend: thisWeekCompleted > lastWeekCompleted ? 'up' : 'down',
    });

    // 4. 平均完成时间
    const completedWithDates = completed.filter(e => e.created_at && e.updated_at);
    if (completedWithDates.length > 0) {
      const avgDays = completedWithDates.reduce((sum, e) => {
        const created = new Date(e.created_at);
        const updated = new Date(e.updated_at);
        return sum + (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      }, 0) / completedWithDates.length;
      
      result.push({
        id: 'avg-completion',
        type: avgDays <= 7 ? 'positive' : avgDays <= 14 ? 'neutral' : 'warning',
        icon: <Clock className="w-4 h-4" />,
        title: '平均完成周期',
        value: `${Math.round(avgDays)} 天`,
        description: avgDays <= 7 ? '效率很高！' : '可以尝试拆分任务',
      });
    }

    // 5. 分类分布
    const categoryStats: Record<string, number> = {};
    events.forEach(e => {
      const cat = e.category || 'other';
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });
    const topCategory = Object.entries(categoryStats).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      const catInfo = EVENT_CATEGORIES.find(c => c.value === topCategory[0]);
      result.push({
        id: 'top-category',
        type: 'neutral',
        icon: <BarChart3 className="w-4 h-4" />,
        title: '主要分类',
        value: `${catInfo?.icon} ${catInfo?.label}`,
        description: `占比 ${Math.round((topCategory[1] / events.length) * 100)}%`,
      });
    }

    // 6. 优先级分布
    const priorityStats: Record<string, number> = {};
    events.forEach(e => {
      if (e.priority) {
        priorityStats[e.priority] = (priorityStats[e.priority] || 0) + 1;
      }
    });
    const p0Count = priorityStats['p0'] || 0;
    if (p0Count > 0) {
      const p0Overdue = events.filter(e => e.priority === 'p0' && getEventStatus(e.date) === 'overdue').length;
      result.push({
        id: 'p0-status',
        type: p0Overdue > 0 ? 'warning' : 'positive',
        icon: <Award className="w-4 h-4" />,
        title: 'P0 紧急任务',
        value: p0Count,
        description: p0Overdue > 0 ? `${p0Overdue} 个已逾期！` : '全部按计划进行',
      });
    }

    // 7. 连续活跃天数
    const activeDates = [...new Set(events.map(e => e.date.split('T')[0]))].sort().reverse();
    let streak = 0;
    let checkDate = new Date(today);
    for (const date of activeDates) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (date === dateStr) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (date < dateStr) {
        break;
      }
    }
    if (streak > 0) {
      result.push({
        id: 'streak',
        type: streak >= 7 ? 'positive' : 'neutral',
        icon: <Calendar className="w-4 h-4" />,
        title: '连续活跃',
        value: `${streak} 天`,
        description: streak >= 7 ? '保持得很好！' : '继续保持',
      });
    }

    // 8. 智能建议
    if (overdue.length > 3) {
      result.push({
        id: 'tip-overdue',
        type: 'tip',
        icon: <Sparkles className="w-4 h-4" />,
        title: '建议',
        value: '清理积压',
        description: '考虑取消或重新安排逾期事件',
      });
    } else if (completionRate >= 80) {
      result.push({
        id: 'tip-great',
        type: 'tip',
        icon: <Sparkles className="w-4 h-4" />,
        title: '表现优秀',
        value: '🎉',
        description: '你的时间管理非常出色！',
      });
    }

    return result;
  }, [events]);

  const displayInsights = isExpanded ? insights : insights.slice(0, 4);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-500" />
          数据洞察
        </h3>
        <span className="text-xs text-slate-500">{events.length} 个事件</span>
      </div>

      <div className="space-y-3">
        {displayInsights.map(insight => (
          <div
            key={insight.id}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              insight.type === 'positive'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : insight.type === 'warning'
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : insight.type === 'tip'
                ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
            }`}
          >
            <div className={`p-2 rounded-lg ${
              insight.type === 'positive' ? 'bg-green-500 text-white' :
              insight.type === 'warning' ? 'bg-red-500 text-white' :
              insight.type === 'tip' ? 'bg-purple-500 text-white' :
              'bg-slate-500 text-white'
            }`}>
              {insight.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {insight.title}
                </span>
                {insight.trend && (
                  insight.trend === 'up' 
                    ? <TrendingUp className="w-3 h-3 text-green-500" />
                    : insight.trend === 'down'
                    ? <TrendingDown className="w-3 h-3 text-red-500" />
                    : null
                )}
              </div>
              <p className="text-xs text-slate-500">{insight.description}</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {insight.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {insights.length > 4 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-3 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center justify-center gap-1"
        >
          {isExpanded ? (
            <>收起 <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>查看更多 ({insights.length - 4}) <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      )}
    </div>
  );
}
