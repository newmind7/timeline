import { useState, useEffect, useMemo } from 'react';
import { Trophy, Star, Flame, Target, Calendar, CheckCircle, Zap, Award, Lock, X } from 'lucide-react';
import { Event } from '../types';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'milestone' | 'streak' | 'special';
  condition: (stats: UserStats) => boolean;
  progress?: (stats: UserStats) => number;
  maxProgress?: number;
}

interface UserStats {
  totalEvents: number;
  completedEvents: number;
  currentStreak: number;
  maxStreak: number;
  totalDaysActive: number;
  categoriesUsed: number;
  eventsThisWeek: number;
  eventsThisMonth: number;
}

interface AchievementSystemProps {
  events: Event[];
}

// 成就定义
const ACHIEVEMENTS: Achievement[] = [
  // 里程碑成就
  { id: 'first-event', name: '起步者', description: '创建第一个事件', icon: '🎯', category: 'milestone', condition: (s) => s.totalEvents >= 1 },
  { id: 'ten-events', name: '规划者', description: '创建10个事件', icon: '📋', category: 'milestone', condition: (s) => s.totalEvents >= 10, progress: (s) => s.totalEvents, maxProgress: 10 },
  { id: 'fifty-events', name: '时间管理师', description: '创建50个事件', icon: '⏰', category: 'milestone', condition: (s) => s.totalEvents >= 50, progress: (s) => s.totalEvents, maxProgress: 50 },
  { id: 'hundred-events', name: '时间大师', description: '创建100个事件', icon: '👑', category: 'milestone', condition: (s) => s.totalEvents >= 100, progress: (s) => s.totalEvents, maxProgress: 100 },
  
  // 完成成就
  { id: 'first-complete', name: '完成者', description: '完成第一个事件', icon: '✅', category: 'milestone', condition: (s) => s.completedEvents >= 1 },
  { id: 'ten-complete', name: '执行者', description: '完成10个事件', icon: '🏆', category: 'milestone', condition: (s) => s.completedEvents >= 10, progress: (s) => s.completedEvents, maxProgress: 10 },
  { id: 'fifty-complete', name: '高效达人', description: '完成50个事件', icon: '💪', category: 'milestone', condition: (s) => s.completedEvents >= 50, progress: (s) => s.completedEvents, maxProgress: 50 },
  
  // 连续成就
  { id: 'streak-3', name: '初露锋芒', description: '连续3天完成事件', icon: '🔥', category: 'streak', condition: (s) => s.maxStreak >= 3, progress: (s) => s.currentStreak, maxProgress: 3 },
  { id: 'streak-7', name: '周冠军', description: '连续7天完成事件', icon: '🌟', category: 'streak', condition: (s) => s.maxStreak >= 7, progress: (s) => s.currentStreak, maxProgress: 7 },
  { id: 'streak-30', name: '月度之星', description: '连续30天完成事件', icon: '💎', category: 'streak', condition: (s) => s.maxStreak >= 30, progress: (s) => s.currentStreak, maxProgress: 30 },
  
  // 特殊成就
  { id: 'multi-category', name: '多面手', description: '使用5种以上分类', icon: '🎨', category: 'special', condition: (s) => s.categoriesUsed >= 5, progress: (s) => s.categoriesUsed, maxProgress: 5 },
  { id: 'productive-week', name: '高产周', description: '一周完成10个事件', icon: '⚡', category: 'special', condition: (s) => s.eventsThisWeek >= 10, progress: (s) => s.eventsThisWeek, maxProgress: 10 },
  { id: 'active-month', name: '活跃月', description: '一个月完成30个事件', icon: '🚀', category: 'special', condition: (s) => s.eventsThisMonth >= 30, progress: (s) => s.eventsThisMonth, maxProgress: 30 },
];

export default function AchievementSystem({ events }: AchievementSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('unlockedAchievements');
    return saved ? JSON.parse(saved) : [];
  });

  // 计算用户统计
  const stats = useMemo((): UserStats => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const completedEvents = events.filter(e => e.progress === 100);
    const categories = new Set(events.map(e => e.category).filter(Boolean));
    
    // 计算连续天数
    const completedDates = [...new Set(completedEvents.map(e => e.date.split('T')[0]))].sort();
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    
    const today = now.toISOString().split('T')[0];
    for (let i = completedDates.length - 1; i >= 0; i--) {
      const date = completedDates[i];
      const prevDate = i > 0 ? completedDates[i - 1] : null;
      
      tempStreak++;
      if (prevDate) {
        const diff = (new Date(date).getTime() - new Date(prevDate).getTime()) / (1000 * 60 * 60 * 24);
        if (diff > 1) {
          maxStreak = Math.max(maxStreak, tempStreak);
          tempStreak = 0;
        }
      }
      
      if (date === today || (i === completedDates.length - 1 && tempStreak > 0)) {
        currentStreak = tempStreak;
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak);
    
    return {
      totalEvents: events.length,
      completedEvents: completedEvents.length,
      currentStreak,
      maxStreak,
      totalDaysActive: completedDates.length,
      categoriesUsed: categories.size,
      eventsThisWeek: completedEvents.filter(e => new Date(e.date) >= weekAgo).length,
      eventsThisMonth: completedEvents.filter(e => new Date(e.date) >= monthAgo).length,
    };
  }, [events]);

  // 检查新成就
  useEffect(() => {
    ACHIEVEMENTS.forEach(achievement => {
      if (!unlockedIds.includes(achievement.id) && achievement.condition(stats)) {
        setUnlockedIds(prev => {
          const newIds = [...prev, achievement.id];
          localStorage.setItem('unlockedAchievements', JSON.stringify(newIds));
          return newIds;
        });
        setNewAchievement(achievement);
        setTimeout(() => setNewAchievement(null), 5000);
      }
    });
  }, [stats, unlockedIds]);

  const unlockedCount = unlockedIds.length;
  const totalCount = ACHIEVEMENTS.length;
  const progressPercent = (unlockedCount / totalCount) * 100;

  return (
    <>
      {/* 成就按钮 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg p-2 -m-2 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-900 dark:text-white">成就系统</h3>
              <p className="text-xs text-slate-500">{unlockedCount}/{totalCount} 已解锁</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {Math.round(progressPercent)}%
            </span>
          </div>
        </button>
      </div>

      {/* 成就弹窗 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            {/* 头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-yellow-400 to-orange-500">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">成就系统</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 统计 */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalEvents}</div>
                  <div className="text-xs text-slate-500">总事件</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.completedEvents}</div>
                  <div className="text-xs text-slate-500">已完成</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-500">{stats.currentStreak}</div>
                  <div className="text-xs text-slate-500">当前连续</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{unlockedCount}</div>
                  <div className="text-xs text-slate-500">成就解锁</div>
                </div>
              </div>
            </div>

            {/* 成就列表 */}
            <div className="p-4 overflow-y-auto max-h-[400px] space-y-3">
              {['milestone', 'streak', 'special'].map(category => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">
                    {category === 'milestone' ? '🏆 里程碑' : category === 'streak' ? '🔥 连续' : '⭐ 特殊'}
                  </h3>
                  <div className="space-y-2">
                    {ACHIEVEMENTS.filter(a => a.category === category).map(achievement => {
                      const isUnlocked = unlockedIds.includes(achievement.id);
                      const progress = achievement.progress?.(stats) || 0;
                      const maxProgress = achievement.maxProgress || 1;
                      
                      return (
                        <div
                          key={achievement.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            isUnlocked
                              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800'
                              : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          <div className={`text-2xl ${!isUnlocked && 'grayscale opacity-50'}`}>
                            {achievement.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                {achievement.name}
                              </span>
                              {isUnlocked && <CheckCircle className="w-4 h-4 text-green-500" />}
                            </div>
                            <p className="text-xs text-slate-500 truncate">{achievement.description}</p>
                            {!isUnlocked && achievement.maxProgress && (
                              <div className="mt-1 flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-blue-500 transition-all"
                                    style={{ width: `${Math.min(100, (progress / maxProgress) * 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-400">{progress}/{maxProgress}</span>
                              </div>
                            )}
                          </div>
                          {!isUnlocked && <Lock className="w-4 h-4 text-slate-400" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 新成就通知 */}
      {newAchievement && (
        <div className="fixed top-20 right-6 z-50 animate-slide-in">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl shadow-2xl p-4 max-w-xs">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{newAchievement.icon}</div>
              <div>
                <p className="text-xs opacity-90">🎉 成就解锁！</p>
                <p className="font-bold">{newAchievement.name}</p>
                <p className="text-xs opacity-90">{newAchievement.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
