import { useState } from 'react';
import { Filter, Calendar, CheckCircle, Clock, AlertTriangle, Star, Tag, Zap} from 'lucide-react';
import { Event, EVENT_CATEGORIES } from '../types';

interface QuickFilter {
  id: string;
  label: string;
  icon: React.ReactNode;
  filter: (events: Event[]) => Event[];
  color: string;
}

interface QuickFiltersProps {
  events: Event[];
  onFilterChange: (filteredEvents: Event[] | null) => void;
}

export default function QuickFilters({ events, onFilterChange }: QuickFiltersProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filters: QuickFilter[] = [
    {
      id: 'today',
      label: '今天',
      icon: <Calendar className="w-3 h-3" />,
      filter: (events) => events.filter(e => 
        e.date.startsWith(new Date().toISOString().split('T')[0])
      ),
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      id: 'week',
      label: '本周',
      icon: <Calendar className="w-3 h-3" />,
      filter: (events) => {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + 1);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return events.filter(e => {
          const date = new Date(e.date);
          return date >= weekStart && date <= weekEnd;
        });
      },
      color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    },
    {
      id: 'completed',
      label: '已完成',
      icon: <CheckCircle className="w-3 h-3" />,
      filter: (events) => events.filter(e => e.progress === 100),
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      id: 'inProgress',
      label: '进行中',
      icon: <Zap className="w-3 h-3" />,
      filter: (events) => events.filter(e => e.progress > 0 && e.progress < 100),
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    },
    {
      id: 'overdue',
      label: '已逾期',
      icon: <AlertTriangle className="w-3 h-3" />,
      filter: (events) => events.filter(e => 
        new Date(e.date) < new Date() && e.progress < 100
      ),
      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    },
    {
      id: 'upcoming',
      label: '即将到来',
      icon: <Clock className="w-3 h-3" />,
      filter: (events) => events.filter(e => {
        const date = new Date(e.date);
        const now = new Date();
        const diff = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diff > 0 && diff <= 7 && e.progress < 100;
      }),
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    },
    {
      id: 'starred',
      label: '星标',
      icon: <Star className="w-3 h-3" />,
      filter: (events) => {
        const starred = JSON.parse(localStorage.getItem('starredEvents') || '[]');
        return events.filter(e => starred.includes(e.id));
      },
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    {
      id: 'noProgress',
      label: '未开始',
      icon: <Clock className="w-3 h-3" />,
      filter: (events) => events.filter(e => e.progress === 0),
      color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400',
    },
  ];

  const handleFilterClick = (filter: QuickFilter) => {
    if (activeFilter === filter.id) {
      setActiveFilter(null);
      onFilterChange(null);
    } else {
      setActiveFilter(filter.id);
      onFilterChange(filter.filter(events));
    }
  };

  const getFilterCount = (filter: QuickFilter) => {
    return filter.filter(events).length;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-500" />
          快速筛选
        </h3>
        {activeFilter && (
          <button
            onClick={() => {
              setActiveFilter(null);
              onFilterChange(null);
            }}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            清除筛选
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map(filter => {
          const count = getFilterCount(filter);
          const isActive = activeFilter === filter.id;
          
          return (
            <button
              key={filter.id}
              onClick={() => handleFilterClick(filter)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs transition-all ${
                isActive
                  ? `${filter.color} ring-2 ring-offset-1 ring-current`
                  : `${filter.color} opacity-70 hover:opacity-100`
              }`}
            >
              {filter.icon}
              <span>{filter.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                isActive ? 'bg-white/30' : 'bg-black/10 dark:bg-white/10'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 分类筛选 */}
      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 mb-2">按分类</p>
        <div className="flex flex-wrap gap-1">
          {EVENT_CATEGORIES.map(cat => {
            const count = events.filter(e => e.category === cat.value).length;
            if (count === 0) return null;
            
            return (
              <button
                key={cat.value}
                onClick={() => {
                  if (activeFilter === `cat_${cat.value}`) {
                    setActiveFilter(null);
                    onFilterChange(null);
                  } else {
                    setActiveFilter(`cat_${cat.value}`);
                    onFilterChange(events.filter(e => e.category === cat.value));
                  }
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                  activeFilter === `cat_${cat.value}`
                    ? 'bg-slate-200 dark:bg-slate-600 ring-1 ring-slate-400'
                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="text-slate-600 dark:text-slate-400">{cat.label}</span>
                <span className="text-slate-400">({count})</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
