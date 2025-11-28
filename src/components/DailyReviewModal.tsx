import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Star, CheckCircle, XCircle, Lightbulb, FileText } from 'lucide-react';
import { DailyReview } from '../types';

interface DailyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (review: Omit<DailyReview, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  initialReview?: DailyReview;
  selectedDate?: string;
  isLoading?: boolean;
}

export default function DailyReviewModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialReview,
  selectedDate,
  isLoading = false 
}: DailyReviewModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [successes, setSuccesses] = useState<string[]>(['']);
  const [failures, setFailures] = useState<string[]>(['']);
  const [improvements, setImprovements] = useState<string[]>(['']);
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialReview) {
      setDate(initialReview.date.split('T')[0]);
      setSuccesses(initialReview.successes.length > 0 ? initialReview.successes : ['']);
      setFailures(initialReview.failures.length > 0 ? initialReview.failures : ['']);
      setImprovements(initialReview.improvements.length > 0 ? initialReview.improvements : ['']);
      setRating(initialReview.rating);
      setNotes(initialReview.notes || '');
    } else {
      setDate(selectedDate || new Date().toISOString().split('T')[0]);
      setSuccesses(['']);
      setFailures(['']);
      setImprovements(['']);
      setRating(3);
      setNotes('');
    }
  }, [initialReview, selectedDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      date: new Date(date).toISOString(),
      successes: successes.filter(s => s.trim() !== ''),
      failures: failures.filter(f => f.trim() !== ''),
      improvements: improvements.filter(i => i.trim() !== ''),
      rating,
      notes: notes.trim() || undefined,
    });
  };

  const addItem = (list: string[], setList: (items: string[]) => void) => {
    setList([...list, '']);
  };

  const removeItem = (list: string[], setList: (items: string[]) => void, index: number) => {
    if (list.length > 1) {
      setList(list.filter((_, i) => i !== index));
    }
  };

  const updateItem = (list: string[], setList: (items: string[]) => void, index: number, value: string) => {
    const newList = [...list];
    newList[index] = value;
    setList(newList);
  };

  if (!isOpen) return null;

  const renderListSection = (
    title: string,
    icon: React.ReactNode,
    items: string[],
    setItems: (items: string[]) => void,
    placeholder: string,
    bgColor: string
  ) => (
    <div className={`${bgColor} rounded-lg p-4`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-medium text-slate-800">{title}</h3>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(items, setItems, index, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(items, setItems, index)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addItem(items, setItems)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full my-8">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">
              {initialReview ? '编辑复盘' : '每日复盘'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* 日期选择 */}
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

          {/* 成功点 */}
          {renderListSection(
            '今日成功点',
            <CheckCircle className="w-5 h-5 text-green-600" />,
            successes,
            setSuccesses,
            '记录今天做得好的事情...',
            'bg-green-50'
          )}

          {/* 失败点 */}
          {renderListSection(
            '今日失败点',
            <XCircle className="w-5 h-5 text-red-600" />,
            failures,
            setFailures,
            '记录今天需要改进的地方...',
            'bg-red-50'
          )}

          {/* 明日改进 */}
          {renderListSection(
            '明日改进计划',
            <Lightbulb className="w-5 h-5 text-amber-600" />,
            improvements,
            setImprovements,
            '明天要怎么做得更好...',
            'bg-amber-50'
          )}

          {/* 评分 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-slate-800">今日评分</h3>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-lg transition-all ${
                    star <= rating 
                      ? 'text-yellow-500 scale-110' 
                      : 'text-slate-300 hover:text-yellow-400'
                  }`}
                >
                  <Star className={`w-8 h-8 ${star <= rating ? 'fill-current' : ''}`} />
                </button>
              ))}
              <span className="ml-2 text-lg font-semibold text-slate-700 self-center">
                {rating}/5
              </span>
            </div>
          </div>

          {/* 额外备注 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">额外备注（可选）</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="其他想记录的内容..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          {/* 按钮 */}
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
              {isLoading ? '保存中...' : '保存复盘'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
