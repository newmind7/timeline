import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface QuickDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
}

const QUICK_OPTIONS = [
  { label: '今天', days: 0 },
  { label: '明天', days: 1 },
  { label: '后天', days: 2 },
  { label: '下周', days: 7 },
  { label: '下月', days: 30 },
];

export default function QuickDatePicker({ value, onChange, label }: QuickDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    return value ? new Date(value) : new Date();
  });

  const selectedDate = value ? new Date(value) : null;

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1; // 周一为第一天
  };

  const handleQuickSelect = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    onChange(date.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const handleDateClick = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(date.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      viewDate.getFullYear() === today.getFullYear() &&
      viewDate.getMonth() === today.getMonth() &&
      day === today.getDate()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      viewDate.getFullYear() === selectedDate.getFullYear() &&
      viewDate.getMonth() === selectedDate.getMonth() &&
      day === selectedDate.getDate()
    );
  };

  const isPast = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const formatDisplayDate = () => {
    if (!value) return '选择日期';
    const date = new Date(value);
    const today = new Date();
    const diff = Math.ceil((date.getTime() - today.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return '今天';
    if (diff === 1) return '明天';
    if (diff === 2) return '后天';
    if (diff === -1) return '昨天';
    
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' });
  };

  const daysInMonth = getDaysInMonth(viewDate);
  const firstDay = getFirstDayOfMonth(viewDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

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
        className="flex items-center gap-2 w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <Calendar className="w-4 h-4 text-slate-400" />
        <span className="flex-1 text-left text-sm text-slate-700 dark:text-slate-300">
          {formatDisplayDate()}
        </span>
        <Clock className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 mt-1 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 animate-fadeInUp">
            {/* 快捷选项 */}
            <div className="flex flex-wrap gap-1 mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
              {QUICK_OPTIONS.map(opt => (
                <button
                  key={opt.label}
                  onClick={() => handleQuickSelect(opt.days)}
                  className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* 月份导航 */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={prevMonth}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              >
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              </button>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {viewDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
              </span>
              <button
                onClick={nextMonth}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              >
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* 星期标题 */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['一', '二', '三', '四', '五', '六', '日'].map(day => (
                <div key={day} className="text-center text-xs text-slate-400 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* 日期网格 */}
            <div className="grid grid-cols-7 gap-1">
              {emptyDays.map(i => (
                <div key={`empty-${i}`} />
              ))}
              {days.map(day => (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`
                    w-8 h-8 text-sm rounded-lg transition-all
                    ${isSelected(day)
                      ? 'bg-blue-500 text-white'
                      : isToday(day)
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : isPast(day)
                          ? 'text-slate-300 dark:text-slate-600'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }
                  `}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* 今天按钮 */}
            <button
              onClick={() => handleQuickSelect(0)}
              className="w-full mt-3 py-1.5 text-xs text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              回到今天
            </button>
          </div>
        </>
      )}
    </div>
  );
}
