import { useState, useEffect } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useTimeline } from '../contexts/TimelineContext';
import { useTheme } from '../contexts/ThemeContext';
import { Event } from '../types';
import TimelineHeader from '../components/TimelineHeader';
import EventModal from '../components/EventModal';
import VerticalTimeline from '../components/VerticalTimeline';
import HorizontalTimeline from '../components/HorizontalTimeline';
import CalendarView from '../components/CalendarView';
import WeekView from '../components/WeekView';
import KanbanView from '../components/KanbanView';
import GanttView from '../components/GanttView';
import ListView from '../components/ListView';
import MapView from '../components/MapView';
import Timeline3DWrapper from '../components/Timeline3DWrapper';
import DraggableKanban from '../components/DraggableKanban';
import QuickAdd from '../components/QuickAdd';
import GlobalSearch from '../components/GlobalSearch';
import FilterPanel from '../components/FilterPanel';
import ReviewPanel from '../components/ReviewPanel';
import TimeScaleIndicator, { getNextTimeScale } from '../components/TimeScaleIndicator';
import LifeProgressBar from '../components/LifeProgressBar';
import StatsDashboard from '../components/StatsDashboard';
import ExportPanel from '../components/ExportPanel';
import ImportPanel from '../components/ImportPanel';
import ActivityHeatmap from '../components/ActivityHeatmap';
import PomodoroTimer from '../components/PomodoroTimer';
import ProgressChart from '../components/ProgressChart';
import HabitTracker from '../components/HabitTracker';
import GoalTracker from '../components/GoalTracker';
import QuickNotes from '../components/QuickNotes';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useNotifications } from '../hooks/useNotifications';

export default function Dashboard() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const { layoutType, timeScale, setTimeScale } = useTimeline();
  const { theme, setTheme } = useTheme();
  const { permission, requestPermission, isSupported } = useNotifications(events);

  // 初始化时请求通知权限
  useEffect(() => {
    if (isSupported && permission === 'default') {
      // 延迟请求，避免页面加载时就弹出
      const timer = setTimeout(() => {
        requestPermission();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission, requestPermission]);

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

  const handleAddEvent = () => {
    setEditingEvent(undefined);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

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
          <div className="lg:col-span-1 space-y-4">
            <LifeProgressBar />
            <HabitTracker />
            <GoalTracker />
            <QuickNotes />
            <StatsDashboard events={events} />
            <ProgressChart events={events} />
            <ActivityHeatmap events={events} />
          </div>
          
          <div className="lg:col-span-3">
            {/* 根据视图类型渲染不同组件 */}
            {layoutType === 'vertical' && (
              <VerticalTimeline
                events={filteredEvents ?? events}
                timeScale={timeScale}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
                onProgressChange={handleProgressChange}
              />
            )}
            {layoutType === 'horizontal' && (
              <HorizontalTimeline
                events={filteredEvents ?? events}
                timeScale={timeScale}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
                onProgressChange={handleProgressChange}
              />
            )}
            {layoutType === 'calendar' && (
              <CalendarView
                events={filteredEvents ?? events}
                onEditEvent={handleEditEvent}
                onAddEvent={handleAddEvent}
              />
            )}
            {layoutType === 'week' && (
              <WeekView
                events={filteredEvents ?? events}
                onEditEvent={handleEditEvent}
                onAddEvent={handleAddEvent}
              />
            )}
            {layoutType === 'kanban' && (
              <KanbanView
                events={filteredEvents ?? events}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
                onProgressChange={handleProgressChange}
              />
            )}
            {layoutType === 'gantt' && (
              <GanttView
                events={filteredEvents ?? events}
                onEditEvent={handleEditEvent}
              />
            )}
            {layoutType === 'list' && (
              <ListView
                events={filteredEvents ?? events}
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
                events={filteredEvents ?? events}
                onSelectEvent={handleEditEvent}
              />
            )}
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

      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        events={events}
        onFiltersChange={setFilteredEvents}
      />

      <ReviewPanel
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
      />

      <ExportPanel
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        events={events}
      />

      <ImportPanel
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImport}
      />

      <TimeScaleIndicator
        timeScale={timeScale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      {/* 快捷添加按钮 */}
      <QuickAdd onAdd={handleSaveEvent} />

      {/* 番茄钟 */}
      <PomodoroTimer />
    </div>
  );
}
