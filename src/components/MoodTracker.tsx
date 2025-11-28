import { useState, useEffect, useMemo } from 'react';
import { Smile, Frown, Meh, Heart, Cloud, Sun, Zap, Moon } from 'lucide-react';

interface MoodEntry {
  date: string;
  mood: string;
  note?: string;
}

const MOODS = [
  { id: 'amazing', emoji: '🤩', label: '超棒', color: 'from-yellow-400 to-orange-400' },
  { id: 'happy', emoji: '😊', label: '开心', color: 'from-green-400 to-emerald-400' },
  { id: 'good', emoji: '🙂', label: '不错', color: 'from-blue-400 to-cyan-400' },
  { id: 'neutral', emoji: '😐', label: '一般', color: 'from-slate-400 to-gray-400' },
  { id: 'tired', emoji: '😩', label: '疲惫', color: 'from-purple-400 to-violet-400' },
  { id: 'sad', emoji: '😢', label: '难过', color: 'from-blue-500 to-indigo-500' },
  { id: 'angry', emoji: '😠', label: '生气', color: 'from-red-400 to-rose-400' },
];

export default function MoodTracker() {
  const [entries, setEntries] = useState<MoodEntry[]>(() => {
    const saved = localStorage.getItem('moodEntries');
    return saved ? JSON.parse(saved) : [];
  });
  const [isRecording, setIsRecording] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find(e => e.date === today);

  useEffect(() => {
    localStorage.setItem('moodEntries', JSON.stringify(entries));
  }, [entries]);

  // 本周心情统计
  const weekStats = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekEntries = entries.filter(e => new Date(e.date) >= weekAgo);
    
    const moodCounts: Record<string, number> = {};
    weekEntries.forEach(e => {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    });

    return {
      total: weekEntries.length,
      counts: moodCounts,
      dominant: Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0],
    };
  }, [entries]);

  // 最近7天
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const entry = entries.find(e => e.date === dateStr);
      days.push({
        date: dateStr,
        day: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
        mood: entry?.mood,
        isToday: dateStr === today,
      });
    }
    return days;
  }, [entries, today]);

  const handleSaveMood = () => {
    if (!selectedMood) return;
    
    const newEntry: MoodEntry = {
      date: today,
      mood: selectedMood,
      note: note.trim() || undefined,
    };

    setEntries(prev => {
      const filtered = prev.filter(e => e.date !== today);
      return [...filtered, newEntry];
    });
    
    setIsRecording(false);
    setSelectedMood(null);
    setNote('');
  };

  const getMoodData = (moodId: string) => MOODS.find(m => m.id === moodId);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Heart className="w-4 h-4 text-pink-500" />
          心情追踪
        </h3>
        {todayEntry && (
          <span className="text-lg">{getMoodData(todayEntry.mood)?.emoji}</span>
        )}
      </div>

      {/* 今日记录 */}
      {!isRecording ? (
        <div className="mb-4">
          {todayEntry ? (
            <div className={`p-3 rounded-lg bg-gradient-to-r ${getMoodData(todayEntry.mood)?.color} text-white`}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getMoodData(todayEntry.mood)?.emoji}</span>
                <div>
                  <p className="font-medium">今天感觉{getMoodData(todayEntry.mood)?.label}</p>
                  {todayEntry.note && (
                    <p className="text-xs opacity-90 mt-1">{todayEntry.note}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedMood(todayEntry.mood);
                  setNote(todayEntry.note || '');
                  setIsRecording(true);
                }}
                className="mt-2 text-xs underline opacity-80 hover:opacity-100"
              >
                修改
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsRecording(true)}
              className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 hover:border-pink-400 hover:text-pink-600 transition-colors flex flex-col items-center gap-1"
            >
              <span className="text-2xl">😊</span>
              <span className="text-sm">记录今天的心情</span>
            </button>
          )}
        </div>
      ) : (
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">今天感觉如何？</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {MOODS.map(mood => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`p-2 rounded-lg transition-all ${
                  selectedMood === mood.id
                    ? `bg-gradient-to-r ${mood.color} text-white scale-110`
                    : 'bg-white dark:bg-slate-600 hover:scale-105'
                }`}
              >
                <span className="text-xl">{mood.emoji}</span>
              </button>
            ))}
          </div>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="简单记录一下（可选）"
            className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg dark:bg-slate-700 mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveMood}
              disabled={!selectedMood}
              className="flex-1 py-2 bg-pink-500 hover:bg-pink-600 disabled:bg-slate-300 text-white text-sm rounded-lg transition-colors"
            >
              保存
            </button>
            <button
              onClick={() => { setIsRecording(false); setSelectedMood(null); setNote(''); }}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm rounded-lg"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 本周心情 */}
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">本周心情</p>
        <div className="flex justify-between">
          {last7Days.map(day => (
            <div 
              key={day.date} 
              className={`text-center ${day.isToday ? 'ring-2 ring-pink-400 rounded-lg' : ''}`}
            >
              <div className="text-xs text-slate-400 mb-1">{day.day}</div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                day.mood 
                  ? `bg-gradient-to-r ${getMoodData(day.mood)?.color}` 
                  : 'bg-slate-100 dark:bg-slate-700'
              }`}>
                {day.mood ? (
                  <span className="text-sm">{getMoodData(day.mood)?.emoji}</span>
                ) : (
                  <span className="text-slate-400 text-xs">-</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 统计 */}
      {weekStats.total > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">本周记录</span>
            <span className="font-medium text-slate-900 dark:text-white">{weekStats.total} 天</span>
          </div>
          {weekStats.dominant && (
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-slate-500">主要心情</span>
              <span className="flex items-center gap-1">
                <span>{getMoodData(weekStats.dominant)?.emoji}</span>
                <span className="text-slate-900 dark:text-white">{getMoodData(weekStats.dominant)?.label}</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
