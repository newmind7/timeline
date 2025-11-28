import { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { useSubtasks } from '../hooks/useEvents';
import { Subtask } from '../types';

interface SubtaskListProps {
  eventId: string;
  onProgressChange: (completedCount: number, totalCount: number) => void;
}

export default function SubtaskList({ eventId, onProgressChange }: SubtaskListProps) {
  const { subtasks, addSubtask, updateSubtask, deleteSubtask, loading } = useSubtasks(eventId);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [expandedSubtasks, setExpandedSubtasks] = useState(true);

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    try {
      await addSubtask(newSubtaskTitle);
      setNewSubtaskTitle('');
      updateProgress();
    } catch (error) {
      console.error('Failed to add subtask:', error);
    }
  };

  const handleToggleSubtask = async (subtask: Subtask) => {
    try {
      await updateSubtask(subtask.id, { completed: !subtask.completed });
      updateProgress();
    } catch (error) {
      console.error('Failed to toggle subtask:', error);
    }
  };

  const handleDeleteSubtask = async (id: string) => {
    try {
      await deleteSubtask(id);
      updateProgress();
    } catch (error) {
      console.error('Failed to delete subtask:', error);
    }
  };

  const updateProgress = () => {
    const completed = subtasks.filter(s => s.completed).length;
    onProgressChange(completed, subtasks.length);
  };

  if (!expandedSubtasks) {
    return (
      <button
        onClick={() => setExpandedSubtasks(true)}
        className="text-sm text-blue-600 hover:text-blue-700 mt-2"
      >
        {subtasks.length} 个子任务（{subtasks.filter(s => s.completed).length} 个已完成）
      </button>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-slate-900">子任务</h4>
        <button
          onClick={() => setExpandedSubtasks(false)}
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          收起
        </button>
      </div>

      <div className="space-y-2 mb-3">
        {loading ? (
          <div className="text-sm text-slate-500">加载中...</div>
        ) : subtasks.length === 0 ? (
          <div className="text-sm text-slate-500">暂无子任务</div>
        ) : (
          subtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-2">
              <button
                onClick={() => handleToggleSubtask(subtask)}
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  subtask.completed
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-slate-300 hover:border-blue-400'
                }`}
              >
                {subtask.completed && <Check className="w-3 h-3 text-white" />}
              </button>
              <span
                className={`flex-1 text-sm ${
                  subtask.completed ? 'text-slate-400 line-through' : 'text-slate-700'
                }`}
              >
                {subtask.title}
              </span>
              <button
                onClick={() => handleDeleteSubtask(subtask.id)}
                className="text-slate-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAddSubtask} className="flex gap-2">
        <input
          type="text"
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          placeholder="添加子任务..."
          className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
