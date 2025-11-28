import { useState } from 'react';
import { 
  Zap, Plus, Calendar, Target, FileText, Download, 
  Upload, Timer, CheckCircle, Sparkles, ChevronDown, ChevronUp 
} from 'lucide-react';

interface QuickActionsProps {
  onAddEvent: () => void;
  onExport: () => void;
  onImport: () => void;
  onOpenPomodoro: () => void;
  onOpenGoals: () => void;
  onOpenNotes: () => void;
}

export default function QuickActions({
  onAddEvent,
  onExport,
  onImport,
  onOpenPomodoro,
  onOpenGoals,
  onOpenNotes,
}: QuickActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    { 
      icon: <Plus className="w-4 h-4" />, 
      label: '新建事件', 
      color: 'from-blue-500 to-indigo-500',
      onClick: onAddEvent,
      primary: true,
    },
    { 
      icon: <Timer className="w-4 h-4" />, 
      label: '开始专注', 
      color: 'from-red-500 to-orange-500',
      onClick: onOpenPomodoro,
      primary: true,
    },
    { 
      icon: <Target className="w-4 h-4" />, 
      label: '添加目标', 
      color: 'from-green-500 to-emerald-500',
      onClick: onOpenGoals,
    },
    { 
      icon: <FileText className="w-4 h-4" />, 
      label: '快捷笔记', 
      color: 'from-yellow-500 to-amber-500',
      onClick: onOpenNotes,
    },
    { 
      icon: <Download className="w-4 h-4" />, 
      label: '导出数据', 
      color: 'from-purple-500 to-violet-500',
      onClick: onExport,
    },
    { 
      icon: <Upload className="w-4 h-4" />, 
      label: '导入数据', 
      color: 'from-cyan-500 to-teal-500',
      onClick: onImport,
    },
  ];

  const primaryActions = actions.filter(a => a.primary);
  const secondaryActions = actions.filter(a => !a.primary);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          快捷操作
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* 主要操作 */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        {primaryActions.map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            className={`flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r ${action.color} text-white hover:opacity-90 transition-opacity`}
          >
            {action.icon}
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>

      {/* 次要操作 */}
      {isExpanded && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
          {secondaryActions.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              <div className={`p-1 rounded bg-gradient-to-r ${action.color} text-white`}>
                {action.icon}
              </div>
              <span className="text-xs">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* 键盘提示 */}
      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px]">Ctrl+N</kbd>
            新建
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px]">Ctrl+K</kbd>
            搜索
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px]">Ctrl+E</kbd>
            导出
          </span>
        </div>
      </div>
    </div>
  );
}
