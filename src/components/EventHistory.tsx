import { useState, useEffect } from 'react';
import { History, Clock, Edit2, Plus, Trash2, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface HistoryEntry {
  id: string;
  eventId: string;
  type: 'create' | 'update' | 'delete' | 'progress' | 'complete';
  field?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
}

interface EventHistoryProps {
  eventId: string;
}

// 记录历史的工具函数
export function recordEventHistory(
  eventId: string, 
  type: HistoryEntry['type'], 
  details?: { field?: string; oldValue?: any; newValue?: any }
) {
  const saved = localStorage.getItem('eventHistory') || '[]';
  const history: HistoryEntry[] = JSON.parse(saved);
  
  const entry: HistoryEntry = {
    id: Date.now().toString(),
    eventId,
    type,
    field: details?.field,
    oldValue: details?.oldValue,
    newValue: details?.newValue,
    timestamp: new Date().toISOString(),
  };
  
  history.unshift(entry);
  
  // 只保留最近100条记录
  const trimmed = history.slice(0, 100);
  localStorage.setItem('eventHistory', JSON.stringify(trimmed));
  
  return entry;
}

export default function EventHistory({ eventId }: EventHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('eventHistory');
    if (saved) {
      const allHistory: HistoryEntry[] = JSON.parse(saved);
      const eventHistory = allHistory.filter(h => h.eventId === eventId);
      setHistory(eventHistory);
    }
  }, [eventId]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
    return date.toLocaleDateString();
  };

  const getTypeIcon = (type: HistoryEntry['type']) => {
    switch (type) {
      case 'create': return <Plus className="w-3 h-3 text-green-500" />;
      case 'update': return <Edit2 className="w-3 h-3 text-blue-500" />;
      case 'delete': return <Trash2 className="w-3 h-3 text-red-500" />;
      case 'progress': return <RotateCcw className="w-3 h-3 text-amber-500" />;
      case 'complete': return <Clock className="w-3 h-3 text-purple-500" />;
      default: return <History className="w-3 h-3 text-slate-400" />;
    }
  };

  const getTypeLabel = (entry: HistoryEntry) => {
    switch (entry.type) {
      case 'create': return '创建事件';
      case 'update': 
        if (entry.field === 'title') return `修改标题`;
        if (entry.field === 'date') return `修改日期`;
        if (entry.field === 'category') return `修改分类`;
        if (entry.field === 'priority') return `修改优先级`;
        return `修改${entry.field || '属性'}`;
      case 'delete': return '删除事件';
      case 'progress': return `进度更新为 ${entry.newValue}%`;
      case 'complete': return '标记完成';
      default: return '未知操作';
    }
  };

  const getValueChange = (entry: HistoryEntry) => {
    if (entry.oldValue !== undefined && entry.newValue !== undefined) {
      return (
        <span className="text-xs text-slate-400">
          <span className="line-through">{String(entry.oldValue)}</span>
          {' → '}
          <span className="text-slate-600 dark:text-slate-300">{String(entry.newValue)}</span>
        </span>
      );
    }
    return null;
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full mb-2"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <History className="w-4 h-4 text-slate-500" />
          修改历史
          <span className="px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 rounded">
            {history.length}
          </span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {isExpanded && (
        <div className="relative pl-4 space-y-3 max-h-[200px] overflow-y-auto">
          {/* 时间线 */}
          <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
          
          {history.slice(0, 10).map((entry, index) => (
            <div key={entry.id} className="relative flex gap-3">
              {/* 时间线节点 */}
              <div className="absolute left-[-12px] w-4 h-4 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center">
                {getTypeIcon(entry.type)}
              </div>
              
              {/* 内容 */}
              <div className="flex-1 ml-2">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {getTypeLabel(entry)}
                </p>
                {getValueChange(entry)}
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatTime(entry.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {history.length > 10 && (
            <p className="text-xs text-slate-400 text-center">
              还有 {history.length - 10} 条历史记录
            </p>
          )}
        </div>
      )}
    </div>
  );
}
