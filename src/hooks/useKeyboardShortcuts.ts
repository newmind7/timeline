import { useEffect, useRef } from 'react';

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
  // 使用 ref 存储 handlers，避免依赖变化导致重新绑定事件
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const h = handlersRef.current;
      
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
        h.onNewEvent?.();
        return;
      }

      // Ctrl + F: 打开筛选
      if (ctrl && key === 'f') {
        e.preventDefault();
        h.onOpenFilter?.();
        return;
      }

      // Ctrl + E: 打开导出
      if (ctrl && key === 'e') {
        e.preventDefault();
        h.onOpenExport?.();
        return;
      }

      // Ctrl + D: 切换主题
      if (ctrl && key === 'd') {
        e.preventDefault();
        h.onToggleTheme?.();
        return;
      }

      // +/-: 缩放时间轴
      if (key === '+' || key === '=') {
        h.onZoomIn?.();
        return;
      }

      if (key === '-') {
        h.onZoomOut?.();
        return;
      }

      // R: 打开复盘
      if (key === 'r' && !ctrl) {
        h.onOpenReview?.();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // 空依赖，只绑定一次
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
