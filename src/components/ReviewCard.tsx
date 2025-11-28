import { useState } from 'react';
import { Edit2, Trash2, Star, CheckCircle, XCircle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { DailyReview } from '../types';

interface ReviewCardProps {
  review: DailyReview;
  onEdit: (review: DailyReview) => void;
  onDelete: (id: string) => void;
}

export default function ReviewCard({ review, onEdit, onDelete }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-100 border-green-300';
    if (rating >= 3) return 'bg-blue-100 border-blue-300';
    if (rating >= 2) return 'bg-amber-100 border-amber-300';
    return 'bg-red-100 border-red-300';
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${getRatingColor(review.rating)} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg text-slate-800">{formatDate(review.date)}</h3>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`w-4 h-4 ${
                  star <= review.rating 
                    ? 'text-yellow-500 fill-current' 
                    : 'text-slate-300'
                }`} 
              />
            ))}
            <span className="text-sm text-slate-600 ml-1">{review.rating}/5</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(review)}
            className="text-slate-600 hover:text-blue-600 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(review.id)}
            className="text-slate-600 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 摘要预览 */}
      <div className="flex gap-4 text-sm text-slate-600 mb-2">
        <span className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4 text-green-600" />
          {review.successes.length} 个成功
        </span>
        <span className="flex items-center gap-1">
          <XCircle className="w-4 h-4 text-red-600" />
          {review.failures.length} 个失败
        </span>
        <span className="flex items-center gap-1">
          <Lightbulb className="w-4 h-4 text-amber-600" />
          {review.improvements.length} 个改进
        </span>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800 transition-colors"
      >
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {expanded ? '收起' : '展开'}详情
      </button>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
          {/* 成功点 */}
          {review.successes.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 font-medium text-green-700 mb-2">
                <CheckCircle className="w-4 h-4" />
                成功点
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                {review.successes.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 失败点 */}
          {review.failures.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 font-medium text-red-700 mb-2">
                <XCircle className="w-4 h-4" />
                失败点
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                {review.failures.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 改进计划 */}
          {review.improvements.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 font-medium text-amber-700 mb-2">
                <Lightbulb className="w-4 h-4" />
                明日改进
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                {review.improvements.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 备注 */}
          {review.notes && (
            <div className="bg-white bg-opacity-50 rounded-lg p-3">
              <p className="text-sm text-slate-600">{review.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
