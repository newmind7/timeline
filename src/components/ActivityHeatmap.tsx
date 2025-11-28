import { useMemo } from 'react';
import { Event } from '../types';

interface ActivityHeatmapProps {
  events: Event[];
}

export default function ActivityHeatmap({ events }: ActivityHeatmapProps) {
  const heatmapData = useMemo(() => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 365); // 过去一年

    // 统计每天的事件数量
    const dateMap: Record<string, { count: number; events: Event[] }> = {};
    
    events.forEach(event => {
      const dateKey = event.date.split('T')[0];
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { count: 0, events: [] };
      }
      dateMap[dateKey].count++;
      dateMap[dateKey].events.push(event);
    });

    // 生成365天的数据
    const days: { date: Date; dateStr: string; count: number; events: Event[] }[] = [];
    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date,
        dateStr,
        count: dateMap[dateStr]?.count || 0,
        events: dateMap[dateStr]?.events || [],
      });
    }

    // 按周分组
    const weeks: typeof days[] = [];
    let currentWeek: typeof days = [];
    
    // 填充第一周开始前的空白
    const firstDayOfWeek = days[0].date.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({ date: new Date(), dateStr: '', count: -1, events: [] });
    }

    days.forEach(day => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return { weeks, dateMap };
  }, [events]);

  // 获取颜色级别
  const getColorLevel = (count: number) => {
    if (count < 0) return 'bg-transparent';
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800';
    if (count === 1) return 'bg-green-200 dark:bg-green-900';
    if (count === 2) return 'bg-green-300 dark:bg-green-700';
    if (count <= 4) return 'bg-green-400 dark:bg-green-600';
    return 'bg-green-500 dark:bg-green-500';
  };

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  // 计算总事件数和活跃天数
  const stats = useMemo(() => {
    let totalEvents = 0;
    let activeDays = 0;
    let maxStreak = 0;
    let currentStreak = 0;

    heatmapData.weeks.flat().forEach(day => {
      if (day.count > 0) {
        totalEvents += day.count;
        activeDays++;
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else if (day.count === 0) {
        currentStreak = 0;
      }
    });

    return { totalEvents, activeDays, maxStreak };
  }, [heatmapData]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 dark:text-white">活动热力图</h3>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          过去一年
        </div>
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.totalEvents}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">总事件</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.activeDays}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">活跃天</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.maxStreak}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">最长连续</div>
        </div>
      </div>

      {/* 热力图 */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-full">
          {/* 月份标签 */}
          <div className="flex mb-1 ml-8">
            {months.map((month, i) => (
              <div key={i} className="text-xs text-slate-400 dark:text-slate-500" style={{ width: `${100/12}%`, minWidth: '30px' }}>
                {month}
              </div>
            ))}
          </div>

          {/* 热力图主体 */}
          <div className="flex">
            {/* 星期标签 */}
            <div className="flex flex-col gap-0.5 mr-1">
              {weekdays.map((day, i) => (
                <div key={i} className="text-xs text-slate-400 dark:text-slate-500 h-3 flex items-center justify-end pr-1" style={{ fontSize: '10px' }}>
                  {i % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>

            {/* 格子 */}
            <div className="flex gap-0.5">
              {heatmapData.weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-0.5">
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 rounded-sm ${getColorLevel(day.count)} transition-colors cursor-pointer hover:ring-1 hover:ring-slate-400`}
                      title={day.count >= 0 ? `${day.dateStr}: ${day.count} 个事件` : ''}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 图例 */}
      <div className="flex items-center justify-end gap-1 mt-3 text-xs text-slate-500 dark:text-slate-400">
        <span>少</span>
        <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800" />
        <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
        <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-700" />
        <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-600" />
        <div className="w-3 h-3 rounded-sm bg-green-500" />
        <span>多</span>
      </div>
    </div>
  );
}
