import { useState, useEffect, useMemo } from 'react';
import { 
  ListTodo, Plus, Check, X, GripVertical, Trash2, 
  ChevronDown, ChevronUp, Clock, AlertCircle
} from 'lucide-react';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
  order: number;
}

interface EnhancedSubtasksProps {
  eventId: string;
  onProgressChange?: (progress: number) => void;
}

export default function EnhancedSubtasks({ eventId, onProgressChange }: EnhancedSubtasksProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>(() => {
    const saved = localStorage.getItem(`subtasks_${eventId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // 保存到localStorage
  useEffect(() => {
    localStorage.setItem(`subtasks_${eventId}`, JSON.stringify(subtasks));
    
    // 计算进度
    if (subtasks.length > 0 && onProgressChange) {
      const completed = subtasks.filter(s => s.completed).length;
      const progress = Math.round((completed / subtasks.length) * 100);
      onProgressChange(progress);
    }
  }, [subtasks, eventId, onProgressChange]);

  const stats = useMemo(() => {
    const total = subtasks.length;
    const completed = subtasks.filter(s => s.completed).length;
    const overdue = subtasks.filter(s => 
      s.dueDate && new Date(s.dueDate) < new Date() && !s.completed
    ).length;
    
    return { total, completed, overdue, progress: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [subtasks]);

  const addSubtask = () => {
    if (!newTitle.trim()) return;

    const newSubtask: Subtask = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      completed: false,
      dueDate: newDueDate || undefined,
      priority: newPriority,
      order: subtasks.length,
    };

    setSubtasks(prev => [...prev, newSubtask]);
    setNewTitle('');
    setNewDueDate('');
    setIsAdding(false);
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(prev => prev.map(s => 
      s.id === id ? { ...s, completed: !s.completed } : s
    ));
  };

  const deleteSubtask = (id: string) => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    setSubtasks(prev => {
      const draggedIndex = prev.findIndex(s => s.id === draggedId);
      const targetIndex = prev.findIndex(s => s.id === targetId);
      
      const newList = [...prev];
      const [removed] = newList.splice(draggedIndex, 1);
      newList.splice(targetIndex, 0, removed);
      
      return newList.map((s, i) => ({ ...s, order: i }));
    });
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-green-500';
      default: return 'text-slate-400';
    }
  };

  const isOverdue = (dueDate?: string) => {
    return dueDate && new Date(dueDate) < new Date();
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
      {/* 头部 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full mb-2"
      >
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            子任务
          </span>
          {subtasks.length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
              {stats.completed}/{stats.total}
            </span>
          )}
          {stats.overdue > 0 && (
            <span className="flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="w-3 h-3" />
              {stats.overdue}逾期
            </span>
          )}
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {isExpanded && (
        <>
          {/* 进度条 */}
          {subtasks.length > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>进度</span>
                <span>{stats.progress}%</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* 子任务列表 */}
          <div className="space-y-2 mb-3">
            {subtasks.map(subtask => (
              <div
                key={subtask.id}
                draggable
                onDragStart={() => handleDragStart(subtask.id)}
                onDragOver={(e) => handleDragOver(e, subtask.id)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-move ${
                  subtask.completed
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : isOverdue(subtask.dueDate)
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
                } ${draggedId === subtask.id ? 'opacity-50' : ''}`}
              >
                <GripVertical className="w-4 h-4 text-slate-300 flex-shrink-0" />
                
                <button
                  onClick={() => toggleSubtask(subtask.id)}
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    subtask.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-slate-300 dark:border-slate-500 hover:border-green-400'
                  }`}
                >
                  {subtask.completed && <Check className="w-3 h-3" />}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${subtask.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {subtask.title}
                  </p>
                  {subtask.dueDate && (
                    <p className={`text-xs flex items-center gap-1 ${isOverdue(subtask.dueDate) && !subtask.completed ? 'text-red-500' : 'text-slate-400'}`}>
                      <Clock className="w-3 h-3" />
                      {new Date(subtask.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <span className={`text-xs ${getPriorityColor(subtask.priority)}`}>
                  {subtask.priority === 'high' ? '🔴' : subtask.priority === 'medium' ? '🟡' : '🟢'}
                </span>

                <button
                  onClick={() => deleteSubtask(subtask.id)}
                  className="p-1 text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* 添加子任务 */}
          {isAdding ? (
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="子任务名称"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700"
                />
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700"
                >
                  <option value="high">🔴 高</option>
                  <option value="medium">🟡 中</option>
                  <option value="low">🟢 低</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setIsAdding(false); setNewTitle(''); }}
                  className="flex-1 py-1.5 text-sm text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                >
                  取消
                </button>
                <button
                  onClick={addSubtask}
                  disabled={!newTitle.trim()}
                  className="flex-1 py-1.5 text-sm bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 text-white rounded"
                >
                  添加
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600 flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              添加子任务
            </button>
          )}
        </>
      )}
    </div>
  );
}
