import { useState, useEffect, useMemo } from 'react';
import { Sun, Moon, CheckCircle, XCircle, TrendingUp, Star, Save, Edit2 } from 'lucide-react';
import { Event } from '../types';

interface DailyReviewData {
  date: string;
  completedCount: number;
  totalCount: number;
  highlights: string[];
  improvements: string[];
  mood: 1 | 2 | 3 | 4 | 5;
  notes: string;
}

interface DailyReviewProps {
  events: Event[];
}

export default function DailyReview({ events }: DailyReviewProps) {
  const today = new Date().toISOString().split('T')[0];
  
  const [review, setReview] = useState<DailyReviewData>(() => {
    const saved = localStorage.getItem(`dailyReview_${today}`);
    return saved ? JSON.parse(saved) : {
      date: today,
      completedCount: 0,
      totalCount: 0,
      highlights: [],
      improvements: [],
      mood: 3,
      notes: '',
    };
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [newHighlight, setNewHighlight] = useState('');
  const [newImprovement, setNewImprovement] = useState('');

  // 今日事件统计
  const todayStats = useMemo(() => {
    const todayEvents = events.filter(e => e.date.startsWith(today));
    const completed = todayEvents.filter(e => e.progress === 100);
    const inProgress = todayEvents.filter(e => e.progress > 0 && e.progress < 100);
    
    return {
      total: todayEvents.length,
      completed: completed.length,
      inProgress: inProgress.length,
      completionRate: todayEvents.length > 0 
        ? Math.round((completed.length / todayEvents.length) * 100) 
        : 0,
    };
  }, [events, today]);

  useEffect(() => {
    setReview(prev => ({
      ...prev,
      completedCount: todayStats.completed,
      totalCount: todayStats.total,
    }));
  }, [todayStats]);

  useEffect(() => {
    localStorage.setItem(`dailyReview_${today}`, JSON.stringify(review));
  }, [review, today]);

  const addHighlight = () => {
    if (!newHighlight.trim()) return;
    setReview(prev => ({
      ...prev,
      highlights: [...prev.highlights, newHighlight.trim()],
    }));
    setNewHighlight('');
  };

  const addImprovement = () => {
    if (!newImprovement.trim()) return;
    setReview(prev => ({
      ...prev,
      improvements: [...prev.improvements, newImprovement.trim()],
    }));
    setNewImprovement('');
  };

  const removeItem = (type: 'highlights' | 'improvements', index: number) => {
    setReview(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const moods = [
    { value: 1, emoji: '😫', label: '很糟' },
    { value: 2, emoji: '😕', label: '不好' },
    { value: 3, emoji: '😐', label: '一般' },
    { value: 4, emoji: '😊', label: '不错' },
    { value: 5, emoji: '🤩', label: '很棒' },
  ];

  const currentHour = new Date().getHours();
  const isEvening = currentHour >= 18 || currentHour < 6;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          {isEvening ? <Moon className="w-4 h-4 text-indigo-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
          每日回顾
        </h3>
        <span className="text-xs text-slate-500">
          {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* 今日统计 */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span className="font-bold">{todayStats.completed}</span>
          </div>
          <p className="text-[10px] text-slate-500">完成</p>
        </div>
        <div className="text-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400">
            <TrendingUp className="w-4 h-4" />
            <span className="font-bold">{todayStats.inProgress}</span>
          </div>
          <p className="text-[10px] text-slate-500">进行中</p>
        </div>
        <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400">
            <Star className="w-4 h-4" />
            <span className="font-bold">{todayStats.completionRate}%</span>
          </div>
          <p className="text-[10px] text-slate-500">完成率</p>
        </div>
      </div>

      {/* 今日心情 */}
      <div className="mb-4">
        <p className="text-xs text-slate-500 mb-2">今日心情</p>
        <div className="flex justify-between">
          {moods.map(m => (
            <button
              key={m.value}
              onClick={() => setReview(prev => ({ ...prev, mood: m.value as any }))}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                review.mood === m.value
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 scale-110'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span className="text-xl">{m.emoji}</span>
              <span className="text-[10px] text-slate-500">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 亮点 */}
      <div className="mb-4">
        <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-green-500" />
          今日亮点
        </p>
        <div className="space-y-1 mb-2">
          {review.highlights.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="text-green-500">✓</span>
              <span className="flex-1">{item}</span>
              <button
                onClick={() => removeItem('highlights', index)}
                className="text-slate-400 hover:text-red-500"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newHighlight}
            onChange={(e) => setNewHighlight(e.target.value)}
            placeholder="添加亮点..."
            className="flex-1 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700"
            onKeyPress={(e) => e.key === 'Enter' && addHighlight()}
          />
          <button
            onClick={addHighlight}
            className="px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            +
          </button>
        </div>
      </div>

      {/* 改进点 */}
      <div className="mb-4">
        <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-amber-500" />
          待改进
        </p>
        <div className="space-y-1 mb-2">
          {review.improvements.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <span className="text-amber-500">→</span>
              <span className="flex-1">{item}</span>
              <button
                onClick={() => removeItem('improvements', index)}
                className="text-slate-400 hover:text-red-500"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newImprovement}
            onChange={(e) => setNewImprovement(e.target.value)}
            placeholder="添加改进点..."
            className="flex-1 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700"
            onKeyPress={(e) => e.key === 'Enter' && addImprovement()}
          />
          <button
            onClick={addImprovement}
            className="px-2 py-1 text-sm bg-amber-500 text-white rounded hover:bg-amber-600"
          >
            +
          </button>
        </div>
      </div>

      {/* 备注 */}
      <div>
        <p className="text-xs text-slate-500 mb-2">备注</p>
        <textarea
          value={review.notes}
          onChange={(e) => setReview(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="记录今天的想法..."
          className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 resize-none"
          rows={2}
        />
      </div>
    </div>
  );
}
