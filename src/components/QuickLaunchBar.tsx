import { useState } from 'react';
import { 
  Zap, Plus, Search, Calendar, BarChart3, Settings, 
  Archive, FileText, Clock, Target, BookOpen, Download,
  ChevronUp, ChevronDown
} from 'lucide-react';

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  color: string;
}

interface QuickLaunchBarProps {
  onAction: (actionId: string) => void;
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'add', icon: <Plus className="w-4 h-4" />, label: '新建事件', shortcut: 'N', color: 'bg-blue-500' },
  { id: 'search', icon: <Search className="w-4 h-4" />, label: '搜索', shortcut: 'K', color: 'bg-slate-500' },
  { id: 'calendar', icon: <Calendar className="w-4 h-4" />, label: '日历', color: 'bg-indigo-500' },
  { id: 'stats', icon: <BarChart3 className="w-4 h-4" />, label: '统计', color: 'bg-green-500' },
  { id: 'archive', icon: <Archive className="w-4 h-4" />, label: '归档', color: 'bg-amber-500' },
  { id: 'report', icon: <FileText className="w-4 h-4" />, label: '报告', color: 'bg-purple-500' },
  { id: 'pomodoro', icon: <Clock className="w-4 h-4" />, label: '番茄钟', color: 'bg-red-500' },
  { id: 'goals', icon: <Target className="w-4 h-4" />, label: '目标', color: 'bg-teal-500' },
  { id: 'notes', icon: <BookOpen className="w-4 h-4" />, label: '笔记', color: 'bg-pink-500' },
  { id: 'export', icon: <Download className="w-4 h-4" />, label: '导出', color: 'bg-cyan-500' },
];

export default function QuickLaunchBar({ onAction }: QuickLaunchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [recentActions, setRecentActions] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentQuickActions');
    return saved ? JSON.parse(saved) : ['add', 'search', 'calendar'];
  });

  const handleAction = (actionId: string) => {
    // 更新最近使用
    const updated = [actionId, ...recentActions.filter(id => id !== actionId)].slice(0, 5);
    setRecentActions(updated);
    localStorage.setItem('recentQuickActions', JSON.stringify(updated));
    
    onAction(actionId);
  };

  const displayActions = isExpanded 
    ? QUICK_ACTIONS 
    : QUICK_ACTIONS.filter(a => recentActions.includes(a.id)).slice(0, 5);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2">
        {/* 展开按钮 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -top-3 left-1/2 -translate-x-1/2 p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* 快捷操作 */}
        <div className={`flex items-center gap-1 transition-all ${isExpanded ? 'flex-wrap justify-center max-w-md' : ''}`}>
          {displayActions.map((action, index) => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              className="group relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all hover:scale-110"
              style={{ 
                animationDelay: `${index * 50}ms`,
              }}
            >
              <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-shadow`}>
                {action.icon}
              </div>
              
              {/* 工具提示 */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {action.label}
                {action.shortcut && (
                  <span className="ml-1 px-1 py-0.5 bg-slate-700 rounded text-[10px]">
                    ⌘{action.shortcut}
                  </span>
                )}
              </div>
            </button>
          ))}
          
          {!isExpanded && QUICK_ACTIONS.length > 5 && (
            <button
              onClick={() => setIsExpanded(true)}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center text-slate-500">
                <Zap className="w-4 h-4" />
              </div>
            </button>
          )}
        </div>

        {/* 展开时显示标签 */}
        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <p className="text-[10px] text-slate-400 text-center">
              点击图标快速访问 · 最近使用会显示在前面
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
