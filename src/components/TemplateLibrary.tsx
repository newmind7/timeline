import { useState, useEffect } from 'react';
import { BookTemplate, Plus, X, Edit2, Trash2, Copy, Star, Check, Folder } from 'lucide-react';
import { EVENT_CATEGORIES } from '../types';

interface CustomTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  color: string;
  defaultProgress: number;
  tags?: string[];
  isStarred: boolean;
  createdAt: string;
  usageCount: number;
}

interface TemplateLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: CustomTemplate) => void;
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

export default function TemplateLibrary({ isOpen, onClose, onSelectTemplate }: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<CustomTemplate[]>(() => {
    const saved = localStorage.getItem('customTemplates');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 表单状态
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('other');
  const [formColor, setFormColor] = useState(COLORS[0]);
  const [formProgress, setFormProgress] = useState(0);

  useEffect(() => {
    localStorage.setItem('customTemplates', JSON.stringify(templates));
  }, [templates]);

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormCategory('other');
    setFormColor(COLORS[0]);
    setFormProgress(0);
  };

  const handleSaveTemplate = () => {
    if (!formName.trim()) return;

    if (editingId) {
      setTemplates(prev => prev.map(t => 
        t.id === editingId 
          ? { ...t, name: formName, description: formDescription, category: formCategory, color: formColor, defaultProgress: formProgress }
          : t
      ));
      setEditingId(null);
    } else {
      const newTemplate: CustomTemplate = {
        id: Date.now().toString(),
        name: formName,
        description: formDescription,
        category: formCategory,
        color: formColor,
        defaultProgress: formProgress,
        isStarred: false,
        createdAt: new Date().toISOString(),
        usageCount: 0,
      };
      setTemplates(prev => [...prev, newTemplate]);
    }

    resetForm();
    setIsCreating(false);
  };

  const handleEditTemplate = (template: CustomTemplate) => {
    setFormName(template.name);
    setFormDescription(template.description || '');
    setFormCategory(template.category);
    setFormColor(template.color);
    setFormProgress(template.defaultProgress);
    setEditingId(template.id);
    setIsCreating(true);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const handleToggleStar = (id: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, isStarred: !t.isStarred } : t
    ));
  };

  const handleUseTemplate = (template: CustomTemplate) => {
    // 增加使用次数
    setTemplates(prev => prev.map(t => 
      t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
    ));
    onSelectTemplate(template);
    onClose();
  };

  const filteredTemplates = templates
    .filter(t => selectedCategory === 'all' || t.category === selectedCategory)
    .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (a.isStarred !== b.isStarred) return a.isStarred ? -1 : 1;
      return b.usageCount - a.usageCount;
    });

  const getCategoryInfo = (catId: string) => 
    EVENT_CATEGORIES.find(c => c.id === catId) || { icon: '📌', label: '其他' };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <BookTemplate className="w-6 h-6 text-indigo-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">模板库</h2>
            <span className="text-sm text-slate-500">({templates.length} 个模板)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setIsCreating(true); resetForm(); setEditingId(null); }}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-lg"
            >
              <Plus className="w-4 h-4" />
              新建模板
            </button>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* 创建/编辑表单 */}
        {isCreating && (
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              {editingId ? '编辑模板' : '创建新模板'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="模板名称"
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 text-sm"
              />
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 text-sm"
              >
                {EVENT_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="描述（可选）"
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 text-sm"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">颜色:</span>
                <div className="flex gap-1">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormColor(color)}
                      className={`w-6 h-6 rounded-full ${formColor === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">默认进度: {formProgress}%</span>
                <input
                  type="range"
                  value={formProgress}
                  onChange={(e) => setFormProgress(Number(e.target.value))}
                  min={0}
                  max={100}
                  className="w-24"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setIsCreating(false); resetForm(); setEditingId(null); }}
                  className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveTemplate}
                  disabled={!formName.trim()}
                  className="px-3 py-1.5 text-sm bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 text-white rounded-lg"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 筛选 */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索模板..."
              className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 text-sm"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 text-sm"
            >
              <option value="all">全部分类</option>
              {EVENT_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 模板列表 */}
        <div className="p-4 overflow-y-auto max-h-[400px]">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <BookTemplate className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>还没有自定义模板</p>
              <p className="text-sm">点击"新建模板"创建你的第一个模板</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-indigo-300 transition-colors"
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                    style={{ backgroundColor: template.color }}
                  >
                    {getCategoryInfo(template.category).icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white truncate">
                        {template.name}
                      </span>
                      {template.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                    </div>
                    {template.description && (
                      <p className="text-xs text-slate-500 truncate">{template.description}</p>
                    )}
                    <p className="text-xs text-slate-400">
                      使用 {template.usageCount} 次
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleStar(template.id)}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                      title={template.isStarred ? '取消收藏' : '收藏'}
                    >
                      <Star className={`w-4 h-4 ${template.isStarred ? 'text-yellow-500 fill-yellow-500' : 'text-slate-400'}`} />
                    </button>
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="ml-2 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs rounded-lg flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      使用
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
