import { Suspense, lazy, useState } from 'react';
import { Event } from '../types';
import { Loader2 } from 'lucide-react';

// 懒加载3D组件
const Timeline3DContent = lazy(() => import('./Timeline3DContent'));

interface Timeline3DWrapperProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
}

// 加载占位符
function LoadingFallback() {
  return (
    <div className="h-[500px] bg-slate-900 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-400">正在加载3D场景...</p>
      </div>
    </div>
  );
}

// 错误边界
function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="h-[500px] bg-slate-900 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-4">3D场景加载失败</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          重试
        </button>
      </div>
    </div>
  );
}

export default function Timeline3DWrapper({ events, onSelectEvent }: Timeline3DWrapperProps) {
  const [hasError, setHasError] = useState(false);
  const [key, setKey] = useState(0);

  if (hasError) {
    return <ErrorFallback onRetry={() => { setHasError(false); setKey(k => k + 1); }} />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Timeline3DContent 
        key={key}
        events={events} 
        onSelectEvent={onSelectEvent}
        onError={() => setHasError(true)}
      />
    </Suspense>
  );
}
