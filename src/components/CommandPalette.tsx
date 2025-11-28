import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Plus, Filter, FileText, Download, Upload, Sun, Moon, X
} from 'lucide-react';
import { LayoutType, VIEW_TYPES } from '../types';

interface Command {
  id: string;
  name: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category: string;
}

interface CommandPaletteProps {
  onNewEvent: () => void;
  onOpenFilter: () => void;
  onOpenReview: () => void;
  onOpenExport: () => void;
  onOpenImport: () => void;
  onToggleTheme: () => void;
  onChangeView: (view: LayoutType) => void;
  currentTheme: string;
}

export default function CommandPalette({
  onNewEvent,
  onOpenFilter,
  onOpenReview,
  onOpenExport,
  onOpenImport,
  onToggleTheme,
  onChangeView,
  currentTheme,
}: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = useMemo(() => [
    // 操作
    { id: 'new', name: '新建事件', icon: <Plus className="w-4 h-4" />, shortcut: 'Ctrl+N', action: onNewEvent, category: '操作' },
    { id: 'filter', name: '打开筛选', icon: <Filter className="w-4 h-4" />, shortcut: 'Ctrl+F', action: onOpenFilter, category: '操作' },
    { id: 'review', name: '每日复盘', icon: <FileText className="w-4 h-4" />, shortcut: 'R', action: onOpenReview, category: '操作' },
    { id: 'export', name: '导出数据', icon: <Download className="w-4 h-4" />, shortcut: 'Ctrl+E', action: onOpenExport, category: '操作' },
    { id: 'import', name: '导入数据', icon: <Upload className="w-4 h-4" />, action: onOpenImport, category: '操作' },
    { id: 'theme', name: currentTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式', icon: currentTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />, shortcut: 'Ctrl+D', action: onToggleTheme, category: '设置' },
    // 视图
    ...VIEW_TYPES.map(view => ({
      id: `view-${view.value}`,
      name: `切换到${view.label}视图`,
      icon: <span className="text-sm">{view.icon}</span>,
      action: () => onChangeView(view.value),
      category: '视图',
    })),
  ], [onNewEvent, onOpenFilter, onOpenReview, onOpenExport, onOpenImport, onToggleTheme, onChangeView, currentTheme]);

  // 搜索过滤
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const lowerQuery = query.toLowerCase();
    return commands.filter(cmd => 
      cmd.name.toLowerCase().includes(lowerQuery) ||
      cmd.category.toLowerCase().includes(lowerQuery)
    );
  }, [commands, query]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+P 或 Ctrl+Shift+P 打开命令面板
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      if (!isOpen) return;

      // Escape 关闭
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
      
      // 上下键导航
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      }
      
      // Enter 执行命令
      if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        setIsOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  // 打开时聚焦
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // 重置选中索引
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  // 按分类分组
  const groupedCommands: Record<string, Command[]> = {};
  filteredCommands.forEach(cmd => {
    if (!groupedCommands[cmd.category]) {
      groupedCommands[cmd.category] = [];
    }
    groupedCommands[cmd.category].push(cmd);
  });

  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={() => { setIsOpen(false); setQuery(''); }}
      />

      {/* 命令面板 */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
        {/* 搜索输入 */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入命令或搜索..."
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={() => { setIsOpen(false); setQuery(''); }}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* 命令列表 */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              没有找到匹配的命令
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category}>
                <div className="px-4 py-1 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase">
                  {category}
                </div>
                {cmds.map(cmd => {
                  const currentIndex = flatIndex++;
                  const isSelected = currentIndex === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        setIsOpen(false);
                        setQuery('');
                      }}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        isSelected 
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <span className={isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}>
                        {cmd.icon}
                      </span>
                      <span className="flex-1">{cmd.name}</span>
                      {cmd.shortcut && (
                        <kbd className="px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 rounded">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* 底部提示 */}
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-400 flex gap-4">
          <span>↑↓ 导航</span>
          <span>↵ 执行</span>
          <span>ESC 关闭</span>
        </div>
      </div>
    </div>
  );
}
