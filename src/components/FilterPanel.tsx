import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { Event } from '../types';
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

    onFiltersChange(filtered);
  };

  const handleChange = () => {
    applyFilters();
  };

  const handleClear = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setColorFilter('all');
    onFiltersChange(events);
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
            </select>
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
