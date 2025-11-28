import { useState, useEffect } from 'react';
import { StickyNote, Plus, Trash2, Pin, PinOff } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  color: string;
  pinned: boolean;
  createdAt: string;
}

const NOTE_COLORS = [
  { name: 'yellow', bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-300 dark:border-yellow-700' },
  { name: 'blue', bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-300 dark:border-blue-700' },
  { name: 'green', bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-300 dark:border-green-700' },
  { name: 'pink', bg: 'bg-pink-100 dark:bg-pink-900/30', border: 'border-pink-300 dark:border-pink-700' },
  { name: 'purple', bg: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-300 dark:border-purple-700' },
];

export default function QuickNotes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('quickNotes');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState({ content: '', color: 'yellow' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('quickNotes', JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = () => {
    if (!newNote.content.trim()) return;
    
    const note: Note = {
      id: Date.now().toString(),
      content: newNote.content.trim(),
      color: newNote.color,
      pinned: false,
      createdAt: new Date().toISOString(),
    };
    
    setNotes([note, ...notes]);
    setNewNote({ content: '', color: 'yellow' });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const togglePin = (id: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const updateNote = (id: string, content: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, content } : n));
    setEditingId(null);
  };

  const getColorClass = (colorName: string) => {
    return NOTE_COLORS.find(c => c.name === colorName) || NOTE_COLORS[0];
  };

  // 排序：置顶在前
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-yellow-500" />
          快捷笔记
        </h3>
        <button
          onClick={() => setIsAdding(true)}
          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 添加笔记 */}
      {isAdding && (
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-2">
          <textarea
            placeholder="记录你的想法..."
            value={newNote.content}
            onChange={(e) => setNewNote({...newNote, content: e.target.value})}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 resize-none"
            rows={3}
            autoFocus
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {NOTE_COLORS.map(color => (
                <button
                  key={color.name}
                  onClick={() => setNewNote({...newNote, color: color.name})}
                  className={`w-6 h-6 rounded-full ${color.bg} border-2 ${
                    newNote.color === color.name ? 'ring-2 ring-offset-1 ring-blue-500' : color.border
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsAdding(false)} className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400">取消</button>
              <button onClick={handleAddNote} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg">保存</button>
            </div>
          </div>
        </div>
      )}

      {/* 笔记列表 */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {sortedNotes.map(note => {
          const colorClass = getColorClass(note.color);
          return (
            <div
              key={note.id}
              className={`p-3 rounded-lg border ${colorClass.bg} ${colorClass.border} group relative`}
            >
              {/* 操作按钮 */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => togglePin(note.id)}
                  className={`p-1 rounded ${note.pinned ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                  title={note.pinned ? '取消置顶' : '置顶'}
                >
                  {note.pinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="p-1 text-slate-400 hover:text-red-500 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* 置顶标记 */}
              {note.pinned && (
                <Pin className="absolute top-2 left-2 w-3 h-3 text-blue-500" />
              )}

              {/* 内容 */}
              {editingId === note.id ? (
                <textarea
                  defaultValue={note.content}
                  onBlur={(e) => updateNote(note.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      updateNote(note.id, e.currentTarget.value);
                    }
                  }}
                  className="w-full bg-transparent resize-none text-sm text-slate-700 dark:text-slate-300 focus:outline-none"
                  rows={3}
                  autoFocus
                />
              ) : (
                <p
                  onClick={() => setEditingId(note.id)}
                  className={`text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap cursor-text ${note.pinned ? 'pl-5' : ''}`}
                >
                  {note.content}
                </p>
              )}

              {/* 时间 */}
              <div className="text-xs text-slate-400 mt-2">
                {formatDate(note.createdAt)}
              </div>
            </div>
          );
        })}
      </div>

      {notes.length === 0 && !isAdding && (
        <div className="text-center py-6 text-slate-400">
          <StickyNote className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">还没有笔记</p>
          <button onClick={() => setIsAdding(true)} className="text-blue-500 text-sm mt-1">写第一条</button>
        </div>
      )}
    </div>
  );
}
