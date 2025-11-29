import { useState, useEffect, lazy, Suspense, memo, useMemo, useCallback } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useTimeline } from '../contexts/TimelineContext';
import { useTheme } from '../contexts/ThemeContext';
import { Event } from '../types';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
// import { useNotifications } from '../hooks/useNotifications';

// 核心组件 - 立即加载
import TimelineHeader from '../components/TimelineHeader';
import EventModal from '../components/EventModal';
import QuickAdd from '../components/QuickAdd';
import CommandPalette from '../components/CommandPalette';
import TimeScaleIndicator, { getNextTimeScale } from '../components/TimeScaleIndicator';

// 主视图组件 - 懒加载 + 预加载
const VerticalTimeline = lazy(() => import(/* webpackPrefetch: true */ '../components/VerticalTimeline'));
const HorizontalTimeline = lazy(() => import(/* webpackPrefetch: true */ '../components/HorizontalTimeline'));
const CalendarView = lazy(() => import(/* webpackPrefetch: true */ '../components/CalendarView'));
const WeekView = lazy(() => import(/* webpackPrefetch: true */ '../components/WeekView'));
const KanbanView = lazy(() => import(/* webpackPrefetch: true */ '../components/KanbanView'));
const GanttView = lazy(() => import('../components/GanttView'));
const ListView = lazy(() => import('../components/ListView'));
const MapView = lazy(() => import('../components/MapView'));
const Timeline3DWrapper = lazy(() => import('../components/Timeline3DWrapper'));

// 面板组件 - 懒加载（仅在打开时加载）
const FilterPanel = lazy(() => import('../components/FilterPanel'));
const ReviewPanel = lazy(() => import('../components/ReviewPanel'));
const ExportPanel = lazy(() => import('../components/ExportPanel'));
const ImportPanel = lazy(() => import('../components/ImportPanel'));
const TemplateLibrary = lazy(() => import('../components/TemplateLibrary'));
const EventArchive = lazy(() => import('../components/EventArchive'));
const ReportExport = lazy(() => import('../components/ReportExport'));
const TagManager = lazy(() => import('../components/TagManager'));
const VoiceInput = lazy(() => import('../components/VoiceInput'));
const FocusMode = lazy(() => import('../components/FocusMode'));

// 侧边栏小部件 - 懒加载 + 预加载（首屏可见）
const TodayStats = lazy(() => import(/* webpackPrefetch: true */ '../components/TodayStats'));
const QuickStats = lazy(() => import(/* webpackPrefetch: true */ '../components/QuickStats'));
const TodayFocus = lazy(() => import(/* webpackPrefetch: true */ '../components/TodayFocus'));
const PomodoroTimer = lazy(() => import('../components/PomodoroTimer'));
const DailyQuote = lazy(() => import('../components/DailyQuote'));
const QuickActions = lazy(() => import('../components/QuickActions'));

// 浮动组件
const FloatingMenu = lazy(() => import('../components/FloatingMenu'));
const MilestoneAlert = lazy(() => import('../components/MilestoneAlert'));
const BackupReminder = lazy(() => import('../components/BackupReminder'));

// 加载占位符
const WidgetSkeleton = memo(() => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 animate-pulse">
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-3"></div>
    <div className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded"></div>
  </div>
));

const ViewSkeleton = memo(() => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 animate-pulse min-h-[400px]">
    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
    <div className="space-y-3">
      {[1,2,3].map(i => (
        <div key={i} className="h-20 bg-slate-100 dark:bg-slate-700/50 rounded"></div>
      ))}
    </div>
  </div>
));

export default function Dashboard() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const { layoutType, setLayoutType, timeScale, setTimeScale } = useTimeline();
  const { theme, setTheme } = useTheme();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  
  useKeyboardShortcuts({
    onNewEvent: () => setIsModalOpen(true),
    onToggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
  });
  
  const handleAddEvent = () => {
    setEditingEvent(undefined);
    setIsModalOpen(true);
  };
  
  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <TimelineHeader 
        onAddEvent={handleAddEvent} 
        onFilterClick={() => setIsFilterOpen(true)} 
        onReviewClick={() => setIsReviewOpen(true)}
        onExportClick={() => setIsExportOpen(true)}
        onImportClick={() => setIsImportOpen(true)}
        events={events}
        onSelectEvent={handleEditEvent}
      />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* 侧边栏 */}
          <div className="space-y-4">
            <Suspense fallback={<WidgetSkeleton />}>
              <TodayStats events={events} />
            </Suspense>
            <Suspense fallback={<WidgetSkeleton />}>
              <QuickStats events={events} />
            </Suspense>
            <Suspense fallback={<WidgetSkeleton />}>
              <TodayFocus events={events} onSelectEvent={handleEditEvent} />
            </Suspense>
            <Suspense fallback={<WidgetSkeleton />}>
              <PomodoroTimer />
            </Suspense>
            <Suspense fallback={<WidgetSkeleton />}>
              <DailyQuote />
            </Suspense>
          </div>
          
          {/* 主视图 */}
          <div className="lg:col-span-3">
            <Suspense fallback={<ViewSkeleton />}>
              {layoutType === 'vertical' && (
                <VerticalTimeline
                  events={events}
                  timeScale={timeScale}
                  onEditEvent={handleEditEvent}
                  onDeleteEvent={deleteEvent}
                  onProgressChange={(id, p) => updateEvent(id, { progress: p })}
                />
              )}
              {layoutType === 'horizontal' && (
                <HorizontalTimeline
                  events={events}
                  timeScale={timeScale}
                  onEditEvent={handleEditEvent}
                  onDeleteEvent={deleteEvent}
                  onProgressChange={(id, p) => updateEvent(id, { progress: p })}
                />
              )}
              {layoutType === 'calendar' && (
                <CalendarView
                  events={events}
                  onEditEvent={handleEditEvent}
                  onAddEvent={handleAddEvent}
                />
              )}
              {layoutType === 'week' && (
                <WeekView
                  events={events}
                  onEditEvent={handleEditEvent}
                  onAddEvent={handleAddEvent}
                />
              )}
              {layoutType === 'kanban' && (
                <KanbanView
                  events={events}
                  onEditEvent={handleEditEvent}
                  onDeleteEvent={deleteEvent}
                  onProgressChange={(id, p) => updateEvent(id, { progress: p })}
                />
              )}
              {layoutType === 'gantt' && (
                <GanttView
                  events={events}
                  onEditEvent={handleEditEvent}
                />
              )}
              {layoutType === 'list' && (
                <ListView
                  events={events}
                  onEditEvent={handleEditEvent}
                  onDeleteEvent={deleteEvent}
                  onProgressChange={(id, p) => updateEvent(id, { progress: p })}
                />
              )}
              {layoutType === 'map' && (
                <MapView />
              )}
              {layoutType === '3d' && (
                <Timeline3DWrapper
                  events={events}
                  onSelectEvent={handleEditEvent}
                />
              )}
            </Suspense>
          </div>
        </div>
      </div>
      
      {/* 事件模态框 */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(undefined);
        }}
        onSave={async (eventData) => {
          if (editingEvent) {
            await updateEvent(editingEvent.id, eventData);
          } else {
            await addEvent(eventData);
          }
          setIsModalOpen(false);
          setEditingEvent(undefined);
        }}
        initialEvent={editingEvent}
      />
      
      {/* 快捷添加 */}
      <QuickAdd onAddEvent={addEvent} />
    </div>
  );
}

// 原始 Dashboard 代码（临时注释）
function OriginalDashboard() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const { layoutType, setLayoutType, timeScale, setTimeScale } = useTimeline();
  const { theme, setTheme } = useTheme();

  // 滚轮缩放处理
  const handleWheel = (e: React.WheelEvent) => {
    // 按住Ctrl键时才触发缩放
    if (!e.ctrlKey) return;
    
    e.preventDefault();
    const direction = e.deltaY > 0 ? 'out' : 'in';
    const nextScale = getNextTimeScale(timeScale, direction);
    if (nextScale) {
      setTimeScale(nextScale);
    }
  };

  const handleZoomIn = () => {
    const nextScale = getNextTimeScale(timeScale, 'in');
    if (nextScale) setTimeScale(nextScale);
  };

  const handleZoomOut = () => {
    const nextScale = getNextTimeScale(timeScale, 'out');
    if (nextScale) setTimeScale(nextScale);
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [isTemplateLibraryOpen, setIsTemplateLibraryOpen] = useState(false);
  const [isVoiceInputOpen, setIsVoiceInputOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isReportExportOpen, setIsReportExportOpen] = useState(false);
  const [focusEvent, setFocusEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState<Event[] | null>(null);

  // 键盘快捷键
  useKeyboardShortcuts({
    onNewEvent: () => setIsModalOpen(true),
    onOpenFilter: () => setIsFilterOpen(true),
    onOpenReview: () => setIsReviewOpen(true),
    onOpenExport: () => setIsExportOpen(true),
    onToggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
  });

  // 使用 useCallback 优化事件处理函数，避免不必要的重渲染
  const handleAddEvent = useCallback(() => {
    setEditingEvent(undefined);
    setIsModalOpen(true);
  }, []);

  const handleEditEvent = useCallback((event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  }, []);

  const handleSaveEvent = async (eventData: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
      } else {
        await addEvent(eventData);
      }
      setIsModalOpen(false);
      setEditingEvent(undefined);
    } catch (error) {
      console.error('Failed to save event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('确定要删除这个事件吗？')) return;
    try {
      await deleteEvent(id);
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const handleProgressChange = async (eventId: string, progress: number) => {
    try {
      await updateEvent(eventId, { progress });
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleDateChange = async (eventId: string, newDate: string) => {
    try {
      await updateEvent(eventId, { date: newDate });
    } catch (error) {
      console.error('Failed to update date:', error);
    }
  };

  // 批量导入事件
  const handleImport = async (eventsToImport: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => {
    for (const eventData of eventsToImport) {
      await addEvent(eventData);
    }
  };
  
  // 缓存显示的事件列表
  const displayEvents = useMemo(() => filteredEvents ?? events, [filteredEvents, events]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors" onWheel={handleWheel}>
      <TimelineHeader 
        onAddEvent={handleAddEvent} 
        onFilterClick={() => setIsFilterOpen(true)} 
        onReviewClick={() => setIsReviewOpen(true)}
        onExportClick={() => setIsExportOpen(true)}
        onImportClick={() => setIsImportOpen(true)}
        events={events}
        onSelectEvent={handleEditEvent}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 侧边栏 - 生命进度和统计 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scrollbar-thin">
            <Suspense fallback={<WidgetSkeleton />}>
              <TodayStats events={events} />
            </Suspense>
            <Suspense fallback={<WidgetSkeleton />}>
              <QuickStats events={events} />
            </Suspense>
            <Suspense fallback={<WidgetSkeleton />}>
              <TodayFocus events={events} onSelectEvent={handleEditEvent} />
            </Suspense>
            <Suspense fallback={<WidgetSkeleton />}>
              <DailyQuote />
            </Suspense>
            <Suspense fallback={<WidgetSkeleton />}>
              <PomodoroTimer />
            </Suspense>
            <Suspense fallback={<WidgetSkeleton />}>
              <QuickActions 
                onAddEvent={() => setIsModalOpen(true)}
                onExport={() => setIsExportOpen(true)}
                onImport={() => setIsImportOpen(true)}
                onOpenPomodoro={() => {}}
                onOpenGoals={() => {}}
                onOpenNotes={() => {}}
              />
            </Suspense>
          </div>
          
          <div className="lg:col-span-3">
            <Suspense fallback={<ViewSkeleton />}>
              {layoutType === 'vertical' && (
                <VerticalTimeline
                  events={displayEvents}
                  timeScale={timeScale}
                  onEditEvent={handleEditEvent}
                  onDeleteEvent={handleDeleteEvent}
                  onProgressChange={handleProgressChange}
                />
              )}
              {layoutType === 'horizontal' && (
                <HorizontalTimeline
                  events={displayEvents}
                  timeScale={timeScale}
                  onEditEvent={handleEditEvent}
                  onDeleteEvent={handleDeleteEvent}
                  onProgressChange={handleProgressChange}
                />
              )}
              {layoutType === 'calendar' && (
                <CalendarView
                  events={displayEvents}
                  onEditEvent={handleEditEvent}
                  onAddEvent={handleAddEvent}
                />
              )}
              {layoutType === 'week' && (
                <WeekView
                  events={displayEvents}
                  onEditEvent={handleEditEvent}
                  onAddEvent={handleAddEvent}
                />
              )}
              {layoutType === 'kanban' && (
                <KanbanView
                  events={displayEvents}
                  onEditEvent={handleEditEvent}
                  onDeleteEvent={handleDeleteEvent}
                  onProgressChange={handleProgressChange}
                />
              )}
              {layoutType === 'gantt' && (
                <GanttView
                  events={displayEvents}
                  onEditEvent={handleEditEvent}
                />
              )}
              {layoutType === 'list' && (
                <ListView
                  events={displayEvents}
                  onEditEvent={handleEditEvent}
                  onDeleteEvent={handleDeleteEvent}
                  onProgressChange={handleProgressChange}
                />
              )}
              {layoutType === 'map' && (
                <MapView />
              )}
              {layoutType === '3d' && (
                <Timeline3DWrapper
                  events={displayEvents}
                  onSelectEvent={handleEditEvent}
                />
              )}
            </Suspense>
          </div>
        </div>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(undefined);
        }}
        onSave={handleSaveEvent}
        initialEvent={editingEvent}
        isLoading={isLoading}
      />

      {isFilterOpen && (
        <Suspense fallback={null}>
          <FilterPanel
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            events={events}
            onFiltersChange={setFilteredEvents}
          />
        </Suspense>
      )}

      {isReviewOpen && (
        <Suspense fallback={null}>
          <ReviewPanel
            isOpen={isReviewOpen}
            onClose={() => setIsReviewOpen(false)}
          />
        </Suspense>
      )}

      {isExportOpen && (
        <Suspense fallback={null}>
          <ExportPanel
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
            events={events}
          />
        </Suspense>
      )}

      {isImportOpen && (
        <Suspense fallback={null}>
          <ImportPanel
            isOpen={isImportOpen}
            onClose={() => setIsImportOpen(false)}
            onImport={handleImport}
          />
        </Suspense>
      )}

      <TimeScaleIndicator
        timeScale={timeScale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      {/* 快捷添加按钮 */}
      <QuickAdd onAdd={handleSaveEvent} />

      {/* 命令面板 Ctrl+P */}
      <CommandPalette
        onNewEvent={handleAddEvent}
        onOpenFilter={() => setIsFilterOpen(true)}
        onOpenReview={() => setIsReviewOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onChangeView={setLayoutType}
        currentTheme={theme}
      />

      {/* 里程碑庆祝 */}
      <Suspense fallback={null}>
        <MilestoneAlert events={events} />
      </Suspense>

      {/* 专注模式 */}
      {focusEvent && (
        <Suspense fallback={null}>
          <FocusMode
            event={focusEvent}
            onClose={() => setFocusEvent(null)}
            onComplete={(event) => {
              updateEvent(event.id, { progress: 100 });
              setFocusEvent(null);
            }}
          />
        </Suspense>
      )}

      {/* 备份提醒 */}
      <Suspense fallback={null}>
        <BackupReminder events={events} onExport={() => setIsExportOpen(true)} />
      </Suspense>

      {/* 标签管理 */}
      {isTagManagerOpen && (
        <Suspense fallback={null}>
          <TagManager
            isOpen={isTagManagerOpen}
            onClose={() => setIsTagManagerOpen(false)}
          />
        </Suspense>
      )}

      {/* 模板库 */}
      {isTemplateLibraryOpen && (
        <Suspense fallback={null}>
          <TemplateLibrary
            isOpen={isTemplateLibraryOpen}
            onClose={() => setIsTemplateLibraryOpen(false)}
            onSelectTemplate={(template) => {
              setEditingEvent({
                id: '',
                user_id: '',
                title: template.name,
                description: template.description || '',
                date: new Date().toISOString().split('T')[0],
                color: template.color,
                progress: template.defaultProgress,
                category: template.category as any,
                created_at: '',
                updated_at: '',
              });
              setIsModalOpen(true);
            }}
          />
        </Suspense>
      )}

      {/* 语音输入 */}
      {isVoiceInputOpen && (
        <Suspense fallback={null}>
          <VoiceInput
            isOpen={isVoiceInputOpen}
            onClose={() => setIsVoiceInputOpen(false)}
            onResult={(text) => {
              setEditingEvent({
                id: '',
                user_id: '',
                title: text,
                description: '',
                date: new Date().toISOString().split('T')[0],
                color: '#3B82F6',
                progress: 0,
                created_at: '',
                updated_at: '',
              });
              setIsModalOpen(true);
            }}
          />
        </Suspense>
      )}

      {/* 事件归档 */}
      {isArchiveOpen && (
        <Suspense fallback={null}>
          <EventArchive
            isOpen={isArchiveOpen}
            onClose={() => setIsArchiveOpen(false)}
            onRestore={(event) => addEvent(event)}
            onPermanentDelete={(id) => console.log('Permanently deleted:', id)}
          />
        </Suspense>
      )}

      {/* 统计报告导出 */}
      {isReportExportOpen && (
        <Suspense fallback={null}>
          <ReportExport
            events={events}
            isOpen={isReportExportOpen}
            onClose={() => setIsReportExportOpen(false)}
          />
        </Suspense>
      )}

      {/* 浮动快捷菜单 */}
      <Suspense fallback={null}>
        <FloatingMenu
          onAddEvent={() => setIsModalOpen(true)}
          onOpenSearch={() => {}}
          onOpenExport={() => setIsExportOpen(true)}
          onOpenImport={() => setIsImportOpen(true)}
          onOpenReview={() => setIsReviewOpen(true)}
          onOpenTemplates={() => setIsTemplateLibraryOpen(true)}
          onOpenVoice={() => setIsVoiceInputOpen(true)}
          onOpenArchive={() => setIsArchiveOpen(true)}
          onOpenReport={() => setIsReportExportOpen(true)}
        />
      </Suspense>
    </div>
  );
}
