import { useState, useRef } from 'react';
import { Share2, Download, Copy, Check, X, Calendar, Target, Clock } from 'lucide-react';
import { Event, EVENT_CATEGORIES } from '../types';

interface EventShareCardProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

const THEMES = [
  { id: 'light', name: '浅色', bg: 'bg-white', text: 'text-slate-900' },
  { id: 'dark', name: '深色', bg: 'bg-slate-900', text: 'text-white' },
  { id: 'gradient', name: '渐变', bg: 'bg-gradient-to-br from-blue-500 to-purple-600', text: 'text-white' },
  { id: 'warm', name: '暖色', bg: 'bg-gradient-to-br from-orange-400 to-pink-500', text: 'text-white' },
];

export default function EventShareCard({ event, isOpen, onClose }: EventShareCardProps) {
  const [theme, setTheme] = useState(THEMES[2]);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const category = EVENT_CATEGORIES.find(c => c.value === event.category);
  const eventDate = new Date(event.date);
  const isOverdue = eventDate < new Date() && event.progress < 100;
  const isComplete = event.progress === 100;

  const getStatusText = () => {
    if (isComplete) return '✅ 已完成';
    if (isOverdue) return '⚠️ 已逾期';
    const days = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days === 0) return '📍 今天';
    if (days === 1) return '📅 明天';
    return `⏳ ${days}天后`;
  };

  const copyToClipboard = () => {
    const text = `
📌 ${event.title}
${event.description ? `📝 ${event.description}` : ''}
📅 ${eventDate.toLocaleDateString('zh-CN')}
📊 进度: ${event.progress}%
${category ? `📁 分类: ${category.icon} ${category.label}` : ''}
${getStatusText()}

— 来自我的时间线
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsImage = async () => {
    if (!cardRef.current) return;

    try {
      // 使用html2canvas（如果可用）或简单的截图方法
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `${event.title}-share.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      // 如果html2canvas不可用，复制文本代替
      copyToClipboard();
      alert('图片导出需要html2canvas库，已复制文本到剪贴板');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-500" />
            分享事件
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* 主题选择 */}
        <div className="flex gap-2 mb-4">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t)}
              className={`flex-1 py-1.5 text-xs rounded ${t.bg} ${t.text} ${
                theme.id === t.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* 分享卡片预览 */}
        <div
          ref={cardRef}
          className={`p-6 rounded-xl ${theme.bg} ${theme.text} mb-4`}
        >
          {/* Logo/品牌 */}
          <div className="flex items-center gap-2 mb-4 opacity-60">
            <Clock className="w-4 h-4" />
            <span className="text-xs">我的时间线</span>
          </div>

          {/* 事件标题 */}
          <h4 className="text-xl font-bold mb-2">{event.title}</h4>
          
          {/* 描述 */}
          {event.description && (
            <p className="text-sm opacity-80 mb-4">{event.description}</p>
          )}

          {/* 信息行 */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 opacity-60" />
              <span>{eventDate.toLocaleDateString('zh-CN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}</span>
            </div>
            {category && (
              <div className="flex items-center gap-2 text-sm">
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </div>
            )}
          </div>

          {/* 进度条 */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span>进度</span>
              <span>{event.progress}%</span>
            </div>
            <div className="h-2 bg-black/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  isComplete ? 'bg-green-400' : 'bg-white/80'
                }`}
                style={{ width: `${event.progress}%` }}
              />
            </div>
          </div>

          {/* 状态标签 */}
          <div className={`inline-block px-3 py-1 rounded-full text-sm ${
            isComplete ? 'bg-green-400/20' : isOverdue ? 'bg-red-400/20' : 'bg-white/20'
          }`}>
            {getStatusText()}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={copyToClipboard}
            className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? '已复制' : '复制文本'}
          </button>
          <button
            onClick={downloadAsImage}
            className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            下载图片
          </button>
        </div>
      </div>
    </div>
  );
}
