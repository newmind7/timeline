import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Check, Pause, Play } from 'lucide-react';

interface TimeBlock {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
  completed: boolean;
}

const COLORS = [
  { name: '工作', color: '#3B82F6' },
  { name: '学习', color: '#8B5CF6' },
  { name: '运动', color: '#10B981' },
  { name: '休息', color: '#F59E0B' },
  { name: '会议', color: '#EF4444' },
  { name: '其他', color: '#6B7280' },
];

export default function TimeBlocking() {
  const today = new Date().toISOString().split('T')[0];
  
  const [blocks, setBlocks] = useState<TimeBlock[]>(() => {
    const saved = localStorage.getItem(`timeBlocks_${today}`);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState(COLORS[0].color);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    localStorage.setItem(`timeBlocks_${today}`, JSON.stringify(blocks));
  }, [blocks, today]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const addBlock = () => {
    if (!title.trim()) return;

    const newBlock: TimeBlock = {
      id: Date.now().toString(),
      title: title.trim(),
      startTime,
      endTime,
      color,
      completed: false,
    };

    setBlocks(prev => [...prev, newBlock].sort((a, b) => a.startTime.localeCompare(b.startTime)));
    resetForm();
  };

  const toggleComplete = (id: string) => {
    setBlocks(prev => prev.map(b => 
      b.id === id ? { ...b, completed: !b.completed } : b
    ));
  };

  const deleteBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const resetForm = () => {
    setTitle('');
    setStartTime('09:00');
    setEndTime('10:00');
    setColor(COLORS[0].color);
    setIsAdding(false);
  };

  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    // 显示6:00-24:00的时间范围
    const startMinutes = 6 * 60;
    const endMinutes = 24 * 60;
    const position = ((totalMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
    return Math.max(0, Math.min(100, position));
  };

  const getBlockPosition = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 6 * 60;
    const endMinutes = 24 * 60;
    return ((totalMinutes - startMinutes) / (endMinutes - startMinutes)) * 100;
  };

  const getBlockDuration = (start: string, end: string) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const duration = (eh * 60 + em) - (sh * 60 + sm);
    if (duration >= 60) {
      return `${Math.floor(duration / 60)}h ${duration % 60}m`;
    }
    return `${duration}m`;
  };

  const isCurrentBlock = (start: string, end: string) => {
    const now = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`;
    return now >= start && now < end;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          时间块规划
        </h3>
        <span className="text-xs text-slate-500">
          {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* 时间线视图 */}
      <div className="relative h-[200px] mb-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2 overflow-hidden">
        {/* 时间刻度 */}
        <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-[10px] text-slate-400 py-1">
          {[6, 9, 12, 15, 18, 21, 24].map(hour => (
            <span key={hour}>{hour}:00</span>
          ))}
        </div>

        {/* 时间块区域 */}
        <div className="ml-12 relative h-full">
          {/* 当前时间线 */}
          <div 
            className="absolute left-0 right-0 h-0.5 bg-red-500 z-10"
            style={{ top: `${getCurrentTimePosition()}%` }}
          >
            <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full" />
          </div>

          {/* 时间块 */}
          {blocks.map(block => {
            const top = getBlockPosition(block.startTime);
            const bottom = getBlockPosition(block.endTime);
            const height = bottom - top;
            const isCurrent = isCurrentBlock(block.startTime, block.endTime);

            return (
              <div
                key={block.id}
                className={`absolute left-0 right-0 rounded px-2 py-1 text-xs text-white overflow-hidden transition-all ${
                  block.completed ? 'opacity-50' : ''
                } ${isCurrent ? 'ring-2 ring-red-400 ring-offset-1' : ''}`}
                style={{
                  top: `${top}%`,
                  height: `${Math.max(height, 5)}%`,
                  backgroundColor: block.color,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium truncate ${block.completed ? 'line-through' : ''}`}>
                    {block.title}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleComplete(block.id)}
                      className="p-0.5 hover:bg-white/20 rounded"
                    >
                      {block.completed ? <Play className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => deleteBlock(block.id)}
                      className="p-0.5 hover:bg-white/20 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <span className="text-[10px] opacity-80">
                  {block.startTime}-{block.endTime}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 添加时间块 */}
      {isAdding ? (
        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="时间块名称"
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700"
            autoFocus
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-slate-500">开始</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500">结束</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700"
              />
            </div>
          </div>
          <div className="flex gap-1 flex-wrap">
            {COLORS.map(c => (
              <button
                key={c.color}
                onClick={() => setColor(c.color)}
                className={`px-2 py-1 text-xs rounded ${
                  color === c.color ? 'ring-2 ring-offset-1 ring-blue-500' : ''
                }`}
                style={{ backgroundColor: c.color, color: 'white' }}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetForm}
              className="flex-1 py-2 text-sm text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg"
            >
              取消
            </button>
            <button
              onClick={addBlock}
              disabled={!title.trim()}
              className="flex-1 py-2 text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white rounded-lg"
            >
              添加
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center gap-1"
        >
          <Plus className="w-4 h-4" />
          添加时间块
        </button>
      )}
    </div>
  );
}
