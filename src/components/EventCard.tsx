import { useState } from 'react';
import { Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Event } from '../types';
import { formatDate, getEventStatus, daysUntil } from '../utils/dateUtils';
import { getColorClass, getProgressColor } from '../utils/colorUtils';
import SubtaskList from './SubtaskList';

interface EventCardProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
  onProgressChange: (eventId: string, progress: number) => void;
}

export default function EventCard({ event, onEdit, onDelete, onProgressChange }: EventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [progress, setProgress] = useState(event.progress);
  const status = getEventStatus(event.date, progress);
  const daysText = daysUntil(event.date);

  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">已完成</span>;
      case 'overdue':
        return <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-700 rounded-full">已逾期</span>;
      case 'today':
        return <span className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-700 rounded-full">今天</span>;
      case 'upcoming':
        return <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">即将到来</span>;
    }
  };

  const handleSubtaskProgressChange = (completed: number, total: number) => {
    if (total === 0) return;
    const newProgress = Math.round((completed / total) * 100);
    setProgress(newProgress);
    onProgressChange(event.id, newProgress);
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${getColorClass(event.color)}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm opacity-75">{formatDate(event.date, 'long')}</span>
            {getStatusBadge()}
          </div>
        </div>
        <div className="flex gap-2 ml-2">
          <button
            onClick={() => onEdit(event)}
            className="text-slate-600 hover:text-blue-600 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(event.id)}
            className="text-slate-600 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {event.description && (
        <p className="text-sm opacity-80 mb-3">{event.description}</p>
      )}

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">进度</span>
          <span className="text-sm font-semibold">{progress}%</span>
        </div>
        <div className="w-full bg-white bg-opacity-40 rounded-full h-2">
          <div
            className={`h-full rounded-full transition-all ${getProgressColor(status)}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800 transition-colors"
      >
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {expanded ? '隐藏' : '显示'}详情
      </button>

      {expanded && (
        <SubtaskList eventId={event.id} onProgressChange={handleSubtaskProgressChange} />
      )}
    </div>
  );
}
