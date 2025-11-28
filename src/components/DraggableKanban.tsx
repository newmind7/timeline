import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit2, Trash2, Clock, CheckCircle, AlertTriangle, Calendar, GripVertical } from 'lucide-react';
import { Event, EVENT_CATEGORIES } from '../types';
import { getEventStatus, formatDate } from '../utils/dateUtils';

interface DraggableKanbanProps {
  events: Event[];
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (id: string) => void;
  onProgressChange: (eventId: string, progress: number) => void;
  onDateChange: (eventId: string, newDate: string) => void;
}

type StatusColumn = 'upcoming' | 'today' | 'overdue' | 'completed';

const COLUMNS: { key: StatusColumn; label: string; icon: React.ReactNode; color: string; targetProgress?: number }[] = [
  { key: 'upcoming', label: '即将到来', icon: <Clock className="w-4 h-4" />, color: 'border-green-500 bg-green-50 dark:bg-green-900/20' },
  { key: 'today', label: '今天', icon: <Calendar className="w-4 h-4" />, color: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' },
  { key: 'overdue', label: '已逾期', icon: <AlertTriangle className="w-4 h-4" />, color: 'border-red-500 bg-red-50 dark:bg-red-900/20' },
  { key: 'completed', label: '已完成', icon: <CheckCircle className="w-4 h-4" />, color: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20', targetProgress: 100 },
];

// 可拖拽的事件卡片
function SortableEventCard({
  event,
  onEditEvent,
  onDeleteEvent,
  onProgressChange,
  columnKey,
}: {
  event: Event;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (id: string) => void;
  onProgressChange: (eventId: string, progress: number) => void;
  columnKey: StatusColumn;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const cat = EVENT_CATEGORIES.find(c => c.value === event.category);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 hover:shadow-md transition-shadow group ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
      }`}
    >
      {/* 拖拽手柄和事件头部 */}
      <div className="flex items-start gap-2 mb-2">
        <button
          {...attributes}
          {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-slate-900 dark:text-white truncate">
            {event.title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {formatDate(event.date, 'short')}
          </p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEditEvent(event)}
            className="p-1 text-slate-400 hover:text-blue-600"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteEvent(event.id)}
            className="p-1 text-slate-400 hover:text-red-600"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 分类标签 */}
      {cat && (
        <span className="inline-block text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded mb-2 ml-6">
          {cat.icon} {cat.label}
        </span>
      )}

      {/* 进度条 */}
      <div className="mb-2 ml-6">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-500 dark:text-slate-400">进度</span>
          <span className="text-slate-700 dark:text-slate-300 font-medium">{event.progress}%</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5">
          <div
            className={`h-full rounded-full transition-all ${
              event.progress === 100 ? 'bg-blue-500' :
              columnKey === 'overdue' ? 'bg-red-500' :
              columnKey === 'today' ? 'bg-amber-500' : 'bg-green-500'
            }`}
            style={{ width: `${event.progress}%` }}
          />
        </div>
      </div>

      {/* 快速完成按钮 */}
      {columnKey !== 'completed' && (
        <button
          onClick={() => onProgressChange(event.id, 100)}
          className="w-full py-1.5 text-xs text-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors ml-6"
          style={{ width: 'calc(100% - 24px)' }}
        >
          ✓ 标记完成
        </button>
      )}
    </div>
  );
}

// 事件卡片预览（拖拽时显示）
function EventCardOverlay({ event }: { event: Event }) {
  const cat = EVENT_CATEGORIES.find(c => c.value === event.category);
  
  return (
    <div className="bg-white dark:bg-slate-700 rounded-lg p-3 shadow-2xl ring-2 ring-blue-500 w-64">
      <h4 className="font-medium text-slate-900 dark:text-white truncate">
        {event.title}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
        {formatDate(event.date, 'short')}
      </p>
      {cat && (
        <span className="inline-block text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded mt-2">
          {cat.icon} {cat.label}
        </span>
      )}
    </div>
  );
}

export default function DraggableKanban({
  events,
  onEditEvent,
  onDeleteEvent,
  onProgressChange,
  onDateChange,
}: DraggableKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 按状态分组事件
  const groupedEvents = useMemo(() => {
    const groups: Record<StatusColumn, Event[]> = {
      upcoming: [],
      today: [],
      overdue: [],
      completed: [],
    };

    events.forEach(event => {
      const status = getEventStatus(event.date, event.progress) as StatusColumn;
      if (groups[status]) {
        groups[status].push(event);
      }
    });

    // 按日期排序
    Object.values(groups).forEach(group => {
      group.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    return groups;
  }, [events]);

  const activeEvent = activeId ? events.find(e => e.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // 可以在这里处理跨列拖拽的预览效果
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeEventId = active.id as string;
    const overId = over.id as string;

    // 检查是否拖到了某个列
    const targetColumn = COLUMNS.find(col => col.key === overId);
    
    if (targetColumn) {
      // 拖到列上，根据列类型设置日期或进度
      if (targetColumn.key === 'completed') {
        onProgressChange(activeEventId, 100);
      } else if (targetColumn.key === 'today') {
        const today = new Date().toISOString();
        onDateChange(activeEventId, today);
      } else if (targetColumn.key === 'upcoming') {
        // 设置为明天
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        onDateChange(activeEventId, tomorrow.toISOString());
      }
    }
  };

  return (
    <div className="h-full">
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-sm text-blue-700 dark:text-blue-300">
        💡 拖拽事件到不同列可以快速调整状态：拖到"已完成"标记完成，拖到"今天"设为今日待办
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
          {COLUMNS.map(column => (
            <div
              key={column.key}
              className={`flex flex-col rounded-xl border-t-4 ${column.color} bg-white dark:bg-slate-800 shadow-sm min-h-[400px]`}
            >
              {/* 列标题 - 作为放置目标 */}
              <div 
                id={column.key}
                className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-2">
                  <span className={`${
                    column.key === 'upcoming' ? 'text-green-600' :
                    column.key === 'today' ? 'text-amber-600' :
                    column.key === 'overdue' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {column.icon}
                  </span>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{column.label}</h3>
                </div>
                <span className="px-2 py-0.5 text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                  {groupedEvents[column.key].length}
                </span>
              </div>

              {/* 事件列表 */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                <SortableContext
                  items={groupedEvents[column.key].map(e => e.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {groupedEvents[column.key].length === 0 ? (
                    <div className="text-center py-8 text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                      <p className="text-sm">拖拽事件到这里</p>
                    </div>
                  ) : (
                    groupedEvents[column.key].map(event => (
                      <SortableEventCard
                        key={event.id}
                        event={event}
                        onEditEvent={onEditEvent}
                        onDeleteEvent={onDeleteEvent}
                        onProgressChange={onProgressChange}
                        columnKey={column.key}
                      />
                    ))
                  )}
                </SortableContext>
              </div>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeEvent ? <EventCardOverlay event={activeEvent} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
