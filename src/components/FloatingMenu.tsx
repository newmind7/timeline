import { useState } from 'react';
import { 
  Menu, X, Plus, Search, FileText, Download, Upload, 
  Calendar, Target, Timer, Mic, BookTemplate, Archive,
  BarChart3, Settings
} from 'lucide-react';

interface FloatingMenuProps {
  onAddEvent: () => void;
  onOpenSearch: () => void;
  onOpenExport: () => void;
  onOpenImport: () => void;
  onOpenReview: () => void;
  onOpenTemplates: () => void;
  onOpenVoice: () => void;
  onOpenArchive: () => void;
  onOpenReport: () => void;
}

export default function FloatingMenu({
  onAddEvent,
  onOpenSearch,
  onOpenExport,
  onOpenImport,
  onOpenReview,
  onOpenTemplates,
  onOpenVoice,
  onOpenArchive,
  onOpenReport,
}: FloatingMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: Plus, label: '新建事件', action: onAddEvent, color: 'bg-blue-500' },
    { icon: Search, label: '搜索', action: onOpenSearch, color: 'bg-purple-500' },
    { icon: Mic, label: '语音输入', action: onOpenVoice, color: 'bg-red-500' },
    { icon: BookTemplate, label: '模板库', action: onOpenTemplates, color: 'bg-indigo-500' },
    { icon: FileText, label: '复盘', action: onOpenReview, color: 'bg-amber-500' },
    { icon: BarChart3, label: '报告', action: onOpenReport, color: 'bg-green-500' },
    { icon: Download, label: '导出', action: onOpenExport, color: 'bg-cyan-500' },
    { icon: Upload, label: '导入', action: onOpenImport, color: 'bg-teal-500' },
    { icon: Archive, label: '归档', action: onOpenArchive, color: 'bg-slate-500' },
  ];

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-24 right-6 z-40">
      {/* 展开的菜单项 */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute bottom-16 right-0 space-y-2 animate-fade-in">
            {menuItems.map((item, index) => (
              <button
                key={item.label}
                onClick={() => handleAction(item.action)}
                className={`flex items-center gap-3 pl-4 pr-5 py-2.5 ${item.color} text-white rounded-full shadow-lg hover:opacity-90 transition-all`}
                style={{ 
                  animation: `slide-up 0.2s ease-out ${index * 0.03}s both`,
                }}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* 主按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen 
            ? 'bg-slate-700 rotate-45' 
            : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Menu className="w-6 h-6 text-white" />
        )}
      </button>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
