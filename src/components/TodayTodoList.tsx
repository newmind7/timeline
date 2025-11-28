import { useState, useEffect } from 'react';
import { ListChecks, Plus, Check, Trash2, GripVertical } from 'lucide-react';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

export default function TodayTodoList() {
  const today = new Date().toISOString().split('T')[0];
  
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem(`todos_${today}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [newTodo, setNewTodo] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(`todos_${today}`, JSON.stringify(todos));
  }, [todos, today]);

  const addTodo = () => {
    if (!newTodo.trim()) return;
    
    const todo: TodoItem = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      order: todos.length,
    };
    
    setTodos(prev => [...prev, todo]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    setTodos(prev => {
      const draggedIndex = prev.findIndex(t => t.id === draggedId);
      const targetIndex = prev.findIndex(t => t.id === targetId);
      
      const newList = [...prev];
      const [removed] = newList.splice(draggedIndex, 1);
      newList.splice(targetIndex, 0, removed);
      
      return newList.map((t, i) => ({ ...t, order: i }));
    });
  };

  const completedCount = todos.filter(t => t.completed).length;
  const progress = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-teal-500" />
          今日待办
        </h3>
        {todos.length > 0 && (
          <span className="text-xs text-slate-500">
            {completedCount}/{todos.length}
          </span>
        )}
      </div>

      {/* 进度条 */}
      {todos.length > 0 && (
        <div className="mb-3">
          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 待办列表 */}
      <div className="space-y-1 mb-3 max-h-[200px] overflow-y-auto">
        {todos.map(todo => (
          <div
            key={todo.id}
            draggable
            onDragStart={() => handleDragStart(todo.id)}
            onDragOver={(e) => handleDragOver(e, todo.id)}
            onDragEnd={() => setDraggedId(null)}
            className={`flex items-center gap-2 p-2 rounded-lg cursor-move transition-all ${
              todo.completed 
                ? 'bg-green-50 dark:bg-green-900/20' 
                : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'
            } ${draggedId === todo.id ? 'opacity-50' : ''}`}
          >
            <GripVertical className="w-3 h-3 text-slate-300 flex-shrink-0" />
            
            <button
              onClick={() => toggleTodo(todo.id)}
              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                todo.completed
                  ? 'bg-teal-500 border-teal-500 text-white'
                  : 'border-slate-300 dark:border-slate-500 hover:border-teal-400'
              }`}
            >
              {todo.completed && <Check className="w-3 h-3" />}
            </button>

            <span className={`flex-1 text-sm ${
              todo.completed 
                ? 'line-through text-slate-400' 
                : 'text-slate-700 dark:text-slate-300'
            }`}>
              {todo.text}
            </span>

            <button
              onClick={() => deleteTodo(todo.id)}
              className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}

        {todos.length === 0 && (
          <div className="text-center py-4 text-slate-400">
            <ListChecks className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">今天的待办为空</p>
          </div>
        )}
      </div>

      {/* 添加待办 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="添加待办..."
          className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700"
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button
          onClick={addTodo}
          disabled={!newTodo.trim()}
          className="px-3 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 text-white rounded-lg"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
