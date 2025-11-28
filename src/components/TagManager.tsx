import { useState, useEffect } from 'react';
import { Tag, Plus, X, Edit2, Check } from 'lucide-react';

export interface EventTag {
  id: string;
  name: string;
  color: string;
}

interface TagManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onTagsChange?: (tags: EventTag[]) => void;
}

const TAG_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#64748b',
];

export function useTags() {
  const [tags, setTags] = useState<EventTag[]>(() => {
    const saved = localStorage.getItem('eventTags');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: '重要', color: '#ef4444' },
      { id: '2', name: '紧急', color: '#f97316' },
      { id: '3', name: '学习', color: '#3b82f6' },
      { id: '4', name: '健康', color: '#22c55e' },
      { id: '5', name: '社交', color: '#8b5cf6' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('eventTags', JSON.stringify(tags));
  }, [tags]);

  const addTag = (name: string, color: string) => {
    const newTag: EventTag = {
      id: Date.now().toString(),
      name,
      color,
    };
    setTags([...tags, newTag]);
    return newTag;
  };

  const updateTag = (id: string, name: string, color: string) => {
    setTags(tags.map(t => t.id === id ? { ...t, name, color } : t));
  };

  const deleteTag = (id: string) => {
    setTags(tags.filter(t => t.id !== id));
  };

  return { tags, addTag, updateTag, deleteTag };
}

export default function TagManager({ isOpen, onClose, onTagsChange }: TagManagerProps) {
  const { tags, addTag, updateTag, deleteTag } = useTags();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTag, setNewTag] = useState({ name: '', color: TAG_COLORS[0] });
  const [editTag, setEditTag] = useState({ name: '', color: '' });

  // 添加标签
  const handleAdd = () => {
    if (!newTag.name.trim()) return;
    addTag(newTag.name.trim(), newTag.color);
    setNewTag({ name: '', color: TAG_COLORS[0] });
    setIsAdding(false);
    onTagsChange?.(tags);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (!editingId || !editTag.name.trim()) return;
    updateTag(editingId, editTag.name.trim(), editTag.color);
    setEditingId(null);
    onTagsChange?.(tags);
  };

  // 开始编辑
  const startEdit = (tag: EventTag) => {
    setEditingId(tag.id);
    setEditTag({ name: tag.name, color: tag.color });
  };

  // 删除标签
  const handleDelete = (id: string) => {
    if (confirm('确定删除这个标签吗？')) {
      deleteTag(id);
      onTagsChange?.(tags);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-500" />
            标签管理
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* 标签列表 */}
        <div className="p-6 max-h-[400px] overflow-y-auto">
          <div className="space-y-2">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg group">
                {editingId === tag.id ? (
                  <>
                    <div className="flex gap-1">
                      {TAG_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setEditTag({ ...editTag, color })}
                          className={`w-5 h-5 rounded-full ${editTag.color === color ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <input
                      type="text"
                      value={editTag.name}
                      onChange={(e) => setEditTag({ ...editTag, name: e.target.value })}
                      className="flex-1 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700"
                      autoFocus
                    />
                    <button onClick={handleSaveEdit} className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 rounded">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                    <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">{tag.name}</span>
                    <button
                      onClick={() => startEdit(tag)}
                      className="p-1 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="p-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* 添加标签 */}
          {isAdding ? (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-3">
              <div className="flex gap-1">
                {TAG_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewTag({ ...newTag, color })}
                    className={`w-6 h-6 rounded-full ${newTag.color === color ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="text"
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                placeholder="标签名称"
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700"
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={handleAdd} className="flex-1 py-2 text-sm bg-blue-600 text-white rounded-lg">添加</button>
                <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm bg-slate-200 dark:bg-slate-600 rounded-lg">取消</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加标签
            </button>
          )}
        </div>

        {/* 底部提示 */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500">
          共 {tags.length} 个标签
        </div>
      </div>
    </div>
  );
}

// 标签选择器组件
export function TagSelector({ 
  selectedTags, 
  onChange 
}: { 
  selectedTags: string[]; 
  onChange: (tags: string[]) => void;
}) {
  const { tags } = useTags();

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter(id => id !== tagId));
    } else {
      onChange([...selectedTags, tagId]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <button
          key={tag.id}
          onClick={() => toggleTag(tag.id)}
          className={`px-3 py-1 text-xs rounded-full border transition-all ${
            selectedTags.includes(tag.id)
              ? 'text-white border-transparent'
              : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600'
          }`}
          style={{
            backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined,
          }}
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
}

// 标签显示组件
export function TagBadge({ tagId }: { tagId: string }) {
  const { tags } = useTags();
  const tag = tags.find(t => t.id === tagId);
  
  if (!tag) return null;

  return (
    <span
      className="px-2 py-0.5 text-xs text-white rounded-full"
      style={{ backgroundColor: tag.color }}
    >
      {tag.name}
    </span>
  );
}
