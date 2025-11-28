import { useState, useEffect, useMemo } from 'react';
import { Target, Plus, Check, Trash2, Edit2, Calendar, TrendingUp, Award } from 'lucide-react';

interface PeriodGoal {
  id: string;
  title: string;
  type: 'weekly' | 'monthly';
  target: number;
  current: number;
  unit: string;
  startDate: string;
  color: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function PeriodGoals() {
  const [goals, setGoals] = useState<PeriodGoal[]>(() => {
    const saved = localStorage.getItem('periodGoals');
    return saved ? JSON.parse(saved) : [];
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly'>('weekly');

  // 表单状态
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState(5);
  const [unit, setUnit] = useState('次');
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    localStorage.setItem('periodGoals', JSON.stringify(goals));
  }, [goals]);

  // 获取当前周期的开始日期
  const getPeriodStart = (type: 'weekly' | 'monthly') => {
    const now = new Date();
    if (type === 'weekly') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(now.setDate(diff)).toISOString().split('T')[0];
    } else {
      return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    }
  };

  // 筛选当前周期的目标
  const currentGoals = useMemo(() => {
    const periodStart = getPeriodStart(activeTab);
    return goals.filter(g => g.type === activeTab && g.startDate === periodStart);
  }, [goals, activeTab]);

  const addGoal = () => {
    if (!title.trim()) return;

    const newGoal: PeriodGoal = {
      id: Date.now().toString(),
      title: title.trim(),
      type: activeTab,
      target,
      current: 0,
      unit,
      startDate: getPeriodStart(activeTab),
      color,
    };

    setGoals(prev => [...prev, newGoal]);
    resetForm();
  };

  const updateProgress = (id: string, delta: number) => {
    setGoals(prev => prev.map(g => 
      g.id === id ? { ...g, current: Math.max(0, Math.min(g.target, g.current + delta)) } : g
    ));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const resetForm = () => {
    setTitle('');
    setTarget(5);
    setUnit('次');
    setColor(COLORS[0]);
    setIsAdding(false);
  };

  const getProgressPercent = (goal: PeriodGoal) => 
    Math.round((goal.current / goal.target) * 100);

  const completedCount = currentGoals.filter(g => g.current >= g.target).length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-500" />
          周期目标
        </h3>
        {currentGoals.length > 0 && (
          <span className="text-xs text-slate-500">
            {completedCount}/{currentGoals.length} 完成
          </span>
        )}
      </div>

      {/* 周期切换 */}
      <div className="flex gap-1 mb-4 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 py-1.5 text-sm rounded ${
            activeTab === 'weekly'
              ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow'
              : 'text-slate-500'
          }`}
        >
          本周目标
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`flex-1 py-1.5 text-sm rounded ${
            activeTab === 'monthly'
              ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow'
              : 'text-slate-500'
          }`}
        >
          本月目标
        </button>
      </div>

      {/* 目标列表 */}
      <div className="space-y-3 mb-3">
        {currentGoals.map(goal => {
          const percent = getProgressPercent(goal);
          const isComplete = goal.current >= goal.target;
          
          return (
            <div
              key={goal.id}
              className={`p-3 rounded-lg border ${
                isComplete
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: goal.color }}
                  />
                  <span className={`text-sm font-medium ${isComplete ? 'text-green-700 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {goal.title}
                  </span>
                  {isComplete && <Award className="w-4 h-4 text-green-500" />}
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="p-1 text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              
              {/* 进度条 */}
              <div className="mb-2">
                <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: `${percent}%`,
                      backgroundColor: isComplete ? '#10B981' : goal.color
                    }}
                  />
                </div>
              </div>
              
              {/* 进度控制 */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {goal.current}/{goal.target} {goal.unit}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => updateProgress(goal.id, -1)}
                    disabled={goal.current <= 0}
                    className="w-6 h-6 flex items-center justify-center bg-slate-200 dark:bg-slate-600 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-300 disabled:opacity-50"
                  >
                    -
                  </button>
                  <button
                    onClick={() => updateProgress(goal.id, 1)}
                    disabled={goal.current >= goal.target}
                    className="w-6 h-6 flex items-center justify-center bg-indigo-500 rounded text-white hover:bg-indigo-600 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {currentGoals.length === 0 && !isAdding && (
          <div className="text-center py-6 text-slate-400">
            <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">设定{activeTab === 'weekly' ? '本周' : '本月'}目标</p>
          </div>
        )}
      </div>

      {/* 添加目标 */}
      {isAdding ? (
        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="目标名称"
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700"
            autoFocus
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              min={1}
              max={100}
              className="w-20 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700"
            />
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="单位"
              className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700"
            />
          </div>
          <div className="flex gap-1">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                style={{ backgroundColor: c }}
              />
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
              onClick={addGoal}
              disabled={!title.trim()}
              className="flex-1 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 text-white rounded-lg"
            >
              添加
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600 flex items-center justify-center gap-1"
        >
          <Plus className="w-4 h-4" />
          添加目标
        </button>
      )}
    </div>
  );
}
