import { useState, useEffect } from 'react';
import { Mail, Plus, Lock, Unlock, Calendar, Trash2, Send, X } from 'lucide-react';

interface Capsule {
  id: string;
  message: string;
  createdAt: string;
  openAt: string;
  isOpened: boolean;
}

export default function TimeCapsule() {
  const [capsules, setCapsules] = useState<Capsule[]>(() => {
    const saved = localStorage.getItem('timeCapsules');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isAdding, setIsAdding] = useState(false);
  const [newCapsule, setNewCapsule] = useState({ message: '', openAt: '' });
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null);

  useEffect(() => {
    localStorage.setItem('timeCapsules', JSON.stringify(capsules));
  }, [capsules]);

  // 检查是否可以打开
  const canOpen = (capsule: Capsule) => {
    return new Date() >= new Date(capsule.openAt);
  };

  // 添加胶囊
  const handleAdd = () => {
    if (!newCapsule.message.trim() || !newCapsule.openAt) return;
    
    const capsule: Capsule = {
      id: Date.now().toString(),
      message: newCapsule.message.trim(),
      createdAt: new Date().toISOString(),
      openAt: newCapsule.openAt,
      isOpened: false,
    };
    
    setCapsules([capsule, ...capsules]);
    setNewCapsule({ message: '', openAt: '' });
    setIsAdding(false);
  };

  // 打开胶囊
  const openCapsule = (capsule: Capsule) => {
    if (!canOpen(capsule)) return;
    setCapsules(capsules.map(c => 
      c.id === capsule.id ? { ...c, isOpened: true } : c
    ));
    setSelectedCapsule({ ...capsule, isOpened: true });
  };

  // 删除胶囊
  const deleteCapsule = (id: string) => {
    setCapsules(capsules.filter(c => c.id !== id));
    if (selectedCapsule?.id === id) {
      setSelectedCapsule(null);
    }
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // 计算倒计时
  const getCountdown = (dateStr: string) => {
    const target = new Date(dateStr);
    const now = new Date();
    const diff = target.getTime() - now.getTime();
    
    if (diff <= 0) return '可以打开了！';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 365) return `${Math.floor(days / 365)}年后`;
    if (days > 30) return `${Math.floor(days / 30)}个月后`;
    return `${days}天后`;
  };

  // 获取默认日期（1年后）
  const getDefaultDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  };

  // 排序：未开启在前，按开启日期排序
  const sortedCapsules = [...capsules].sort((a, b) => {
    if (!a.isOpened && b.isOpened) return -1;
    if (a.isOpened && !b.isOpened) return 1;
    return new Date(a.openAt).getTime() - new Date(b.openAt).getTime();
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Mail className="w-4 h-4 text-pink-500" />
          时间胶囊
        </h3>
        <button
          onClick={() => { setIsAdding(true); setNewCapsule({ message: '', openAt: getDefaultDate() }); }}
          className="p-1 text-slate-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/30 rounded"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 添加表单 */}
      {isAdding && (
        <div className="mb-4 p-3 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg space-y-3">
          <div className="text-sm text-pink-700 dark:text-pink-300 font-medium flex items-center gap-2">
            <Send className="w-4 h-4" />
            写给未来的自己
          </div>
          <textarea
            placeholder="在这里写下你想对未来自己说的话..."
            value={newCapsule.message}
            onChange={(e) => setNewCapsule({...newCapsule, message: e.target.value})}
            className="w-full px-3 py-2 text-sm border border-pink-200 dark:border-pink-800 rounded-lg dark:bg-slate-700 resize-none"
            rows={4}
            autoFocus
          />
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500">打开日期：</span>
            <input
              type="date"
              value={newCapsule.openAt}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setNewCapsule({...newCapsule, openAt: e.target.value})}
              className="flex-1 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 py-2 text-sm bg-pink-600 text-white rounded-lg hover:bg-pink-700">
              封存胶囊
            </button>
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm bg-slate-200 dark:bg-slate-600 rounded-lg">
              取消
            </button>
          </div>
        </div>
      )}

      {/* 胶囊列表 */}
      <div className="space-y-2 max-h-[250px] overflow-y-auto">
        {sortedCapsules.map(capsule => {
          const isReady = canOpen(capsule);
          return (
            <div
              key={capsule.id}
              className={`p-3 rounded-lg border group relative transition-all ${
                capsule.isOpened
                  ? 'bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-700'
                  : isReady
                  ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-300 dark:border-pink-700 cursor-pointer hover:shadow-md'
                  : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
              }`}
              onClick={() => isReady && !capsule.isOpened && openCapsule(capsule)}
            >
              <div className="flex items-center gap-2 mb-2">
                {capsule.isOpened ? (
                  <Unlock className="w-4 h-4 text-slate-400" />
                ) : (
                  <Lock className={`w-4 h-4 ${isReady ? 'text-pink-500' : 'text-purple-500'}`} />
                )}
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(capsule.createdAt)} 封存
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteCapsule(capsule.id); }}
                  className="ml-auto p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              
              {capsule.isOpened ? (
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {capsule.message}
                </p>
              ) : (
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isReady ? 'text-pink-600 dark:text-pink-400' : 'text-purple-600 dark:text-purple-400'}`}>
                    {isReady ? '🎉 点击打开' : '🔒 ' + getCountdown(capsule.openAt)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDate(capsule.openAt)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {capsules.length === 0 && !isAdding && (
        <div className="text-center py-6">
          <Mail className="w-10 h-10 mx-auto mb-2 text-pink-300" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            还没有时间胶囊
          </p>
          <button 
            onClick={() => { setIsAdding(true); setNewCapsule({ message: '', openAt: getDefaultDate() }); }}
            className="text-pink-500 text-sm mt-1"
          >
            写一封给未来的信
          </button>
        </div>
      )}

      {/* 查看胶囊弹窗 */}
      {selectedCapsule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedCapsule(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
                <Mail className="w-5 h-5" />
                <span className="font-medium">来自过去的信</span>
              </div>
              <button onClick={() => setSelectedCapsule(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="text-xs text-slate-400 mb-4">
              封存于 {formatDate(selectedCapsule.createdAt)}
            </div>
            <div className="p-4 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg">
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {selectedCapsule.message}
              </p>
            </div>
            <div className="text-center text-xs text-slate-400 mt-4">
              💌 来自 {formatDate(selectedCapsule.createdAt)} 的你
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
