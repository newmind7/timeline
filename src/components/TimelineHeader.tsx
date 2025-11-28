import { Plus, LogOut, Grid3x3, List, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTimeline } from '../contexts/TimelineContext';
import { TimeScale, LayoutType } from '../types';

interface TimelineHeaderProps {
  onAddEvent: () => void;
  onFilterClick: () => void;
}

export default function TimelineHeader({ onAddEvent, onFilterClick }: TimelineHeaderProps) {
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

  const layoutOptions: { value: LayoutType; icon: typeof Grid3x3; label: string }[] = [
    { value: 'vertical', icon: List, label: '垂直' },
    { value: 'horizontal', icon: Grid3x3, label: '水平' },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">我的时间线</h1>
            <p className="text-slate-600 mt-1">追踪您的事件和目标</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.email}</span>
            <button
              onClick={onFilterClick}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Filter className="w-5 h-5" />
            </button>
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
            <span className="text-sm font-medium text-slate-700">视图：</span>
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
              {layoutOptions.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setLayoutType(value)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded transition-colors ${
                    layoutType === value
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">时间刻度：</span>
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
