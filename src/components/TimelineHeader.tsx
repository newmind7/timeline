import { Plus, LogOut, Filter, FileText, Download, Upload, Keyboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTimeline } from '../contexts/TimelineContext';
import { TimeScale, LayoutType, VIEW_TYPES, Event } from '../types';
import ThemeToggle from './ThemeToggle';
import GlobalSearch from './GlobalSearch';
import { SHORTCUTS_INFO } from '../hooks/useKeyboardShortcuts';

interface TimelineHeaderProps {
  onAddEvent: () => void;
  onFilterClick: () => void;
  onReviewClick: () => void;
  onExportClick: () => void;
  onImportClick: () => void;
  events: Event[];
  onSelectEvent: (event: Event) => void;
}

export default function TimelineHeader({ onAddEvent, onFilterClick, onReviewClick, onExportClick, onImportClick, events, onSelectEvent }: TimelineHeaderProps) {
  const { user, signOut } = useAuth();
  const { timeScale, setTimeScale, layoutType, setLayoutType } = useTimeline();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const timeScales: { value: TimeScale; label: string }[] = [
    { value: 'day', label: '日' },
    { value: 'week', label: '周' },
    { value: 'month', label: '月' },
    { value: 'quarter', label: '季度' },
    { value: 'year', label: '年' },
  ];

  
  return (
    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">我的时间线</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">追踪您的事件和目标</p>
          </div>
          <div className="flex items-center gap-4">
            <GlobalSearch events={events} onSelectEvent={onSelectEvent} />
            <span className="text-sm text-slate-600 dark:text-slate-400 hidden lg:inline">{user?.email}</span>
            <button
              onClick={onFilterClick}
              className="text-slate-600 hover:text-slate-900 transition-colors"
              title="筛选"
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              onClick={onReviewClick}
              className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 transition-colors"
              title="每日复盘 (R)"
            >
              <FileText className="w-5 h-5" />
              <span className="text-sm hidden sm:inline">复盘</span>
            </button>
            <button
              onClick={onExportClick}
              className="text-slate-600 hover:text-green-600 transition-colors"
              title="导出数据 (Ctrl+E)"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onImportClick}
              className="text-slate-600 hover:text-blue-600 transition-colors"
              title="导入数据"
            >
              <Upload className="w-5 h-5" />
            </button>
            <div className="relative group">
              <button
                className="text-slate-600 hover:text-slate-900 transition-colors"
                title="键盘快捷键"
              >
                <Keyboard className="w-5 h-5" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 p-3 hidden group-hover:block z-50">
                <h4 className="text-xs font-bold text-slate-700 mb-2">快捷键</h4>
                {SHORTCUTS_INFO.map((s, i) => (
                  <div key={i} className="flex justify-between text-xs py-1">
                    <span className="text-slate-500">{s.action}</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">{s.keys}</kbd>
                  </div>
                ))}
              </div>
            </div>
            <ThemeToggle />
            <button
              onClick={onAddEvent}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              新建事件
            </button>
            <button
              onClick={handleSignOut}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">视图：</span>
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg flex-wrap">
              {VIEW_TYPES.map(({ value, icon, label }) => (
                <button
                  key={value}
                  onClick={() => setLayoutType(value)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded transition-colors text-xs ${
                    layoutType === value
                      ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={label}
                >
                  <span>{icon}</span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">时间刻度：</span>
            <select
              value={timeScale}
              onChange={(e) => setTimeScale(e.target.value as TimeScale)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeScales.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
