import { useState, useEffect } from 'react';
import { Trophy, X, PartyPopper, Star } from 'lucide-react';
import { Event } from '../types';

interface MilestoneAlertProps {
  events: Event[];
}

interface Milestone {
  type: 'first' | 'count' | 'streak' | 'complete';
  title: string;
  description: string;
  icon: string;
}

export default function MilestoneAlert({ events }: MilestoneAlertProps) {
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [celebratedMilestones, setCelebratedMilestones] = useState<string[]>(() => {
    const saved = localStorage.getItem('celebratedMilestones');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('celebratedMilestones', JSON.stringify(celebratedMilestones));
  }, [celebratedMilestones]);

  // 检测里程碑
  useEffect(() => {
    const completedEvents = events.filter(e => e.progress === 100);
    const totalCount = completedEvents.length;

    // 里程碑检测
    const milestones: { key: string; milestone: Milestone }[] = [];

    // 第一个完成的事件
    if (totalCount === 1) {
      milestones.push({
        key: 'first-complete',
        milestone: {
          type: 'first',
          title: '首次完成！',
          description: '恭喜你完成了第一个事件，继续保持！',
          icon: '🎉',
        },
      });
    }

    // 完成数量里程碑
    const countMilestones = [10, 25, 50, 100, 200, 500, 1000];
    countMilestones.forEach(count => {
      if (totalCount === count) {
        milestones.push({
          key: `complete-${count}`,
          milestone: {
            type: 'count',
            title: `${count}个事件达成！`,
            description: `你已经完成了${count}个事件，太棒了！`,
            icon: count >= 100 ? '🏆' : '⭐',
          },
        });
      }
    });

    // 今日完成多个事件
    const today = new Date().toISOString().split('T')[0];
    const todayCompleted = completedEvents.filter(e => 
      e.date.startsWith(today)
    ).length;
    
    if (todayCompleted === 5) {
      milestones.push({
        key: `today-5-${today}`,
        milestone: {
          type: 'streak',
          title: '高效一天！',
          description: '今天完成了5个事件，效率爆棚！',
          icon: '🔥',
        },
      });
    }

    // 全部事件完成
    if (events.length > 0 && events.every(e => e.progress === 100)) {
      milestones.push({
        key: `all-complete-${events.length}`,
        milestone: {
          type: 'complete',
          title: '全部完成！',
          description: '所有事件都已完成，你是最棒的！',
          icon: '👑',
        },
      });
    }

    // 找到未庆祝的里程碑
    const uncelebrated = milestones.find(m => !celebratedMilestones.includes(m.key));
    if (uncelebrated) {
      setMilestone(uncelebrated.milestone);
      setIsVisible(true);
      setCelebratedMilestones([...celebratedMilestones, uncelebrated.key]);
    }
  }, [events]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setMilestone(null), 300);
  };

  if (!milestone) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* 背景 */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      
      {/* 彩带动画 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-8 animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-32px',
              backgroundColor: ['#f43f5e', '#eab308', '#22c55e', '#3b82f6', '#a855f7'][i % 5],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      
      {/* 弹窗 */}
      <div 
        className={`relative bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl transform transition-transform duration-300 ${
          isVisible ? 'scale-100' : 'scale-90'
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          {/* 图标 */}
          <div className="text-6xl mb-4 animate-bounce">
            {milestone.icon}
          </div>

          {/* 标题 */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {milestone.title}
          </h2>

          {/* 描述 */}
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {milestone.description}
          </p>

          {/* 装饰 */}
          <div className="flex justify-center gap-2 mb-6">
            <Star className="w-5 h-5 text-yellow-400 fill-current animate-pulse" />
            <Trophy className="w-5 h-5 text-yellow-500" />
            <Star className="w-5 h-5 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium rounded-full hover:shadow-lg transition-shadow"
          >
            太棒了！
          </button>
        </div>
      </div>

      {/* CSS动画 */}
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
