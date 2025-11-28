import { useState, useEffect } from 'react';
import { Camera, Trash2, ChevronDown, ChevronUp, Calendar, TrendingUp } from 'lucide-react';
import { Event } from '../types';

interface Snapshot {
  id: string;
  date: string;
  totalEvents: number;
  completedEvents: number;
  completionRate: number;
  note?: string;
}

interface ProgressSnapshotsProps {
  events: Event[];
}

export default function ProgressSnapshots({ events }: ProgressSnapshotsProps) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>(() => {
    const saved = localStorage.getItem('progressSnapshots');
    return saved ? JSON.parse(saved) : [];
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    localStorage.setItem('progressSnapshots', JSON.stringify(snapshots));
  }, [snapshots]);

  const takeSnapshot = () => {
    const completed = events.filter(e => e.progress === 100).length;
    const rate = events.length > 0 ? Math.round((completed / events.length) * 100) : 0;

    const snapshot: Snapshot = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      totalEvents: events.length,
      completedEvents: completed,
      completionRate: rate,
      note: note.trim() || undefined,
    };

    setSnapshots(prev => [snapshot, ...prev].slice(0, 20)); // 最多保留20个
    setNote('');
  };

  const deleteSnapshot = (id: string) => {
    setSnapshots(prev => prev.filter(s => s.id !== id));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 计算趋势
  const getTrend = (current: number, previous?: number) => {
    if (previous === undefined) return null;
    const diff = current - previous;
    if (diff > 0) return { direction: 'up', value: diff };
    if (diff < 0) return { direction: 'down', value: Math.abs(diff) };
    return { direction: 'same', value: 0 };
  };

  const currentStats = {
    total: events.length,
    completed: events.filter(e => e.progress === 100).length,
    rate: events.length > 0 ? Math.round((events.filter(e => e.progress === 100).length / events.length) * 100) : 0,
  };

  const lastSnapshot = snapshots[0];
  const trend = lastSnapshot ? getTrend(currentStats.rate, lastSnapshot.completionRate) : null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Camera className="w-4 h-4 text-pink-500" />
          进度快照
        </h3>
        <span className="text-xs text-slate-500">{snapshots.length} 条记录</span>
      </div>

      {/* 当前状态 */}
      <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500">当前完成率</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                {currentStats.rate}%
              </span>
              {trend && (
                <span className={`text-xs ${
                  trend.direction === 'up' ? 'text-green-500' : 
                  trend.direction === 'down' ? 'text-red-500' : 'text-slate-400'
                }`}>
                  {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}
                  {trend.value}%
                </span>
              )}
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>{currentStats.completed}/{currentStats.total}</p>
            <p>已完成/总数</p>
          </div>
        </div>
      </div>

      {/* 拍摄快照 */}
      <div className="mb-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="添加备注 (可选)"
            className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700"
          />
          <button
            onClick={takeSnapshot}
            className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm rounded-lg flex items-center gap-1"
          >
            <Camera className="w-4 h-4" />
            快照
          </button>
        </div>
      </div>

      {/* 历史记录 */}
      {snapshots.length > 0 && (
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-sm text-slate-600 dark:text-slate-400 mb-2"
          >
            <span>历史记录</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isExpanded && (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {snapshots.map((snapshot, index) => {
                const prevSnapshot = snapshots[index + 1];
                const snapshotTrend = getTrend(snapshot.completionRate, prevSnapshot?.completionRate);

                return (
                  <div
                    key={snapshot.id}
                    className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {snapshot.completionRate}%
                        </span>
                        {snapshotTrend && snapshotTrend.direction !== 'same' && (
                          <span className={`text-xs ${
                            snapshotTrend.direction === 'up' ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {snapshotTrend.direction === 'up' ? '↑' : '↓'}{snapshotTrend.value}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(snapshot.date)}
                        <span>({snapshot.completedEvents}/{snapshot.totalEvents})</span>
                      </div>
                      {snapshot.note && (
                        <p className="text-xs text-slate-400 mt-1">{snapshot.note}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteSnapshot(snapshot.id)}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
