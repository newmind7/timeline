import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onNewEvent?: () => void;
  onOpenFilter?: () => void;
  onOpenReview?: () => void;
  onOpenExport?: () => void;
  onToggleTheme?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // 如果在输入框中，不触发快捷键
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLSelectElement
    ) {
      return;
    }

    const key = e.key.toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;

    // Ctrl + N: 新建事件
    if (ctrl && key === 'n') {
      e.preventDefault();
      handlers.onNewEvent?.();
      return;
    }

    // Ctrl + F: 打开筛选
    if (ctrl && key === 'f') {
      e.preventDefault();
      handlers.onOpenFilter?.();
      return;
    }

    // Ctrl + R: 打开复盘（避免刷新页面）
    if (ctrl && key === 'r' && !e.shiftKey) {
      // 不阻止默认行为，保留刷新功能
      // 改用其他快捷键
    }

    // Ctrl + E: 打开导出
    if (ctrl && key === 'e') {
      e.preventDefault();
      handlers.onOpenExport?.();
      return;
    }

    // Ctrl + D: 切换主题
    if (ctrl && key === 'd') {
      e.preventDefault();
      handlers.onToggleTheme?.();
      return;
    }

    // +/-: 缩放时间轴
    if (key === '+' || key === '=') {
      handlers.onZoomIn?.();
      return;
    }

    if (key === '-') {
      handlers.onZoomOut?.();
      return;
    }

    // R: 打开复盘
    if (key === 'r' && !ctrl) {
      handlers.onOpenReview?.();
      return;
    }
  }, [handlers]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// 快捷键帮助信息
export const SHORTCUTS_INFO = [
  { keys: 'Ctrl + P', action: '命令面板' },
  { keys: 'Ctrl + K', action: '全局搜索' },
  { keys: 'Ctrl + N', action: '新建事件' },
  { keys: 'Ctrl + F', action: '打开筛选' },
  { keys: 'Ctrl + E', action: '导出数据' },
  { keys: 'Ctrl + D', action: '切换主题' },
  { keys: 'R', action: '打开复盘' },
];
