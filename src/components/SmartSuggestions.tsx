import { useMemo } from 'react';
import { Lightbulb, ArrowRight, Clock, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';
import { Event, EVENT_CATEGORIES } from '../types';
import { getEventStatus } from '../utils/dateUtils';

interface SmartSuggestionsProps {
  events: Event[];
  onSelectEvent?: (event: Event) => void;
  onAddEvent?: () => void;
}

interface Suggestion {
  id: string;
  type: 'warning' | 'tip' | 'insight' | 'action';
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: () => void;
  actionText?: string;
}

export default function SmartSuggestions({ events, onSelectEvent, onAddEvent }: SmartSuggestionsProps) {
  const suggestions = useMemo(() => {
    const result: Suggestion[] = [];
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // 分析事件
    const overdueEvents = events.filter(e => {
      const status = getEventStatus(e.date, e.progress);
      return status === 'overdue';
    });
    
    const todayEvents = events.filter(e => e.date.startsWith(today));
    const upcomingEvents = events.filter(e => {
      const eventDate = new Date(e.date);
      const diff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= 3 && e.progress < 100;
    });
    
    const completedThisWeek = events.filter(e => {
      const eventDate = new Date(e.date);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return eventDate >= weekAgo && e.progress === 100;
    }).length;
    
    const totalProgress = events.length > 0 
      ? events.reduce((sum, e) => sum + e.progress, 0) / events.length 
      : 0;
    
    // 逾期警告
    if (overdueEvents.length > 0) {
      const mostOverdue = overdueEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
      result.push({
        id: 'overdue-warning',
        type: 'warning',
        icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
        title: `${overdueEvents.length} 个事件已逾期`,
        description: `优先处理「${mostOverdue.title}」`,
        action: () => onSelectEvent?.(mostOverdue),
        actionText: '立即处理',
      });
    }
    
    // 今日提醒
    if (todayEvents.length > 0) {
      const incomplete = todayEvents.filter(e => e.progress < 100);
      if (incomplete.length > 0) {
        result.push({
          id: 'today-tasks',
          type: 'action',
          icon: <Clock className="w-4 h-4 text-amber-500" />,
          title: `今天还有 ${incomplete.length} 个任务`,
          description: '保持专注，完成今日目标',
          action: () => onSelectEvent?.(incomplete[0]),
          actionText: '开始',
        });
      }
    }
    
    // 即将到来
    if (upcomingEvents.length > 0) {
      result.push({
        id: 'upcoming',
        type: 'tip',
        icon: <Sparkles className="w-4 h-4 text-blue-500" />,
        title: `${upcomingEvents.length} 个事件即将到来`,
        description: '提前规划，从容应对',
      });
    }
    
    // 进度洞察
    if (events.length >= 5) {
      if (totalProgress >= 80) {
        result.push({
          id: 'high-progress',
          type: 'insight',
          icon: <TrendingUp className="w-4 h-4 text-green-500" />,
          title: '进度表现优秀！',
          description: `平均进度 ${Math.round(totalProgress)}%，继续保持`,
        });
      } else if (totalProgress < 30) {
        result.push({
          id: 'low-progress',
          type: 'tip',
          icon: <Lightbulb className="w-4 h-4 text-amber-500" />,
          title: '建议分解大任务',
          description: '将大目标拆分为小步骤更容易完成',
        });
      }
    }
    
    // 本周成就
    if (completedThisWeek >= 5) {
      result.push({
        id: 'weekly-achievement',
        type: 'insight',
        icon: <TrendingUp className="w-4 h-4 text-purple-500" />,
        title: `本周已完成 ${completedThisWeek} 个事件`,
        description: '效率很高，奖励自己一下吧！',
      });
    }
    
    // 空状态建议
    if (events.length === 0) {
      result.push({
        id: 'get-started',
        type: 'action',
        icon: <Sparkles className="w-4 h-4 text-blue-500" />,
        title: '开始规划你的时间',
        description: '创建第一个事件，踏出第一步',
        action: onAddEvent,
        actionText: '新建事件',
      });
    }
    
    return result.slice(0, 3); // 最多显示3条
  }, [events, onSelectEvent, onAddEvent]);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">智能建议</h3>
      </div>

      <div className="space-y-2">
        {suggestions.map(suggestion => (
          <div
            key={suggestion.id}
            className={`p-3 rounded-lg border transition-all ${
              suggestion.type === 'warning'
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : suggestion.type === 'action'
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                : suggestion.type === 'insight'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{suggestion.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900 dark:text-white">
                  {suggestion.title}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {suggestion.description}
                </p>
              </div>
              {suggestion.action && (
                <button
                  onClick={suggestion.action}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                >
                  {suggestion.actionText}
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
