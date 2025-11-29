import { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, AlertTriangle, Calendar, CheckCircle, Info } from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  eventId?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onEventClick?: (eventId: string) => void;
}

export default function NotificationCenter({ isOpen, onClose, onEventClick }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'reminder': return <Calendar className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed top-16 right-4 z-50 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-slideInRight">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white">通知中心</h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* 操作栏 */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-700/50 text-xs">
            <button
              onClick={markAllAsRead}
              className="text-blue-500 hover:text-blue-600"
            >
              全部已读
            </button>
            <button
              onClick={clearAll}
              className="text-slate-500 hover:text-red-500"
            >
              清空全部
            </button>
          </div>
        )}

        {/* 通知列表 */}
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">暂无通知</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 transition-colors ${
                    notification.read 
                      ? 'bg-white dark:bg-slate-800' 
                      : 'bg-blue-50 dark:bg-blue-900/10'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-medium ${
                          notification.read 
                            ? 'text-slate-600 dark:text-slate-400' 
                            : 'text-slate-900 dark:text-white'
                        }`}>
                          {notification.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {notification.eventId && (
                          <button
                            onClick={() => {
                              markAsRead(notification.id);
                              onEventClick?.(notification.eventId!);
                              onClose();
                            }}
                            className="text-xs text-blue-500 hover:text-blue-600"
                          >
                            查看事件
                          </button>
                        )}
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-slate-400 hover:text-slate-600"
                          >
                            标记已读
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs text-slate-400 hover:text-red-500 ml-auto"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// 导出添加通知的工具函数
export function addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
  const saved = localStorage.getItem('notifications');
  const notifications: Notification[] = saved ? JSON.parse(saved) : [];
  
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    read: false,
  };

  notifications.unshift(newNotification);
  
  // 最多保留50条
  if (notifications.length > 50) {
    notifications.pop();
  }

  localStorage.setItem('notifications', JSON.stringify(notifications));
  
  // 触发自定义事件，通知组件更新
  window.dispatchEvent(new CustomEvent('notificationAdded', { detail: newNotification }));
  
  return newNotification;
}
