import { useState, useEffect, useMemo } from 'react';
import { Timer, Plus, Trash2, Star, StarOff } from 'lucide-react';

interface Countdown {
  id: string;
  title: string;
  targetDate: string;
  icon: string;
  starred: boolean;
}

const COUNTDOWN_ICONS = ['🎂', '🎓', '💍', '✈️', '🏠', '🎯', '💰', '🎉', '❤️', '🌟'];

export default function CountdownWidget() {
  const [countdowns, setCountdowns] = useState<Countdown[]>(() => {
    const saved = localStorage.getItem('countdowns');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: '新年', targetDate: '2026-01-01', icon: '🎉', starred: true },
    ];
  });
  
  const [isAdding, setIsAdding] = useState(false);
  const [newCountdown, setNewCountdown] = useState({ title: '', targetDate: '', icon: '🎯' });
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    localStorage.setItem('countdowns', JSON.stringify(countdowns));
  }, [countdowns]);

  // 每秒更新时间
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAdd = () => {
    if (!newCountdown.title.trim() || !newCountdown.targetDate) return;
    
    setCountdowns([...countdowns, {
      id: Date.now().toString(),
      title: newCountdown.title.trim(),
      targetDate: newCountdown.targetDate,
      icon: newCountdown.icon,
      starred: false,
    }]);
    setNewCountdown({ title: '', targetDate: '', icon: '🎯' });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => setCountdowns(countdowns.filter(c => c.id !== id));
  const toggleStar = (id: string) => setCountdowns(countdowns.map(c => 
    c.id === id ? { ...c, starred: !c.starred } : c
  ));

  const getTimeLeft = (targetDate: string) => {
    const target = new Date(targetDate);
    const diff = target.getTime() - now.getTime();
    
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, passed: false };
  };

  // 按星标和日期排序
  const sortedCountdowns = useMemo(() => {
    return [...countdowns].sort((a, b) => {
      if (a.starred && !b.starred) return -1;
      if (!a.starred && b.starred) return 1;
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
    });
  }, [countdowns]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Timer className="w-4 h-4 text-purple-500" />
          倒计时
        </h3>
        <button
          onClick={() => setIsAdding(true)}
          className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 添加表单 */}
      {isAdding && (
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-2">
          <input
            type="text"
            placeholder="倒计时名称"
            value={newCountdown.title}
            onChange={(e) => setNewCountdown({...newCountdown, title: e.target.value})}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700"
            autoFocus
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={newCountdown.targetDate}
              onChange={(e) => setNewCountdown({...newCountdown, targetDate: e.target.value})}
              className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {COUNTDOWN_ICONS.map(icon => (
              <button
                key={icon}
                onClick={() => setNewCountdown({...newCountdown, icon})}
                className={`w-8 h-8 rounded ${newCountdown.icon === icon ? 'bg-purple-100 dark:bg-purple-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-600'}`}
              >
                {icon}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 py-1.5 text-sm bg-purple-600 text-white rounded-lg">添加</button>
            <button onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-sm bg-slate-200 dark:bg-slate-600 rounded-lg">取消</button>
          </div>
        </div>
      )}

      {/* 倒计时列表 */}
      <div className="space-y-3">
        {sortedCountdowns.map(countdown => {
          const timeLeft = getTimeLeft(countdown.targetDate);
          return (
            <div
              key={countdown.id}
              className={`p-3 rounded-lg border ${
                timeLeft.passed 
                  ? 'bg-slate-100 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600' 
                  : countdown.starred
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                  : 'bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-700'
              } group`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{countdown.icon}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{countdown.title}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleStar(countdown.id)} className={countdown.starred ? 'text-yellow-500' : 'text-slate-400'}>
                    {countdown.starred ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(countdown.id)} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {timeLeft.passed ? (
                <div className="text-center text-slate-500 dark:text-slate-400 text-sm">
                  已到达 ✓
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-1 text-center">
                  {[
                    { value: timeLeft.days, label: '天' },
                    { value: timeLeft.hours, label: '时' },
                    { value: timeLeft.minutes, label: '分' },
                    { value: timeLeft.seconds, label: '秒' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="text-xl font-bold text-purple-600 dark:text-purple-400 font-mono">
                        {String(item.value).padStart(2, '0')}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="text-xs text-slate-400 text-center mt-2">
                {new Date(countdown.targetDate).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          );
        })}
      </div>

      {countdowns.length === 0 && !isAdding && (
        <div className="text-center py-4 text-slate-400">
          <Timer className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">还没有倒计时</p>
          <button onClick={() => setIsAdding(true)} className="text-purple-500 text-sm mt-1">添加第一个</button>
        </div>
      )}
    </div>
  );
}
