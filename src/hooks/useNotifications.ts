import { useEffect, useCallback, useState } from 'react';
import { Event } from '../types';

export function useNotifications(events: Event[]) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());

  // 请求通知权限
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('浏览器不支持通知');
      return false;
    }

    if (Notification.permission === 'granted') {
      setPermission('granted');
      return true;
    }

    if (Notification.permission !== 'denied') {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }

    setPermission('denied');
    return false;
  }, []);

  // 发送通知
  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission !== 'granted') return;

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // 5秒后自动关闭
    setTimeout(() => notification.close(), 5000);
  }, [permission]);

  // 检查并发送事件提醒
  useEffect(() => {
    if (permission !== 'granted') return;

    const checkReminders = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      events.forEach(event => {
        // 跳过已通知的事件
        if (notifiedIds.has(event.id)) return;
        
        // 跳过已完成的事件
        if (event.progress >= 100) return;

        const eventDate = event.date.split('T')[0];

        // 今天的事件
        if (eventDate === today) {
          sendNotification(`📅 今日事件：${event.title}`, {
            body: event.description || '今天需要完成此事件',
            tag: `today-${event.id}`,
          });
          setNotifiedIds(prev => new Set([...prev, event.id]));
        }
        // 明天的事件
        else if (eventDate === tomorrowStr) {
          sendNotification(`⏰ 明日提醒：${event.title}`, {
            body: event.description || '明天有一个事件',
            tag: `tomorrow-${event.id}`,
          });
          setNotifiedIds(prev => new Set([...prev, event.id]));
        }
      });
    };

    // 初次检查
    checkReminders();

    // 每小时检查一次
    const interval = setInterval(checkReminders, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [events, permission, notifiedIds, sendNotification]);

  // 初始化时检查权限
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  return {
    permission,
    requestPermission,
    sendNotification,
    isSupported: 'Notification' in window,
  };
}
