import { useState } from 'react';
import { Undo2, Redo2, History, X, Clock, Trash2, Plus, Edit2 } from 'lucide-react';

interface HistoryAction {
  id: string;
  type: 'add' | 'update' | 'delete' | 'batch';
  timestamp: number;
  description: string;
}

interface UndoRedoPanelProps {
  canUndo: boolean;
  canRedo: boolean;
  undoCount: number;
  redoCount: number;
  recentActions: HistoryAction[];
  onUndo: () => void;
  onRedo: () => void;
  onClearHistory: () => void;
}

export default function UndoRedoPanel({
  canUndo,
  canRedo,
  undoCount,
  redoCount,
  recentActions,
  onUndo,
  onRedo,
  onClearHistory,
}: UndoRedoPanelProps) {
  const [showHistory, setShowHistory] = useState(false);

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'add': return <Plus className="w-3 h-3 text-green-500" />;
      case 'update': return <Edit2 className="w-3 h-3 text-blue-500" />;
      case 'delete': return <Trash2 className="w-3 h-3 text-red-500" />;
      default: return <Clock className="w-3 h-3 text-slate-500" />;
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-500" />
          操作历史
        </h3>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-xs text-slate-500 hover:text-slate-700"
        >
          {showHistory ? '收起' : '展开'}
        </button>
      </div>

      {/* 撤销重做按钮 */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
            canUndo
              ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-4 h-4" />
          <span className="text-sm">撤销</span>
          {undoCount > 0 && (
            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">{undoCount}</span>
          )}
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
            canRedo
              ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Redo2 className="w-4 h-4" />
          <span className="text-sm">重做</span>
          {redoCount > 0 && (
            <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">{redoCount}</span>
          )}
        </button>
      </div>

      {/* 快捷键提示 */}
      <div className="flex justify-center gap-4 text-xs text-slate-400 mb-3">
        <span>Ctrl+Z 撤销</span>
        <span>Ctrl+Y 重做</span>
      </div>

      {/* 历史记录列表 */}
      {showHistory && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
          {recentActions.length > 0 ? (
            <>
              <div className="space-y-2 max-h-[150px] overflow-y-auto">
                {recentActions.map((action, index) => (
                  <div
                    key={action.id}
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      index === 0 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800' 
                        : 'bg-slate-50 dark:bg-slate-700/50'
                    }`}
                  >
                    {getActionIcon(action.type)}
                    <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 truncate">
                      {action.description}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatTime(action.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={onClearHistory}
                className="w-full mt-2 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                清空历史
              </button>
            </>
          ) : (
            <div className="text-center py-4 text-slate-400">
              <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">暂无操作记录</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
