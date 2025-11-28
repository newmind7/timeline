import { useState } from 'react';
import { 
  CheckSquare, Square, Trash2, Edit2, CheckCircle, 
  X, Calendar, Tag, AlertTriangle, Loader2
} from 'lucide-react';
import { Event, EVENT_CATEGORIES, PRIORITY_LEVELS } from '../types';

interface BatchActionsProps {
  events: Event[];
  selectedIds: Set<string>;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onToggleSelect: (id: string) => void;
  onBatchDelete: (ids: string[]) => Promise<void>;
  onBatchUpdate: (ids: string[], updates: Partial<Event>) => Promise<void>;
}

export default function BatchActions({
  events,
  selectedIds,
  onSelectAll,
  onClearSelection,
  onToggleSelect,
  onBatchDelete,
  onBatchUpdate,
}: BatchActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [batchAction, setBatchAction] = useState<'category' | 'priority' | 'complete' | null>(null);

  const selectedCount = selectedIds.size;
  const allSelected = selectedCount === events.length && events.length > 0;

  const handleBatchDelete = async () => {
    setIsProcessing(true);
    try {
      await onBatchDelete(Array.from(selectedIds));
      onClearSelection();
      setShowConfirmDelete(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchComplete = async () => {
    setIsProcessing(true);
    try {
      await onBatchUpdate(Array.from(selectedIds), { progress: 100 });
      onClearSelection();
      setBatchAction(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchCategory = async (category: string) => {
    setIsProcessing(true);
    try {
      await onBatchUpdate(Array.from(selectedIds), { category: category as any });
      onClearSelection();
      setBatchAction(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchPriority = async (priority: string) => {
    setIsProcessing(true);
    try {
      await onBatchUpdate(Array.from(selectedIds), { priority: priority as any });
      onClearSelection();
      setBatchAction(null);
    } finally {
      setIsProcessing(false);
    }
  };

  if (events.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-blue-500" />
          批量操作
        </h3>
        <span className="text-xs text-slate-500">
          {selectedCount > 0 ? `已选 ${selectedCount} 项` : '点击选择事件'}
        </span>
      </div>

      {/* 全选/取消 */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={allSelected ? onClearSelection : onSelectAll}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            allSelected 
              ? 'bg-blue-500 text-white' 
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          {allSelected ? '取消全选' : '全选'}
        </button>
        {selectedCount > 0 && (
          <button
            onClick={onClearSelection}
            className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700"
          >
            清除选择
          </button>
        )}
      </div>

      {/* 事件列表 */}
      <div className="max-h-[200px] overflow-y-auto space-y-1 mb-3 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
        {events.slice(0, 20).map(event => {
          const isSelected = selectedIds.has(event.id);
          const catInfo = EVENT_CATEGORIES.find(c => c.value === event.category);
          
          return (
            <div
              key={event.id}
              onClick={() => onToggleSelect(event.id)}
              className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                isSelected 
                  ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700' 
                  : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-blue-500 flex-shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
              <span className="flex-shrink-0">{catInfo?.icon || '📌'}</span>
              <span className="text-sm text-slate-700 dark:text-slate-300 truncate flex-1">
                {event.title}
              </span>
              {event.progress === 100 && (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
            </div>
          );
        })}
        {events.length > 20 && (
          <p className="text-xs text-center text-slate-400 py-1">
            还有 {events.length - 20} 个事件...
          </p>
        )}
      </div>

      {/* 批量操作按钮 */}
      {selectedCount > 0 && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => setBatchAction('complete')}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg"
            >
              <CheckCircle className="w-4 h-4" />
              标记完成
            </button>
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setBatchAction('category')}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm rounded-lg"
            >
              <Tag className="w-4 h-4" />
              修改分类
            </button>
            <button
              onClick={() => setBatchAction('priority')}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm rounded-lg"
            >
              <AlertTriangle className="w-4 h-4" />
              修改优先级
            </button>
          </div>
        </div>
      )}

      {/* 确认删除弹窗 */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowConfirmDelete(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">确认删除</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              确定要删除选中的 {selectedCount} 个事件吗？此操作不可撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={isProcessing}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 选择分类弹窗 */}
      {batchAction === 'category' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setBatchAction(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">选择分类</h3>
            <div className="grid grid-cols-2 gap-2">
              {EVENT_CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => handleBatchCategory(cat.value)}
                  disabled={isProcessing}
                  className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg"
                >
                  <span>{cat.icon}</span>
                  <span className="text-sm">{cat.label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setBatchAction(null)}
              className="w-full mt-4 py-2 text-slate-500 hover:text-slate-700"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 选择优先级弹窗 */}
      {batchAction === 'priority' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setBatchAction(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">选择优先级</h3>
            <div className="space-y-2">
              {PRIORITY_LEVELS.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleBatchPriority(p.id)}
                  disabled={isProcessing}
                  className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg"
                >
                  <span className="text-lg">{p.icon}</span>
                  <div className="text-left">
                    <div className="text-sm font-medium">{p.label}</div>
                    <div className="text-xs text-slate-500">{p.description}</div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setBatchAction(null)}
              className="w-full mt-4 py-2 text-slate-500 hover:text-slate-700"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 确认完成弹窗 */}
      {batchAction === 'complete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setBatchAction(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">标记完成</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              将选中的 {selectedCount} 个事件标记为已完成？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setBatchAction(null)}
                className="flex-1 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleBatchComplete}
                disabled={isProcessing}
                className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
