import { useState } from 'react';
import { X, Search, Calendar, Tag } from 'lucide-react';
import { Event, EVENT_CATEGORIES, EventCategory } from '../types';
import { getEventStatus } from '../utils/dateUtils';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  events: Event[];
  onFiltersChange: (filtered: Event[]) => void;
}

export default function FilterPanel({ isOpen, onClose, events, onFiltersChange }: FilterPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [colorFilter, setColorFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const applyFilters = () => {
    let filtered = events;

    if (searchTerm.trim()) {
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(e => {
        const status = getEventStatus(e.date, e.progress);
        return status === statusFilter;
      });
    }

    if (colorFilter !== 'all') {
      filtered = filtered.filter(e => e.color === colorFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(e => e.category === categoryFilter);
    }

    // 日期区间筛选
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(e => new Date(e.date) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(e => new Date(e.date) <= end);
    }

    onFiltersChange(filtered);
  };

  const handleChange = () => {
    applyFilters();
  };

  const handleClear = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setColorFilter('all');
    setCategoryFilter('all');
    setStartDate('');
    setEndDate('');
    onFiltersChange(events);
  };

  // 快捷日期范围
  const setQuickDateRange = (range: 'week' | 'month' | 'quarter' | 'year' | 'all') => {
    const now = new Date();
    const start = new Date();
    
    switch (range) {
      case 'week':
        start.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(start);
        weekEnd.setDate(start.getDate() + 6);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(weekEnd.toISOString().split('T')[0]);
        break;
      case 'month':
        start.setDate(1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(monthEnd.toISOString().split('T')[0]);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start.setMonth(quarter * 3, 1);
        const quarterEnd = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(quarterEnd.toISOString().split('T')[0]);
        break;
      case 'year':
        start.setMonth(0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(yearEnd.toISOString().split('T')[0]);
        break;
      case 'all':
        setStartDate('');
        setEndDate('');
        break;
    }
    setTimeout(handleChange, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">筛选事件</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">搜索</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleChange();
                }}
                placeholder="搜索标题或描述..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">状态</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                handleChange();
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">所有状态</option>
              <option value="completed">已完成</option>
              <option value="today">今天</option>
              <option value="upcoming">即将到来</option>
              <option value="overdue">已逾期</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">颜色</label>
            <select
              value={colorFilter}
              onChange={(e) => {
                setColorFilter(e.target.value);
                handleChange();
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">所有颜色</option>
              <option value="red">红色</option>
              <option value="orange">橙色</option>
              <option value="amber">琥珀色</option>
              <option value="yellow">黄色</option>
              <option value="green">绿色</option>
              <option value="blue">蓝色</option>
              <option value="cyan">青色</option>
              <option value="teal">蓝绿色</option>
              <option value="pink">粉色</option>
              <option value="purple">紫色</option>
            </select>
          </div>

          {/* 事件分类 */}
          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-slate-700 mb-2">
              <Tag className="w-4 h-4" />
              事件分类
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setCategoryFilter('all');
                  handleChange();
                }}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                  categoryFilter === 'all'
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'border-slate-300 hover:bg-slate-50'
                }`}
              >
                全部
              </button>
              {EVENT_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => {
                    setCategoryFilter(cat.value);
                    handleChange();
                  }}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors flex items-center gap-1 ${
                    categoryFilter === cat.value
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 日期区间筛选 */}
          <div className="border-t border-slate-200 pt-4">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Calendar className="w-4 h-4" />
              日期区间
            </label>
            
            {/* 快捷选择 */}
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { key: 'all', label: '全部' },
                { key: 'week', label: '本周' },
                { key: 'month', label: '本月' },
                { key: 'quarter', label: '本季度' },
                { key: 'year', label: '今年' },
              ].map((range) => (
                <button
                  key={range.key}
                  type="button"
                  onClick={() => setQuickDateRange(range.key as any)}
                  className="px-3 py-1 text-xs rounded-full border border-slate-300 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* 自定义日期范围 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">开始日期</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    handleChange();
                  }}
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">结束日期</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    handleChange();
                  }}
                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {(startDate || endDate) && (
              <p className="text-xs text-slate-500 mt-2">
                📅 筛选范围：{startDate || '无限制'} 至 {endDate || '无限制'}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleClear}
              className="flex-1 px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              清除
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              完成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
