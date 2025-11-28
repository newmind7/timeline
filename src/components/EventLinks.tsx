import { useState, useMemo } from 'react';
import { Link2, Plus, X, Search, ArrowRight, Unlink } from 'lucide-react';
import { Event, EVENT_CATEGORIES } from '../types';

interface EventLink {
  sourceId: string;
  targetId: string;
  type: 'related' | 'blocks' | 'blocked-by' | 'parent' | 'child';
}

interface EventLinksProps {
  event: Event;
  allEvents: Event[];
  onUpdateLinks: (links: string[]) => void;
}

const LINK_TYPES = [
  { id: 'related', label: '相关', icon: '🔗' },
  { id: 'blocks', label: '阻塞', icon: '🚫' },
  { id: 'blocked-by', label: '被阻塞', icon: '⏸️' },
  { id: 'parent', label: '父任务', icon: '📁' },
  { id: 'child', label: '子任务', icon: '📄' },
];

export default function EventLinks({ event, allEvents, onUpdateLinks }: EventLinksProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('related');

  // 从localStorage获取链接
  const links = useMemo(() => {
    const saved = localStorage.getItem('eventLinks');
    if (!saved) return [];
    const allLinks: EventLink[] = JSON.parse(saved);
    return allLinks.filter(l => l.sourceId === event.id || l.targetId === event.id);
  }, [event.id]);

  // 获取关联的事件
  const linkedEvents = useMemo(() => {
    return links.map(link => {
      const linkedId = link.sourceId === event.id ? link.targetId : link.sourceId;
      const linkedEvent = allEvents.find(e => e.id === linkedId);
      return { link, event: linkedEvent };
    }).filter(item => item.event);
  }, [links, allEvents, event.id]);

  // 可添加的事件（排除已关联的和自己）
  const availableEvents = useMemo(() => {
    const linkedIds = new Set(linkedEvents.map(le => le.event?.id));
    return allEvents.filter(e => 
      e.id !== event.id && 
      !linkedIds.has(e.id) &&
      (e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       e.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allEvents, event.id, linkedEvents, searchTerm]);

  const saveLinks = (newLinks: EventLink[]) => {
    const saved = localStorage.getItem('eventLinks');
    let allLinks: EventLink[] = saved ? JSON.parse(saved) : [];
    
    // 移除当前事件的旧链接
    allLinks = allLinks.filter(l => l.sourceId !== event.id && l.targetId !== event.id);
    
    // 添加新链接
    allLinks = [...allLinks, ...newLinks];
    
    localStorage.setItem('eventLinks', JSON.stringify(allLinks));
  };

  const handleAddLink = (targetEvent: Event) => {
    const newLink: EventLink = {
      sourceId: event.id,
      targetId: targetEvent.id,
      type: selectedType as EventLink['type'],
    };
    
    const currentLinks = links.filter(l => 
      !(l.sourceId === event.id && l.targetId === targetEvent.id) &&
      !(l.targetId === event.id && l.sourceId === targetEvent.id)
    );
    
    saveLinks([...currentLinks, newLink]);
    setSearchTerm('');
    setIsAdding(false);
    
    // 触发更新
    onUpdateLinks([...linkedEvents.map(le => le.event?.id || ''), targetEvent.id]);
  };

  const handleRemoveLink = (linkToRemove: EventLink) => {
    const newLinks = links.filter(l => 
      !(l.sourceId === linkToRemove.sourceId && l.targetId === linkToRemove.targetId)
    );
    saveLinks(newLinks);
    onUpdateLinks(newLinks.map(l => l.sourceId === event.id ? l.targetId : l.sourceId));
  };

  const getCategoryInfo = (catId?: string) => 
    EVENT_CATEGORIES.find(c => c.id === catId) || { icon: '📌', label: '其他' };

  const getLinkTypeInfo = (type: string) => 
    LINK_TYPES.find(t => t.id === type) || LINK_TYPES[0];

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Link2 className="w-4 h-4" />
          关联事件
          {linkedEvents.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded">
              {linkedEvents.length}
            </span>
          )}
        </div>
        <ArrowRight className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {/* 已关联的事件 */}
          {linkedEvents.length > 0 ? (
            <div className="space-y-2">
              {linkedEvents.map(({ link, event: linkedEvent }) => linkedEvent && (
                <div
                  key={linkedEvent.id}
                  className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <span className="text-sm">{getLinkTypeInfo(link.type).icon}</span>
                  <span className="text-sm">{getCategoryInfo(linkedEvent.category).icon}</span>
                  <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 truncate">
                    {linkedEvent.title}
                  </span>
                  <span className="text-xs text-slate-400">
                    {getLinkTypeInfo(link.type).label}
                  </span>
                  <button
                    onClick={() => handleRemoveLink(link)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                  >
                    <Unlink className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-2">暂无关联事件</p>
          )}

          {/* 添加关联 */}
          {isAdding ? (
            <div className="space-y-2 p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="搜索事件..."
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-600"
                    autoFocus
                  />
                </div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-600"
                >
                  {LINK_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.icon} {type.label}</option>
                  ))}
                </select>
              </div>
              
              {searchTerm && (
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {availableEvents.slice(0, 5).map(e => (
                    <button
                      key={e.id}
                      onClick={() => handleAddLink(e)}
                      className="w-full flex items-center gap-2 p-2 text-left hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-sm"
                    >
                      <span>{getCategoryInfo(e.category).icon}</span>
                      <span className="truncate">{e.title}</span>
                    </button>
                  ))}
                  {availableEvents.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-2">未找到匹配的事件</p>
                  )}
                </div>
              )}
              
              <button
                onClick={() => { setIsAdding(false); setSearchTerm(''); }}
                className="w-full py-1 text-xs text-slate-500 hover:text-slate-700"
              >
                取消
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-1 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg"
            >
              <Plus className="w-4 h-4" />
              添加关联
            </button>
          )}
        </div>
      )}
    </div>
  );
}
