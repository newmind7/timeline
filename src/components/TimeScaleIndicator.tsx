import { ZoomIn, ZoomOut } from 'lucide-react';
import { TimeScale } from '../types';

interface TimeScaleIndicatorProps {
  timeScale: TimeScale;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const timeScaleLabels: Record<TimeScale, string> = {
  day: '日',
  week: '周',
  month: '月',
  quarter: '季度',
  year: '年',
};

const timeScaleOrder: TimeScale[] = ['day', 'week', 'month', 'quarter', 'year'];

export default function TimeScaleIndicator({ timeScale, onZoomIn, onZoomOut }: TimeScaleIndicatorProps) {
  const currentIndex = timeScaleOrder.indexOf(timeScale);
  const canZoomIn = currentIndex > 0;
  const canZoomOut = currentIndex < timeScaleOrder.length - 1;

  return (
    <div className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-white rounded-full shadow-lg px-4 py-2 border border-slate-200">
      <button
        onClick={onZoomIn}
        disabled={!canZoomIn}
        className={`p-2 rounded-full transition-colors ${
          canZoomIn 
            ? 'hover:bg-slate-100 text-slate-700' 
            : 'text-slate-300 cursor-not-allowed'
        }`}
        title="放大（查看更细节）"
      >
        <ZoomIn className="w-5 h-5" />
      </button>
      
      <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium text-sm min-w-[60px] text-center">
        {timeScaleLabels[timeScale]}视图
      </div>
      
      <button
        onClick={onZoomOut}
        disabled={!canZoomOut}
        className={`p-2 rounded-full transition-colors ${
          canZoomOut 
            ? 'hover:bg-slate-100 text-slate-700' 
            : 'text-slate-300 cursor-not-allowed'
        }`}
        title="缩小（查看更宏观）"
      >
        <ZoomOut className="w-5 h-5" />
      </button>
      
      <div className="text-xs text-slate-400 ml-2 hidden sm:block">
        滚轮缩放
      </div>
    </div>
  );
}

// 导出工具函数
export const getNextTimeScale = (current: TimeScale, direction: 'in' | 'out'): TimeScale | null => {
  const currentIndex = timeScaleOrder.indexOf(current);
  
  if (direction === 'in' && currentIndex > 0) {
    return timeScaleOrder[currentIndex - 1];
  }
  if (direction === 'out' && currentIndex < timeScaleOrder.length - 1) {
    return timeScaleOrder[currentIndex + 1];
  }
  return null;
};
