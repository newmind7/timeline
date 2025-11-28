import { useState, useEffect } from 'react';
import { Plus, Check, Flame, Trash2 } from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  streak: number;
  completedDates: string[];
}

const HABIT_ICONS = ['💪', '📚', '🏃', '💧', '🧘', '✍️', '🎯', '💤', '🥗', '🎨'];
// 预留颜色配置供未来使用

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habits');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: '锻炼', icon: '💪', color: 'blue', streak: 3, completedDates: [] },
      { id: '2', name: '阅读', icon: '📚', color: 'green', streak: 5, completedDates: [] },
      { id: '3', name: '冥想', icon: '🧘', color: 'purple', streak: 0, completedDates: [] },
    ];
  });
  
  const [isAdding, setIsAdding] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', icon: '💪', color: 'blue' });
  
  const today = new Date().toISOString().split('T')[0];

  // 保存到本地存储
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  // 检查今天是否完成
  const isCompletedToday = (habit: Habit) => habit.completedDates.includes(today);

  // 切换今日完成状态
  const toggleToday = (habitId: string) => {
    setHabits(habits.map(h => {
      if (h.id !== habitId) return h;
      
      const completed = h.completedDates.includes(today);
      let newDates: string[];
      let newStreak: number;

      if (completed) {
        newDates = h.completedDates.filter(d => d !== today);
        newStreak = Math.max(0, h.streak - 1);
      } else {
        newDates = [...h.completedDates, today];
        // 检查是否连续
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        newStreak = h.completedDates.includes(yesterdayStr) ? h.streak + 1 : 1;
      }

      return { ...h, completedDates: newDates, streak: newStreak };
    }));
  };

  // 添加新习惯
  const handleAddHabit = () => {
    if (!newHabit.name.trim()) return;
    
    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name.trim(),
      icon: newHabit.icon,
      color: newHabit.color,
      streak: 0,
      completedDates: [],
    };
    
    setHabits([...habits, habit]);
    setNewHabit({ name: '', icon: '💪', color: 'blue' });
    setIsAdding(false);
  };

  // 删除习惯
  const handleDelete = (id: string) => {
    if (confirm('确定删除这个习惯吗？')) {
      setHabits(habits.filter(h => h.id !== id));
    }
  };

  // 获取最近7天的日期
  const getLast7Days = () => {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  // 计算总体完成率
  const todayCompleted = habits.filter(h => isCompletedToday(h)).length;
  const completionRate = habits.length > 0 ? Math.round((todayCompleted / habits.length) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-900 dark:text-white">习惯打卡</h3>
          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 rounded-full">
            {todayCompleted}/{habits.length}
          </span>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 进度条 */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-500 dark:text-slate-400">今日进度</span>
          <span className="text-slate-700 dark:text-slate-300">{completionRate}%</span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* 添加习惯表单 */}
      {isAdding && (
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-2">
          <input
            type="text"
            placeholder="习惯名称"
            value={newHabit.name}
            onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700"
            autoFocus
          />
          <div className="flex gap-2">
            <div className="flex gap-1 flex-wrap">
              {HABIT_ICONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => setNewHabit({...newHabit, icon})}
                  className={`w-8 h-8 rounded ${newHabit.icon === icon ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddHabit} className="flex-1 py-1.5 text-sm bg-blue-600 text-white rounded-lg">添加</button>
            <button onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-sm bg-slate-200 dark:bg-slate-600 rounded-lg">取消</button>
          </div>
        </div>
      )}

      {/* 习惯列表 */}
      <div className="space-y-2">
        {habits.map(habit => {
          const completed = isCompletedToday(habit);
          return (
            <div
              key={habit.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                completed ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              {/* 完成按钮 */}
              <button
                onClick={() => toggleToday(habit.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  completed 
                    ? 'bg-green-500 text-white' 
                    : 'border-2 border-slate-300 dark:border-slate-600 hover:border-green-500'
                }`}
              >
                {completed && <Check className="w-4 h-4" />}
              </button>

              {/* 图标和名称 */}
              <span className="text-xl">{habit.icon}</span>
              <span className={`flex-1 text-sm ${completed ? 'text-green-700 dark:text-green-300 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                {habit.name}
              </span>

              {/* 连续天数 */}
              {habit.streak > 0 && (
                <span className="flex items-center gap-1 text-xs text-orange-500">
                  <Flame className="w-3 h-3" />
                  {habit.streak}天
                </span>
              )}

              {/* 删除按钮 */}
              <button
                onClick={() => handleDelete(habit.id)}
                className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* 本周打卡情况 */}
      {habits.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">本周记录</div>
          <div className="grid grid-cols-7 gap-1">
            {last7Days.map((date) => {
              const d = new Date(date);
              const completedCount = habits.filter(h => h.completedDates.includes(date)).length;
              const isToday = date === today;
              return (
                <div key={date} className="text-center">
                  <div className="text-xs text-slate-400 mb-1">{weekDays[d.getDay()]}</div>
                  <div className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center text-xs font-medium ${
                    isToday 
                      ? 'ring-2 ring-blue-500' 
                      : ''
                  } ${
                    completedCount === habits.length && habits.length > 0
                      ? 'bg-green-500 text-white'
                      : completedCount > 0
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-700'
                  }`}>
                    {completedCount > 0 ? completedCount : '-'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {habits.length === 0 && !isAdding && (
        <div className="text-center py-4 text-slate-400">
          <p className="text-sm">还没有习惯</p>
          <button onClick={() => setIsAdding(true)} className="text-blue-500 text-sm mt-1">添加第一个</button>
        </div>
      )}
    </div>
  );
}
