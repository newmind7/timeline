import { PRESET_TEMPLATES, EventTemplate } from '../types';

interface TemplateSelectorProps {
  onSelect: (template: EventTemplate) => void;
  selectedId?: string;
}

export default function TemplateSelector({ onSelect, selectedId }: TemplateSelectorProps) {
  const categories = [
    { key: 'birthday', label: '生日' },
    { key: 'anniversary', label: '纪念日' },
    { key: 'goal', label: '目标' },
    { key: 'holiday', label: '节日' },
    { key: 'custom', label: '其他' },
  ];

  const getTemplatesByCategory = (category: string) => {
    return PRESET_TEMPLATES.filter(t => t.category === category);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-700">选择模板</label>
      
      <div className="grid grid-cols-5 gap-2">
        {PRESET_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template)}
            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
              selectedId === template.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
            }`}
          >
            <span className="text-2xl mb-1">{template.icon}</span>
            <span className="text-xs text-slate-600 text-center">{template.name}</span>
            {template.recurrence === 'yearly' && (
              <span className="text-[10px] text-blue-500 mt-1">每年</span>
            )}
          </button>
        ))}
      </div>

      <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
        💡 提示：选择"生日"或"纪念日"模板会自动设置为每年重复
      </div>
    </div>
  );
}
