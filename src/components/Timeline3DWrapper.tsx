import { Suspense, lazy, useState, Component, ReactNode } from 'react';
import { Event } from '../types';
import { Loader2, AlertTriangle, Box } from 'lucide-react';

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

// 错误显示组件
function ErrorFallback({ onRetry, error }: { onRetry: () => void; error?: string }) {
  return (
    <div className="h-[500px] bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">3D场景暂时不可用</h3>
        <p className="text-slate-400 mb-4 text-sm">
          您的浏览器可能不支持WebGL，或者3D库加载失败。
        </p>
        {error && (
          <p className="text-red-400 text-xs mb-4 bg-red-900/20 rounded p-2">
            {error}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重试
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            刷新页面
          </button>
        </div>
      </div>
    </div>
  );
}

// React错误边界类组件
interface ErrorBoundaryState {
  hasError: boolean;
  error?: string;
}

class ErrorBoundary extends Component<
  { children: ReactNode; onError?: () => void; fallback: (props: { onRetry: () => void; error?: string }) => ReactNode },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('3D Scene Error:', error, errorInfo);
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback({
        onRetry: () => this.setState({ hasError: false, error: undefined }),
        error: this.state.error,
      });
    }
    return this.props.children;
  }
}

export default function Timeline3DWrapper({ events, onSelectEvent }: Timeline3DWrapperProps) {
  const [key, setKey] = useState(0);

  const handleRetry = () => {
    setKey(k => k + 1);
  };

  return (
    <ErrorBoundary 
      key={key}
      fallback={(props) => <ErrorFallback {...props} onRetry={handleRetry} />}
    >
      <Suspense fallback={<LoadingFallback />}>
        <Timeline3DContent 
          events={events} 
          onSelectEvent={onSelectEvent}
        />
      </Suspense>
    </ErrorBoundary>
  );
}
