import { useState, useEffect, useMemo } from 'react';
import { Database, Download, Check, AlertTriangle, Clock, Shield } from 'lucide-react';
import { Event } from '../types';

interface BackupStatusProps {
  events: Event[];
  onExport: () => void;
}

interface BackupInfo {
  lastBackup: string | null;
  eventCount: number;
  dataSize: number;
}

export default function BackupStatus({ events, onExport }: BackupStatusProps) {
  const [backupInfo, setBackupInfo] = useState<BackupInfo>(() => {
    const saved = localStorage.getItem('backupInfo');
    return saved ? JSON.parse(saved) : { lastBackup: null, eventCount: 0, dataSize: 0 };
  });

  // 计算数据大小
  const dataStats = useMemo(() => {
    const eventsData = JSON.stringify(events);
    const localStorageSize = Object.keys(localStorage).reduce((total, key) => {
      return total + localStorage.getItem(key)!.length;
    }, 0);

    return {
      eventsSize: eventsData.length,
      totalSize: localStorageSize,
      eventCount: events.length,
    };
  }, [events]);

  // 检查备份状态
  const backupStatus = useMemo(() => {
    if (!backupInfo.lastBackup) {
      return { status: 'never', message: '从未备份', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' };
    }

    const lastBackupDate = new Date(backupInfo.lastBackup);
    const now = new Date();
    const daysSinceBackup = Math.floor((now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceBackup >= 7) {
      return { status: 'warning', message: `${daysSinceBackup}天前备份`, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' };
    }

    if (events.length !== backupInfo.eventCount) {
      return { status: 'outdated', message: '数据已变更', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' };
    }

    return { status: 'ok', message: '备份最新', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' };
  }, [backupInfo, events]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '从未';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleBackup = () => {
    onExport();
    
    // 更新备份信息
    const newInfo: BackupInfo = {
      lastBackup: new Date().toISOString(),
      eventCount: events.length,
      dataSize: dataStats.eventsSize,
    };
    setBackupInfo(newInfo);
    localStorage.setItem('backupInfo', JSON.stringify(newInfo));
  };

  const getStatusIcon = () => {
    switch (backupStatus.status) {
      case 'ok': return <Check className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'outdated': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-500" />
          数据备份
        </h3>
        {getStatusIcon()}
      </div>

      {/* 状态卡片 */}
      <div className={`p-3 rounded-lg ${backupStatus.bg} mb-3`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${backupStatus.color}`}>
              {backupStatus.message}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              上次备份: {formatDate(backupInfo.lastBackup)}
            </p>
          </div>
          <Shield className={`w-8 h-8 ${backupStatus.color} opacity-50`} />
        </div>
      </div>

      {/* 数据统计 */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {dataStats.eventCount}
          </p>
          <p className="text-[10px] text-slate-500">事件数</p>
        </div>
        <div className="text-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {formatSize(dataStats.eventsSize)}
          </p>
          <p className="text-[10px] text-slate-500">事件数据</p>
        </div>
        <div className="text-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {formatSize(dataStats.totalSize)}
          </p>
          <p className="text-[10px] text-slate-500">本地存储</p>
        </div>
      </div>

      {/* 备份按钮 */}
      <button
        onClick={handleBackup}
        className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-lg flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4" />
        立即备份
      </button>

      {/* 提示 */}
      <p className="mt-2 text-[10px] text-slate-400 text-center">
        💡 建议每周至少备份一次数据
      </p>
    </div>
  );
}
