import { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

interface LifeProgressBarProps {
  birthDate?: string;
  expectedAge?: number;
}

export default function LifeProgressBar({ 
  birthDate: initialBirthDate, 
  expectedAge: initialExpectedAge 
}: LifeProgressBarProps) {
  const [birthDate, setBirthDate] = useState(initialBirthDate || '');
  const [expectedAge, setExpectedAge] = useState(initialExpectedAge || 80);
  const [isConfigOpen, setIsConfigOpen] = useState(!initialBirthDate);

  // 从localStorage读取配置
  useEffect(() => {
    const saved = localStorage.getItem('life_progress_config');
    if (saved) {
      const config = JSON.parse(saved);
      setBirthDate(config.birthDate || '');
      setExpectedAge(config.expectedAge || 80);
      setIsConfigOpen(!config.birthDate);
    }
  }, []);

  // 保存配置
  const saveConfig = () => {
    localStorage.setItem('life_progress_config', JSON.stringify({
      birthDate,
      expectedAge,
    }));
    setIsConfigOpen(false);
  };

  if (!birthDate) {
    return (
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-6 h-6 text-amber-400" />
          <h3 className="text-lg font-bold">生命进度条</h3>
        </div>
        <p className="text-slate-300 text-sm mb-4">设置你的出生日期，开启人生警示</p>
        <div className="space-y-3">
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
            placeholder="出生日期"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300">预期寿命：</span>
            <input
              type="number"
              value={expectedAge}
              onChange={(e) => setExpectedAge(Number(e.target.value))}
              className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-center"
              min={1}
              max={120}
            />
            <span className="text-sm text-slate-300">岁</span>
          </div>
          <button
            onClick={saveConfig}
            disabled={!birthDate}
            className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 rounded-lg transition-colors font-medium"
          >
            开始计时
          </button>
        </div>
      </div>
    );
  }

  // 计算生命进度
  const birth = new Date(birthDate);
  const now = new Date();
  const expectedEnd = new Date(birth);
  expectedEnd.setFullYear(birth.getFullYear() + expectedAge);

  const totalDays = (expectedEnd.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24);
  const livedDays = (now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24);
  const remainingDays = Math.max(0, totalDays - livedDays);
  
  const progressPercent = Math.min(100, (livedDays / totalDays) * 100);
  const age = Math.floor(livedDays / 365.25);
  const remainingYears = Math.floor(remainingDays / 365.25);
  const remainingMonths = Math.floor((remainingDays % 365.25) / 30);

  // 获取警示级别
  const getWarningLevel = () => {
    if (progressPercent >= 80) return { color: 'from-red-500 to-red-600', text: '时间紧迫！', icon: '⚠️' };
    if (progressPercent >= 60) return { color: 'from-orange-500 to-amber-500', text: '珍惜当下', icon: '⏰' };
    if (progressPercent >= 40) return { color: 'from-yellow-500 to-amber-400', text: '继续前进', icon: '💪' };
    return { color: 'from-green-500 to-emerald-500', text: '大好时光', icon: '🌟' };
  };

  const warning = getWarningLevel();

  // 今年进度
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
  const yearProgress = ((now.getTime() - yearStart.getTime()) / (yearEnd.getTime() - yearStart.getTime())) * 100;

  // 本月进度
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthProgress = ((now.getTime() - monthStart.getTime()) / (monthEnd.getTime() - monthStart.getTime())) * 100;

  // 今天进度
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const dayProgress = ((now.getTime() - dayStart.getTime()) / (dayEnd.getTime() - dayStart.getTime())) * 100;

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl p-6 shadow-lg">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-amber-400" />
          <h3 className="text-lg font-bold">生命进度条</h3>
          <span className="text-2xl">{warning.icon}</span>
        </div>
        <button
          onClick={() => setIsConfigOpen(!isConfigOpen)}
          className="text-xs text-slate-400 hover:text-white transition-colors"
        >
          设置
        </button>
      </div>

      {/* 配置面板 */}
      {isConfigOpen && (
        <div className="bg-slate-700/50 rounded-lg p-3 mb-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">出生日期：</span>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">预期寿命：</span>
            <input
              type="number"
              value={expectedAge}
              onChange={(e) => setExpectedAge(Number(e.target.value))}
              className="w-16 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm text-center"
            />
            <span className="text-xs text-slate-300">岁</span>
            <button
              onClick={saveConfig}
              className="ml-auto px-3 py-1 bg-amber-500 hover:bg-amber-600 rounded text-xs font-medium"
            >
              保存
            </button>
          </div>
        </div>
      )}

      {/* 主进度条 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-300">已度过 <span className="text-white font-bold">{age}</span> 岁</span>
          <span className="text-slate-300">
            剩余 <span className="text-amber-400 font-bold">{remainingYears}年{remainingMonths}月</span>
          </span>
        </div>
        <div className="relative h-6 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`absolute left-0 top-0 h-full bg-gradient-to-r ${warning.color} transition-all duration-1000`}
            style={{ width: `${progressPercent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold drop-shadow-lg">
              {progressPercent.toFixed(1)}% · {warning.text}
            </span>
          </div>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>出生</span>
          <span>{expectedAge}岁</span>
        </div>
      </div>

      {/* 时间粒度进度 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="flex items-center gap-1 mb-2">
            <Calendar className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-slate-400">今年</span>
          </div>
          <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${yearProgress}%` }}
            />
          </div>
          <span className="text-xs text-slate-300 mt-1 block">{yearProgress.toFixed(0)}%</span>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="flex items-center gap-1 mb-2">
            <Calendar className="w-3 h-3 text-green-400" />
            <span className="text-xs text-slate-400">本月</span>
          </div>
          <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all"
              style={{ width: `${monthProgress}%` }}
            />
          </div>
          <span className="text-xs text-slate-300 mt-1 block">{monthProgress.toFixed(0)}%</span>
        </div>

        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="flex items-center gap-1 mb-2">
            <Clock className="w-3 h-3 text-amber-400" />
            <span className="text-xs text-slate-400">今天</span>
          </div>
          <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 transition-all"
              style={{ width: `${dayProgress}%` }}
            />
          </div>
          <span className="text-xs text-slate-300 mt-1 block">{dayProgress.toFixed(0)}%</span>
        </div>
      </div>

      {/* 警示语 */}
      <div className="mt-4 text-center">
        <p className="text-sm text-slate-400 italic">
          "时间是最公平的，每个人每天都是24小时"
        </p>
      </div>
    </div>
  );
}
