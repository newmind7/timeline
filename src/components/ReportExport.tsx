import { useState, useMemo } from 'react';
import { 
  FileText, Download, Image, Calendar, BarChart3, 
  PieChart, TrendingUp, Loader2, CheckCircle, X
} from 'lucide-react';
import { Event, EVENT_CATEGORIES } from '../types';
import { getEventStatus } from '../utils/dateUtils';

interface ReportExportProps {
  events: Event[];
  isOpen: boolean;
  onClose: () => void;
}

type ReportType = 'weekly' | 'monthly' | 'yearly' | 'custom';
type ExportFormat = 'markdown' | 'html' | 'text';

export default function ReportExport({ events, isOpen, onClose }: ReportExportProps) {
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('markdown');
  const [isExporting, setIsExporting] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // 计算报告数据
  const reportData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate = now;
    let periodLabel: string;

    switch (reportType) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        periodLabel = '本周';
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        periodLabel = `${now.getFullYear()}年${now.getMonth() + 1}月`;
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        periodLabel = `${now.getFullYear()}年`;
        break;
      case 'custom':
        startDate = customStart ? new Date(customStart) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = customEnd ? new Date(customEnd) : now;
        periodLabel = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        periodLabel = '最近30天';
    }

    const periodEvents = events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate >= startDate && eventDate <= endDate;
    });

    const completed = periodEvents.filter(e => e.progress === 100);
    const overdue = periodEvents.filter(e => getEventStatus(e.date) === 'overdue' && e.progress < 100);
    const inProgress = periodEvents.filter(e => e.progress > 0 && e.progress < 100);
    
    const completionRate = periodEvents.length > 0 
      ? Math.round((completed.length / periodEvents.length) * 100) 
      : 0;

    // 分类统计
    const categoryStats: Record<string, { total: number; completed: number }> = {};
    periodEvents.forEach(e => {
      const cat = e.category || 'other';
      if (!categoryStats[cat]) categoryStats[cat] = { total: 0, completed: 0 };
      categoryStats[cat].total++;
      if (e.progress === 100) categoryStats[cat].completed++;
    });

    // 每日统计
    const dailyStats: Record<string, number> = {};
    periodEvents.forEach(e => {
      const date = e.date.split('T')[0];
      dailyStats[date] = (dailyStats[date] || 0) + 1;
    });

    const avgPerDay = periodEvents.length / Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      periodLabel,
      startDate,
      endDate,
      total: periodEvents.length,
      completed: completed.length,
      overdue: overdue.length,
      inProgress: inProgress.length,
      completionRate,
      categoryStats,
      dailyStats,
      avgPerDay: avgPerDay.toFixed(1),
      events: periodEvents,
    };
  }, [events, reportType, customStart, customEnd]);

  const generateReport = () => {
    const { periodLabel, total, completed, overdue, inProgress, completionRate, categoryStats, avgPerDay } = reportData;
    
    const catStats = Object.entries(categoryStats)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([cat, stats]) => {
        const info = EVENT_CATEGORIES.find(c => c.value === cat) || { icon: '📌', label: '其他' };
        return { ...info, ...stats };
      });

    if (exportFormat === 'markdown') {
      return `# 📊 时间线统计报告

## 📅 报告周期
**${periodLabel}**

---

## 📈 核心指标

| 指标 | 数值 |
|------|------|
| 总事件数 | ${total} |
| 已完成 | ${completed} ✅ |
| 进行中 | ${inProgress} 🔄 |
| 已逾期 | ${overdue} ⚠️ |
| 完成率 | ${completionRate}% |
| 日均事件 | ${avgPerDay} |

---

## 📊 分类统计

${catStats.map(cat => `- ${cat.icon} **${cat.label}**: ${cat.total}个 (完成${cat.completed}个)`).join('\n')}

---

## 🏆 亮点

${completionRate >= 80 ? '- 🎉 完成率优秀！保持这个势头！' : ''}
${overdue === 0 ? '- ✨ 没有逾期事件，时间管理很棒！' : ''}
${parseFloat(avgPerDay) >= 2 ? '- 📈 日均事件数较高，效率不错！' : ''}

---

*报告生成时间: ${new Date().toLocaleString()}*
*由时间线应用自动生成*
`;
    }

    if (exportFormat === 'html') {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>时间线统计报告 - ${periodLabel}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
    h2 { color: #475569; margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; }
    .stat-card { display: inline-block; padding: 15px 25px; margin: 10px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border-radius: 10px; }
    .stat-number { font-size: 2em; font-weight: bold; }
    .stat-label { opacity: 0.9; }
    .category { padding: 8px 0; }
    .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>📊 时间线统计报告</h1>
  <p><strong>报告周期:</strong> ${periodLabel}</p>
  
  <h2>📈 核心指标</h2>
  <div>
    <div class="stat-card"><div class="stat-number">${total}</div><div class="stat-label">总事件</div></div>
    <div class="stat-card" style="background: linear-gradient(135deg, #10b981, #059669);"><div class="stat-number">${completed}</div><div class="stat-label">已完成</div></div>
    <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b, #d97706);"><div class="stat-number">${completionRate}%</div><div class="stat-label">完成率</div></div>
  </div>

  <h2>📊 分类统计</h2>
  <table>
    <tr><th>分类</th><th>总数</th><th>已完成</th></tr>
    ${catStats.map(cat => `<tr><td>${cat.icon} ${cat.label}</td><td>${cat.total}</td><td>${cat.completed}</td></tr>`).join('')}
  </table>

  <div class="footer">
    <p>报告生成时间: ${new Date().toLocaleString()}</p>
    <p>由时间线应用自动生成</p>
  </div>
</body>
</html>`;
    }

    // 纯文本格式
    return `时间线统计报告
================

报告周期: ${periodLabel}

核心指标:
- 总事件数: ${total}
- 已完成: ${completed}
- 进行中: ${inProgress}
- 已逾期: ${overdue}
- 完成率: ${completionRate}%
- 日均事件: ${avgPerDay}

分类统计:
${catStats.map(cat => `  ${cat.label}: ${cat.total}个 (完成${cat.completed}个)`).join('\n')}

报告生成时间: ${new Date().toLocaleString()}
`;
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const content = generateReport();
      const blob = new Blob([content], { 
        type: exportFormat === 'html' ? 'text/html' : 'text/plain' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `时间线报告_${reportData.periodLabel}.${exportFormat === 'html' ? 'html' : 'md'}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">导出统计报告</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 报告周期 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              报告周期
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'weekly', label: '本周', icon: Calendar },
                { id: 'monthly', label: '本月', icon: BarChart3 },
                { id: 'yearly', label: '今年', icon: TrendingUp },
                { id: 'custom', label: '自定义', icon: PieChart },
              ].map(option => (
                <button
                  key={option.id}
                  onClick={() => setReportType(option.id as ReportType)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
                    reportType === option.id
                      ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <option.icon className="w-5 h-5" />
                  <span className="text-xs">{option.label}</span>
                </button>
              ))}
            </div>

            {reportType === 'custom' && (
              <div className="flex gap-2 mt-3">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 text-sm"
                />
                <span className="self-center text-slate-500">至</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 text-sm"
                />
              </div>
            )}
          </div>

          {/* 预览统计 */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">预览: {reportData.periodLabel}</h3>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{reportData.total}</div>
                <div className="text-xs text-slate-500">总事件</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{reportData.completed}</div>
                <div className="text-xs text-slate-500">已完成</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{reportData.completionRate}%</div>
                <div className="text-xs text-slate-500">完成率</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">{reportData.overdue}</div>
                <div className="text-xs text-slate-500">逾期</div>
              </div>
            </div>
          </div>

          {/* 导出格式 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              导出格式
            </label>
            <div className="flex gap-2">
              {[
                { id: 'markdown', label: 'Markdown', ext: '.md' },
                { id: 'html', label: 'HTML', ext: '.html' },
                { id: 'text', label: '纯文本', ext: '.txt' },
              ].map(option => (
                <button
                  key={option.id}
                  onClick={() => setExportFormat(option.id as ExportFormat)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-colors ${
                    exportFormat === option.id
                      ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700'
                      : 'border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* 导出按钮 */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white rounded-lg font-medium flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                导出中...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                导出报告
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
