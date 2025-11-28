import { useState, useEffect, useRef } from 'react';
import { X, Upload, Calendar, RefreshCw, Bell, Tag } from 'lucide-react';
import { Event, EventTemplate, PRESET_TEMPLATES, EVENT_CATEGORIES, EventCategory } from '../types';
import { colors, getColorClass } from '../utils/colorUtils';
import TemplateSelector from './TemplateSelector';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  initialEvent?: Event;
  isLoading?: boolean;
}

export default function EventModal({ isOpen, onClose, onSave, initialEvent, isLoading = false }: EventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [color, setColor] = useState('blue');
  const [progress, setProgress] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplate | null>(null);
  const [recurrence, setRecurrence] = useState<'none' | 'yearly' | 'monthly' | 'weekly'>('none');
  const [showTemplates, setShowTemplates] = useState(true);
  const [category, setCategory] = useState<EventCategory>('other');
  const [reminder, setReminder] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setDescription(initialEvent.description || '');
      setDate(initialEvent.date.split('T')[0]);
      setColor(initialEvent.color);
      setProgress(initialEvent.progress);
      setCategory(initialEvent.category || 'other');
      setReminder(initialEvent.reminder ?? true);
      setShowTemplates(false);
      setSelectedTemplate(null);
      setRecurrence('none');
    } else {
      setTitle('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setColor('blue');
      setProgress(0);
      setCategory('other');
      setReminder(true);
      setShowTemplates(true);
      setSelectedTemplate(null);
      setRecurrence('none');
    }
  }, [initialEvent, isOpen]);

  const handleTemplateSelect = (template: EventTemplate) => {
    setSelectedTemplate(template);
    setColor(template.color);
    setRecurrence(template.recurrence || 'none');
    if (template.id !== 'custom') {
      setDescription(`${template.icon} ${template.name}`);
    }
    setShowTemplates(false);
  };

  // 解析ICS文件
  const parseICSFile = (content: string): Array<{title: string; date: string; description?: string}> => {
    const events: Array<{title: string; date: string; description?: string}> = [];
    const lines = content.split(/\r?\n/);
    let currentEvent: {title?: string; date?: string; description?: string} = {};
    let inEvent = false;

    for (const line of lines) {
      if (line.startsWith('BEGIN:VEVENT')) {
        inEvent = true;
        currentEvent = {};
      } else if (line.startsWith('END:VEVENT')) {
        if (currentEvent.title && currentEvent.date) {
          events.push(currentEvent as {title: string; date: string; description?: string});
        }
        inEvent = false;
      } else if (inEvent) {
        if (line.startsWith('SUMMARY:')) {
          currentEvent.title = line.substring(8);
        } else if (line.startsWith('DTSTART')) {
          // 解析日期，支持多种格式
          const dateMatch = line.match(/:(\d{4})(\d{2})(\d{2})/);
          if (dateMatch) {
            currentEvent.date = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
          }
        } else if (line.startsWith('DESCRIPTION:')) {
          currentEvent.description = line.substring(12);
        }
      }
    }
    return events;
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const content = await file.text();
    const events = parseICSFile(content);
    
    if (events.length > 0) {
      // 导入第一个事件到表单
      const firstEvent = events[0];
      setTitle(firstEvent.title);
      setDate(firstEvent.date);
      if (firstEvent.description) {
        setDescription(firstEvent.description);
      }
      setShowTemplates(false);
      
      if (events.length > 1) {
        alert(`已导入第一个事件。日历文件中共有 ${events.length} 个事件，请分次导入。`);
      }
    } else {
      alert('未找到有效的日历事件');
    }
    
    // 清空文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title,
      description,
      date: new Date(date).toISOString(),
      color,
      progress,
      category,
      reminder,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full my-8">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            {initialEvent ? '编辑事件' : '新建事件'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* 导入日历按钮 */}
          {!initialEvent && (
            <div className="flex gap-2 mb-4">
              <input
                type="file"
                ref={fileInputRef}
                accept=".ics,.ical"
                onChange={handleFileImport}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                导入日历(.ics)
              </button>
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
                  showTemplates 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                {showTemplates ? '隐藏模板' : '选择模板'}
              </button>
            </div>
          )}

          {/* 模板选择器 */}
          {showTemplates && !initialEvent && (
            <TemplateSelector 
              onSelect={handleTemplateSelect} 
              selectedId={selectedTemplate?.id} 
            />
          )}

          {/* 已选模板显示 */}
          {selectedTemplate && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
              <span className="text-xl">{selectedTemplate.icon}</span>
              <span className="text-sm text-blue-700">已选择：{selectedTemplate.name}</span>
              <button 
                type="button" 
                onClick={() => {
                  setSelectedTemplate(null);
                  setShowTemplates(true);
                }}
                className="ml-auto text-xs text-blue-600 hover:underline"
              >
                更换
              </button>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="事件标题"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="事件描述（可选）"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 事件分类 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              事件分类
            </label>
            <div className="grid grid-cols-4 gap-2">
              {EVENT_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`px-2 py-2 text-xs rounded-lg border transition-colors flex items-center justify-center gap-1 ${
                    category === cat.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 重复设置 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <RefreshCw className="w-4 h-4 inline mr-1" />
              重复设置
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'none', label: '不重复' },
                { value: 'weekly', label: '每周' },
                { value: 'monthly', label: '每月' },
                { value: 'yearly', label: '每年' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRecurrence(opt.value as typeof recurrence)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    recurrence === opt.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {recurrence !== 'none' && (
              <p className="text-xs text-slate-500 mt-2">
                💡 此事件将{recurrence === 'yearly' ? '每年' : recurrence === 'monthly' ? '每月' : '每周'}自动重复
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">颜色</label>
            <div className="grid grid-cols-5 gap-2">
              {colors.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setColor(col)}
                  className={`w-full h-8 rounded-lg border-2 ${getColorClass(col)} ${
                    color === col ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              进度：{progress}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 提醒开关 */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Bell className={`w-5 h-5 ${reminder ? 'text-blue-600' : 'text-slate-400'}`} />
              <div>
                <span className="text-sm font-medium text-slate-700">事件提醒</span>
                <p className="text-xs text-slate-500">临近时发送浏览器通知</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReminder(!reminder)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                reminder ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  reminder ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isLoading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
