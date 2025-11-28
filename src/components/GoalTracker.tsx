import { useState, useEffect } from 'react';
import { Plus, Target, ChevronDown, ChevronRight, Check, Trash2, Edit2 } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  deadline: string;
  milestones: Milestone[];
  createdAt: string;
}

const GOAL_ICONS = ['🎯', '💼', '📚', '💰', '🏠', '✈️', '💪', '🎨', '🎓', '❤️'];

export default function GoalTracker() {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('goals');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    icon: '🎯',
    deadline: '',
  });
  const [newMilestone, setNewMilestone] = useState('');
  const [addingMilestoneFor, setAddingMilestoneFor] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) return;
    
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title.trim(),
      description: newGoal.description.trim(),
      icon: newGoal.icon,
      color: 'blue',
      deadline: newGoal.deadline,
      milestones: [],
      createdAt: new Date().toISOString(),
    };
    
    setGoals([...goals, goal]);
    setNewGoal({ title: '', description: '', icon: '🎯', deadline: '' });
    setIsAdding(false);
    setExpandedGoal(goal.id);
  };

  const handleAddMilestone = (goalId: string) => {
    if (!newMilestone.trim()) return;
    
    setGoals(goals.map(g => {
      if (g.id !== goalId) return g;
      return {
        ...g,
        milestones: [...g.milestones, {
          id: Date.now().toString(),
          title: newMilestone.trim(),
          completed: false,
        }],
      };
    }));
    
    setNewMilestone('');
    setAddingMilestoneFor(null);
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(goals.map(g => {
      if (g.id !== goalId) return g;
      return {
        ...g,
        milestones: g.milestones.map(m => 
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        ),
      };
    }));
  };

  const deleteGoal = (goalId: string) => {
    if (confirm('确定删除这个目标吗？')) {
      setGoals(goals.filter(g => g.id !== goalId));
    }
  };

  const deleteMilestone = (goalId: string, milestoneId: string) => {
    setGoals(goals.map(g => {
      if (g.id !== goalId) return g;
      return {
        ...g,
        milestones: g.milestones.filter(m => m.id !== milestoneId),
      };
    }));
  };

  const getProgress = (goal: Goal) => {
    if (goal.milestones.length === 0) return 0;
    const completed = goal.milestones.filter(m => m.completed).length;
    return Math.round((completed / goal.milestones.length) * 100);
  };

  const getDaysLeft = (deadline: string) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-600" />
          目标追踪
        </h3>
        <button
          onClick={() => setIsAdding(true)}
          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 添加目标表单 */}
      {isAdding && (
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-2">
          <input
            type="text"
            placeholder="目标名称"
            value={newGoal.title}
            onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700"
            autoFocus
          />
          <textarea
            placeholder="目标描述（可选）"
            value={newGoal.description}
            onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 resize-none"
            rows={2}
          />
          <div className="flex gap-2 items-center">
            <div className="flex gap-1">
              {GOAL_ICONS.slice(0, 5).map(icon => (
                <button
                  key={icon}
                  onClick={() => setNewGoal({...newGoal, icon})}
                  className={`w-8 h-8 rounded ${newGoal.icon === icon ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                >
                  {icon}
                </button>
              ))}
            </div>
            <input
              type="date"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
              className="flex-1 px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddGoal} className="flex-1 py-1.5 text-sm bg-blue-600 text-white rounded-lg">创建目标</button>
            <button onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-sm bg-slate-200 dark:bg-slate-600 rounded-lg">取消</button>
          </div>
        </div>
      )}

      {/* 目标列表 */}
      <div className="space-y-3">
        {goals.map(goal => {
          const progress = getProgress(goal);
          const daysLeft = getDaysLeft(goal.deadline);
          const isExpanded = expandedGoal === goal.id;
          
          return (
            <div
              key={goal.id}
              className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
            >
              {/* 目标头部 */}
              <div
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
                onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-xl">{goal.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 dark:text-white truncate">{goal.title}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{goal.milestones.filter(m => m.completed).length}/{goal.milestones.length} 里程碑</span>
                    {daysLeft !== null && (
                      <span className={daysLeft < 0 ? 'text-red-500' : daysLeft < 7 ? 'text-orange-500' : ''}>
                        {daysLeft < 0 ? `已过期${-daysLeft}天` : `剩余${daysLeft}天`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{progress}%</div>
                  <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full">
                    <div className={`h-full rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>

              {/* 展开内容 */}
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-slate-200 dark:border-slate-700">
                  {goal.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 mb-3">{goal.description}</p>
                  )}
                  
                  {/* 里程碑列表 */}
                  <div className="space-y-1 mb-2">
                    {goal.milestones.map(milestone => (
                      <div key={milestone.id} className="flex items-center gap-2 group">
                        <button
                          onClick={() => toggleMilestone(goal.id, milestone.id)}
                          className={`w-5 h-5 rounded flex items-center justify-center ${
                            milestone.completed 
                              ? 'bg-green-500 text-white' 
                              : 'border border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {milestone.completed && <Check className="w-3 h-3" />}
                        </button>
                        <span className={`flex-1 text-sm ${milestone.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {milestone.title}
                        </span>
                        <button
                          onClick={() => deleteMilestone(goal.id, milestone.id)}
                          className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* 添加里程碑 */}
                  {addingMilestoneFor === goal.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="里程碑名称"
                        value={newMilestone}
                        onChange={(e) => setNewMilestone(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddMilestone(goal.id)}
                        className="flex-1 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700"
                        autoFocus
                      />
                      <button onClick={() => handleAddMilestone(goal.id)} className="px-2 py-1 text-sm bg-blue-600 text-white rounded">添加</button>
                      <button onClick={() => setAddingMilestoneFor(null)} className="px-2 py-1 text-sm bg-slate-200 dark:bg-slate-600 rounded">取消</button>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <button
                        onClick={() => setAddingMilestoneFor(goal.id)}
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> 添加里程碑
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        删除目标
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {goals.length === 0 && !isAdding && (
        <div className="text-center py-6 text-slate-400">
          <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">还没有目标</p>
          <button onClick={() => setIsAdding(true)} className="text-blue-500 text-sm mt-1">创建第一个目标</button>
        </div>
      )}
    </div>
  );
}
