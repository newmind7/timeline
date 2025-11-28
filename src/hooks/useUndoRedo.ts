import { useState, useCallback, useEffect } from 'react';

interface HistoryAction {
  id: string;
  type: 'add' | 'update' | 'delete' | 'batch';
  timestamp: number;
  description: string;
  data: any;
  previousData?: any;
}

interface UndoRedoState {
  past: HistoryAction[];
  future: HistoryAction[];
}

const MAX_HISTORY = 50;

export function useUndoRedo() {
  const [state, setState] = useState<UndoRedoState>(() => {
    const saved = sessionStorage.getItem('undoRedoState');
    return saved ? JSON.parse(saved) : { past: [], future: [] };
  });

  // 保存到session storage
  useEffect(() => {
    sessionStorage.setItem('undoRedoState', JSON.stringify(state));
  }, [state]);

  // 记录操作
  const recordAction = useCallback((action: Omit<HistoryAction, 'id' | 'timestamp'>) => {
    const newAction: HistoryAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    setState(prev => ({
      past: [...prev.past.slice(-MAX_HISTORY + 1), newAction],
      future: [], // 清空重做栈
    }));

    return newAction.id;
  }, []);

  // 撤销
  const undo = useCallback(() => {
    setState(prev => {
      if (prev.past.length === 0) return prev;

      const lastAction = prev.past[prev.past.length - 1];
      return {
        past: prev.past.slice(0, -1),
        future: [lastAction, ...prev.future],
      };
    });

    return state.past[state.past.length - 1];
  }, [state.past]);

  // 重做
  const redo = useCallback(() => {
    setState(prev => {
      if (prev.future.length === 0) return prev;

      const nextAction = prev.future[0];
      return {
        past: [...prev.past, nextAction],
        future: prev.future.slice(1),
      };
    });

    return state.future[0];
  }, [state.future]);

  // 清空历史
  const clearHistory = useCallback(() => {
    setState({ past: [], future: [] });
    sessionStorage.removeItem('undoRedoState');
  }, []);

  // 获取最近操作
  const getRecentActions = useCallback((count: number = 5) => {
    return state.past.slice(-count).reverse();
  }, [state.past]);

  return {
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    undoCount: state.past.length,
    redoCount: state.future.length,
    recordAction,
    undo,
    redo,
    clearHistory,
    getRecentActions,
    lastAction: state.past[state.past.length - 1],
  };
}
