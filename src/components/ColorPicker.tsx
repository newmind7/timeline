import { useState } from 'react';
import { Palette, Check, ChevronDown } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

const COLOR_PRESETS = [
  // 红色系
  { color: '#EF4444', name: '红色' },
  { color: '#F87171', name: '浅红' },
  { color: '#DC2626', name: '深红' },
  // 橙色系
  { color: '#F97316', name: '橙色' },
  { color: '#FB923C', name: '浅橙' },
  { color: '#EA580C', name: '深橙' },
  // 黄色系
  { color: '#EAB308', name: '黄色' },
  { color: '#FACC15', name: '浅黄' },
  { color: '#CA8A04', name: '深黄' },
  // 绿色系
  { color: '#22C55E', name: '绿色' },
  { color: '#4ADE80', name: '浅绿' },
  { color: '#16A34A', name: '深绿' },
  // 青色系
  { color: '#14B8A6', name: '青色' },
  { color: '#2DD4BF', name: '浅青' },
  { color: '#0D9488', name: '深青' },
  // 蓝色系
  { color: '#3B82F6', name: '蓝色' },
  { color: '#60A5FA', name: '浅蓝' },
  { color: '#2563EB', name: '深蓝' },
  // 紫色系
  { color: '#8B5CF6', name: '紫色' },
  { color: '#A78BFA', name: '浅紫' },
  { color: '#7C3AED', name: '深紫' },
  // 粉色系
  { color: '#EC4899', name: '粉色' },
  { color: '#F472B6', name: '浅粉' },
  { color: '#DB2777', name: '深粉' },
  // 灰色系
  { color: '#6B7280', name: '灰色' },
  { color: '#9CA3AF', name: '浅灰' },
  { color: '#4B5563', name: '深灰' },
];

const GRADIENT_PRESETS = [
  { colors: ['#3B82F6', '#8B5CF6'], name: '蓝紫渐变' },
  { colors: ['#F97316', '#EAB308'], name: '橙黄渐变' },
  { colors: ['#22C55E', '#14B8A6'], name: '绿青渐变' },
  { colors: ['#EC4899', '#8B5CF6'], name: '粉紫渐变' },
  { colors: ['#EF4444', '#F97316'], name: '红橙渐变' },
  { colors: ['#06B6D4', '#3B82F6'], name: '青蓝渐变' },
];

export default function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'solid' | 'gradient' | 'custom'>('solid');
  const [customColor, setCustomColor] = useState(value);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  const handleGradientSelect = (colors: string[]) => {
    // 返回渐变的第一个颜色作为主色
    onChange(colors[0]);
    setIsOpen(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 w-full"
      >
        <div 
          className="w-6 h-6 rounded-full border-2 border-white shadow"
          style={{ backgroundColor: value }}
        />
        <span className="flex-1 text-left text-sm text-slate-700 dark:text-slate-300">
          {COLOR_PRESETS.find(c => c.color === value)?.name || value}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 mt-1 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3">
            {/* 标签页 */}
            <div className="flex gap-1 mb-3 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
              {(['solid', 'gradient', 'custom'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1.5 text-xs rounded ${
                    activeTab === tab
                      ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow'
                      : 'text-slate-500'
                  }`}
                >
                  {tab === 'solid' ? '纯色' : tab === 'gradient' ? '渐变' : '自定义'}
                </button>
              ))}
            </div>

            {/* 纯色选择 */}
            {activeTab === 'solid' && (
              <div className="grid grid-cols-6 gap-2">
                {COLOR_PRESETS.map(preset => (
                  <button
                    key={preset.color}
                    onClick={() => handleColorSelect(preset.color)}
                    className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${
                      value === preset.color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                    }`}
                    style={{ backgroundColor: preset.color }}
                    title={preset.name}
                  >
                    {value === preset.color && (
                      <Check className="w-4 h-4 text-white mx-auto" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* 渐变选择 */}
            {activeTab === 'gradient' && (
              <div className="grid grid-cols-3 gap-2">
                {GRADIENT_PRESETS.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handleGradientSelect(preset.colors)}
                    className="h-12 rounded-lg transition-transform hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]})`
                    }}
                    title={preset.name}
                  />
                ))}
              </div>
            )}

            {/* 自定义颜色 */}
            {activeTab === 'custom' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customColor}
                    onChange={handleCustomColorChange}
                    className="w-12 h-12 rounded-lg cursor-pointer"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                          onChange(e.target.value);
                        }
                      }}
                      placeholder="#000000"
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleColorSelect(customColor)}
                  className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg"
                >
                  应用颜色
                </button>
              </div>
            )}

            {/* 当前选择预览 */}
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-lg"
                  style={{ backgroundColor: value }}
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  当前: {value}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
