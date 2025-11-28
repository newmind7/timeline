import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Trash2, Edit2, Check, X, Clock } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

interface EventNotesProps {
  eventId: string;
  onNotesChange?: (count: number) => void;
}

export default function EventNotes({ eventId, onNotesChange }: EventNotesProps) {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem(`eventNotes_${eventId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    localStorage.setItem(`eventNotes_${eventId}`, JSON.stringify(notes));
    onNotesChange?.(notes.length);
  }, [notes, eventId, onNotesChange]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      createdAt: new Date().toISOString(),
    };
    
    setNotes(prev => [note, ...prev]);
    setNewNote('');
    setIsAdding(false);
  };

  const handleEditNote = (id: string) => {
    if (!editContent.trim()) return;
    
    setNotes(prev => prev.map(n => 
      n.id === id 
        ? { ...n, content: editContent.trim(), updatedAt: new Date().toISOString() }
        : n
    ));
    setEditingId(null);
    setEditContent('');
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
    return date.toLocaleDateString();
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left mb-2"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <MessageSquare className="w-4 h-4 text-blue-500" />
          笔记
          {notes.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
              {notes.length}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400">{isExpanded ? '收起' : '展开'}</span>
      </button>

      {isExpanded && (
        <div className="space-y-2">
          {/* 添加笔记 */}
          {isAdding ? (
            <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="添加笔记..."
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => { setIsAdding(false); setNewNote(''); }}
                  className="px-3 py-1 text-sm text-slate-500 hover:text-slate-700"
                >
                  取消
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white rounded"
                >
                  添加
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              添加笔记
            </button>
          )}

          {/* 笔记列表 */}
          {notes.length > 0 && (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {notes.map(note => (
                <div
                  key={note.id}
                  className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                >
                  {editingId === note.id ? (
                    <div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 resize-none"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => { setEditingId(null); setEditContent(''); }}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditNote(note.id)}
                          className="p-1 text-green-500 hover:text-green-600"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {note.content}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          {formatTime(note.updatedAt || note.createdAt)}
                          {note.updatedAt && ' (已编辑)'}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(note)}
                            className="p-1 text-slate-400 hover:text-blue-500"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
