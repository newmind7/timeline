import { useState } from 'react';
import { Clock, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';

interface CountdownTooltipProps {
  days: number;
  progress: number;
  status: 'completed' | 'overdue' | 'today' | 'upcoming';
  children: React.ReactNode;
}

export default function CountdownTooltip({ days, progress, status, children }: CountdownTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const getCountdownText = () => {
    if (status === 'completed') {
      return { text: '🎉 已完成目标！', subtext: '继续保持！', icon: CheckCircle, color: 'text-blue-600' };
    }
    if (status === 'overdue') {
      const overdueDays = Math.abs(days);
      return { 
        text: `⚠️ 已逾期 ${overdueDays} 天`, 
        subtext: '需要立即处理！', 
        icon: AlertTriangle, 
        color: 'text-red-600' 
      };
    }
    if (status === 'today') {
      return { text: '⏰ 今天截止！', subtext: '抓紧时间完成！', icon: Clock, color: 'text-amber-600' };
    }
    // upcoming
    if (days <= 3) {
      return { 
        text: `⏳ 还剩 ${days} 天`, 
        subtext: '时间紧迫，加油！', 
        icon: Clock, 
        color: 'text-amber-600' 
      };
    }
    if (days <= 7) {
      return { 
        text: `📅 还剩 ${days} 天`, 
        subtext: '保持进度！', 
        icon: Calendar, 
        color: 'text-green-600' 
      };
    }
    return { 
      text: `📅 还剩 ${days} 天`, 
      subtext: '时间充裕，稳步推进', 
      icon: Calendar, 
      color: 'text-green-600' 
    };
  };

  const getProgressWarning = () => {
    if (status === 'completed') return null;
    
    // 计算预期进度
    const totalDays = days > 0 ? days : 1;
    const expectedProgress = status === 'overdue' ? 100 : Math.max(0, 100 - (days / 30) * 100);
    
    if (progress < expectedProgress - 20) {
      return { text: '⚠️ 进度落后，需要加速！', color: 'text-red-500' };
    }
    if (progress < expectedProgress - 10) {
      return { text: '💪 进度稍慢，继续努力！', color: 'text-amber-500' };
    }
    if (progress >= expectedProgress) {
      return { text: '✅ 进度良好，继续保持！', color: 'text-green-500' };
    }
    return null;
  };

  const countdown = getCountdownText();
  const progressWarning = getProgressWarning();
  const Icon = countdown.icon;

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div className="absolute z-50 left-0 right-0 top-full mt-2 animate-fadeIn">
          <div className="bg-slate-900 text-white rounded-lg shadow-xl p-4 mx-2">
            {/* 倒计时主信息 */}
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-5 h-5 ${countdown.color}`} />
              <span className={`font-bold text-lg ${countdown.color}`}>{countdown.text}</span>
            </div>
            <p className="text-slate-300 text-sm mb-2">{countdown.subtext}</p>
            
            {/* 进度警告 */}
            {progressWarning && (
              <div className={`text-sm font-medium ${progressWarning.color} border-t border-slate-700 pt-2 mt-2`}>
                {progressWarning.text}
              </div>
            )}
            
            {/* 进度条 */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>当前进度</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className={`h-full rounded-full transition-all ${
                    status === 'completed' ? 'bg-blue-500' :
                    status === 'overdue' ? 'bg-red-500' :
                    status === 'today' ? 'bg-amber-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* 小箭头 */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-slate-900" />
          </div>
        </div>
      )}
    </div>
  );
}
