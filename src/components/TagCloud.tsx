import { useMemo, useState } from 'react';
import { Tag, Filter, X } from 'lucide-react';
import { Event } from '../types';

interface TagCloudProps {
  events: Event[];
  onTagClick?: (tag: string) => void;
  selectedTag?: string | null;
}

export default function TagCloud({ events, onTagClick, selectedTag }: TagCloudProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 统计标签
  const tagStats = useMemo(() => {
    const stats: Record<string, { count: number; completed: number }> = {};
    
    events.forEach(event => {
      if (event.tags && event.tags.length > 0) {
        event.tags.forEach(tag => {
          if (!stats[tag]) {
            stats[tag] = { count: 0, completed: 0 };
          }
          stats[tag].count++;
          if (event.progress === 100) {
            stats[tag].completed++;
          }
        });
      }
    });

    return Object.entries(stats)
      .map(([tag, data]) => ({
        tag,
        count: data.count,
        completed: data.completed,
        completionRate: Math.round((data.completed / data.count) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [events]);

  const maxCount = Math.max(...tagStats.map(t => t.count), 1);

  // 根据使用频率计算字体大小
  const getFontSize = (count: number) => {
    const minSize = 12;
    const maxSize = 24;
    const ratio = count / maxCount;
    return minSize + ratio * (maxSize - minSize);
  };

  // 根据完成率获取颜色
  const getColor = (completionRate: number) => {
    if (completionRate >= 80) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    if (completionRate >= 50) return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
    if (completionRate >= 20) return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
    return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700';
  };

  const displayTags = isExpanded ? tagStats : tagStats.slice(0, 8);

  if (tagStats.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-purple-500" />
          标签云
        </h3>
        <div className="text-center py-6 text-slate-400">
          <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">暂无标签</p>
          <p className="text-xs">为事件添加标签后显示</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Tag className="w-4 h-4 text-purple-500" />
          标签云
        </h3>
        <span className="text-xs text-slate-500">{tagStats.length} 个标签</span>
      </div>

      {/* 已选标签 */}
      {selectedTag && (
        <div className="mb-3 flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <Filter className="w-4 h-4 text-purple-500" />
          <span className="text-sm text-purple-700 dark:text-purple-400">
            筛选: {selectedTag}
          </span>
          <button
            onClick={() => onTagClick?.('')}
            className="ml-auto p-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded"
          >
            <X className="w-3 h-3 text-purple-500" />
          </button>
        </div>
      )}

      {/* 标签云 */}
      <div className="flex flex-wrap gap-2">
        {displayTags.map(({ tag, count, completionRate }) => (
          <button
            key={tag}
            onClick={() => onTagClick?.(tag)}
            className={`px-2.5 py-1 rounded-full transition-all hover:scale-105 ${
              getColor(completionRate)
            } ${
              selectedTag === tag ? 'ring-2 ring-purple-500 ring-offset-2' : ''
            }`}
            style={{ fontSize: `${getFontSize(count)}px` }}
            title={`${count}个事件, ${completionRate}%完成`}
          >
            #{tag}
            <span className="ml-1 text-[10px] opacity-70">
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* 展开/收起 */}
      {tagStats.length > 8 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
        >
          {isExpanded ? '收起' : `查看全部 (${tagStats.length})`}
        </button>
      )}

      {/* 图例 */}
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-400 mb-2">完成率图例</p>
        <div className="flex gap-2 text-[10px]">
          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded">
            ≥80%
          </span>
          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
            ≥50%
          </span>
          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded">
            ≥20%
          </span>
          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
            &lt;20%
          </span>
        </div>
      </div>
    </div>
  );
}
