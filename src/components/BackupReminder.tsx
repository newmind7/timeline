import { useState, useEffect } from 'react';
import { Database, Download, X, Clock } from 'lucide-react';
import { Event } from '../types';

interface BackupReminderProps {
  events: Event[];
  onExport: () => void;
}

export default function BackupReminder({ events, onExport }: BackupReminderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(() => {
    return localStorage.getItem('lastBackupDate');
  });

  // 检查是否需要提醒备份
  useEffect(() => {
    const checkBackupReminder = () => {
      const lastBackupDate = localStorage.getItem('lastBackupDate');
      const reminderDismissed = localStorage.getItem('backupReminderDismissed');
      
      // 如果今天已经关闭过提醒，不再显示
      if (reminderDismissed === new Date().toDateString()) {
        return;
      }

      // 如果有事件且超过7天未备份
      if (events.length > 0) {
        if (!lastBackupDate) {
          // 从未备份过
          setIsVisible(true);
        } else {
          const daysSinceBackup = Math.floor(
            (Date.now() - new Date(lastBackupDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSinceBackup >= 7) {
            setIsVisible(true);
          }
        }
      }
    };

    // 延迟检查，避免页面加载时立即弹出
    const timer = setTimeout(checkBackupReminder, 5000);
    return () => clearTimeout(timer);
  }, [events.length]);

  // 执行备份
  const handleBackup = () => {
    const now = new Date().toISOString();
    localStorage.setItem('lastBackupDate', now);
    setLastBackup(now);
    onExport();
    setIsVisible(false);
  };

  // 稍后提醒
  const handleDismiss = () => {
    localStorage.setItem('backupReminderDismissed', new Date().toDateString());
    setIsVisible(false);
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // 计算上次备份天数
  const getDaysSinceBackup = () => {
    if (!lastBackup) return null;
    return Math.floor(
      (Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  if (!isVisible) return null;

  const daysSinceBackup = getDaysSinceBackup();

  return (
    <div className="fixed bottom-24 right-6 z-40 max-w-sm animate-slide-up">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Database className="w-4 h-4" />
            <span className="font-medium text-sm">数据备份提醒</span>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            {lastBackup ? (
              <>
                上次备份于 <span className="font-medium text-slate-900 dark:text-white">{formatDate(lastBackup)}</span>
                {daysSinceBackup !== null && daysSinceBackup > 0 && (
                  <span className="text-amber-600 dark:text-amber-400">（{daysSinceBackup}天前）</span>
                )}
              </>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">你还没有备份过数据</span>
            )}
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
            <Clock className="w-3 h-3" />
            <span>建议每周备份一次，保护你的重要数据</span>
          </div>

          {/* 统计 */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg mb-4 text-sm">
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{events.length}</div>
              <div className="text-xs text-slate-500">事件总数</div>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-600" />
            <div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {events.filter(e => e.progress === 100).length}
              </div>
              <div className="text-xs text-slate-500">已完成</div>
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex gap-2">
            <button
              onClick={handleBackup}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              立即备份
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              稍后
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
