import { useState } from 'react';
import { Zap, Plus, ChevronRight, Clock, Calendar, Target, BookOpen, Dumbbell, Coffee } from 'lucide-react';

interface QuickTemplate {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
  defaultTitle: string;
  description?: string;
  daysFromNow: number;
}

const QUICK_TEMPLATES: QuickTemplate[] = [
  { 
    id: 'meeting', 
    name: '会议', 
    icon: '📅', 
    color: '#3B82F6', 
    category: 'work',
    defaultTitle: '团队会议',
    daysFromNow: 0 
  },
  { 
    id: 'deadline', 
    name: '截止日期', 
    icon: '⏰', 
    color: '#EF4444', 
    category: 'work',
    defaultTitle: '项目截止',
    daysFromNow: 7 
  },
  { 
    id: 'workout', 
    name: '运动', 
    icon: '💪', 
    color: '#10B981', 
    category: 'health',
    defaultTitle: '健身锻炼',
    daysFromNow: 0 
  },
  { 
    id: 'reading', 
    name: '阅读', 
    icon: '📚', 
    color: '#8B5CF6', 
    category: 'study',
    defaultTitle: '阅读计划',
    daysFromNow: 0 
  },
  { 
    id: 'shopping', 
    name: '购物', 
    icon: '🛒', 
    color: '#F59E0B', 
    category: 'life',
    defaultTitle: '购物清单',
    daysFromNow: 1 
  },
  { 
    id: 'travel', 
    name: '旅行', 
    icon: '✈️', 
    color: '#06B6D4', 
    category: 'travel',
    defaultTitle: '旅行计划',
    daysFromNow: 30 
  },
  { 
    id: 'bill', 
    name: '账单', 
    icon: '💰', 
    color: '#EC4899', 
    category: 'finance',
    defaultTitle: '支付账单',
    daysFromNow: 0 
  },
  { 
    id: 'doctor', 
    name: '医疗', 
    icon: '🏥', 
    color: '#14B8A6', 
    category: 'health',
    defaultTitle: '医院预约',
    daysFromNow: 3 
  },
];

interface QuickTemplatesProps {
  onCreateEvent: (event: {
    title: string;
    date: string;
    color: string;
    category: string;
    progress: number;
  }) => void;
}

export default function QuickTemplates({ onCreateEvent }: QuickTemplatesProps) {
  const [showAll, setShowAll] = useState(false);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentTemplates');
    return saved ? JSON.parse(saved) : [];
  });

  const handleUseTemplate = (template: QuickTemplate) => {
    const date = new Date();
    date.setDate(date.getDate() + template.daysFromNow);
    
    onCreateEvent({
      title: template.defaultTitle,
      date: date.toISOString().split('T')[0],
      color: template.color,
      category: template.category,
      progress: 0,
    });

    // 更新最近使用
    const updated = [template.id, ...recentlyUsed.filter(id => id !== template.id)].slice(0, 4);
    setRecentlyUsed(updated);
    localStorage.setItem('recentTemplates', JSON.stringify(updated));
  };

  // 排序：最近使用的排前面
  const sortedTemplates = [...QUICK_TEMPLATES].sort((a, b) => {
    const aIndex = recentlyUsed.indexOf(a.id);
    const bIndex = recentlyUsed.indexOf(b.id);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const displayTemplates = showAll ? sortedTemplates : sortedTemplates.slice(0, 4);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          快速创建
        </h3>
        <span className="text-xs text-slate-500">一键添加</span>
      </div>

      {/* 快速模板网格 */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {displayTemplates.map(template => (
          <button
            key={template.id}
            onClick={() => handleUseTemplate(template)}
            className="flex flex-col items-center gap-1 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
          >
            <span className="text-xl">{template.icon}</span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400">{template.name}</span>
          </button>
        ))}
      </div>

      {/* 展开更多 */}
      {QUICK_TEMPLATES.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1"
        >
          {showAll ? '收起' : '更多模板'}
          <ChevronRight className={`w-3 h-3 transition-transform ${showAll ? 'rotate-90' : ''}`} />
        </button>
      )}

      {/* 提示 */}
      <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
        <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          点击模板快速创建事件，可在弹窗中编辑详情
        </p>
      </div>
    </div>
  );
}
