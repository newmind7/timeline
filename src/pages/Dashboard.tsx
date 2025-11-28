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
import CountdownWidget from '../components/CountdownWidget';
import WeeklyReport from '../components/WeeklyReport';
import TimeDistribution from '../components/TimeDistribution';
import DailyQuote from '../components/DailyQuote';
import TodayFocus from '../components/TodayFocus';
import CommandPalette from '../components/CommandPalette';
import RandomReview from '../components/RandomReview';
import TimeCapsule from '../components/TimeCapsule';
import MilestoneAlert from '../components/MilestoneAlert';
import FocusMode from '../components/FocusMode';
import BackupReminder from '../components/BackupReminder';
import TagManager from '../components/TagManager';
import AchievementSystem from '../components/AchievementSystem';
import MoodTracker from '../components/MoodTracker';
import SmartSuggestions from '../components/SmartSuggestions';
import PeriodSummary from '../components/PeriodSummary';
import FocusStats from '../components/FocusStats';
import QuickActions from '../components/QuickActions';
import TemplateLibrary from '../components/TemplateLibrary';
import VoiceInput from '../components/VoiceInput';
import DraggableTimeline from '../components/DraggableTimeline';
import DataInsights from '../components/DataInsights';
import EventArchive from '../components/EventArchive';
import ReportExport from '../components/ReportExport';
import FloatingMenu from '../components/FloatingMenu';
import TodayStats from '../components/TodayStats';
import FocusLeaderboard from '../components/FocusLeaderboard';
import PeriodGoals from '../components/PeriodGoals';
import AmbientSounds from '../components/AmbientSounds';
import TagCloud from '../components/TagCloud';
import QuickTemplates from '../components/QuickTemplates';
import ReminderPreview from '../components/ReminderPreview';
import DailyReview from '../components/DailyReview';
import TimeBlocking from '../components/TimeBlocking';
import EfficiencyScore from '../components/EfficiencyScore';
import QuickStats from '../components/QuickStats';
import StarredEvents from '../components/StarredEvents';
import WeekPlan from '../components/WeekPlan';
import QuickFilters from '../components/QuickFilters';
import WeeklySummary from '../components/WeeklySummary';
import TodayTodoList from '../components/TodayTodoList';
import EisenhowerMatrix from '../components/EisenhowerMatrix';
import BackupStatus from '../components/BackupStatus';
import ProgressSnapshots from '../components/ProgressSnapshots';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useNotifications } from '../hooks/useNotifications';

export default function Dashboard() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const { layoutType, setLayoutType, timeScale, setTimeScale } = useTimeline();
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
          <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 scrollbar-thin">
            <TodayStats events={events} />
            <SmartSuggestions events={events} onSelectEvent={handleEditEvent} onAddEvent={() => setIsModalOpen(true)} />
            <DailyQuote />
            <TodayFocus events={events} onSelectEvent={handleEditEvent} />
            <MoodTracker />
            <AchievementSystem events={events} />
            <RandomReview events={events} onSelectEvent={handleEditEvent} />
            <TimeCapsule />
            <LifeProgressBar />
            <CountdownWidget />
            <HabitTracker />
            <GoalTracker />
            <QuickNotes />
            <QuickActions 
              onAddEvent={() => setIsModalOpen(true)}
              onExport={() => setIsExportOpen(true)}
              onImport={() => setIsImportOpen(true)}
              onOpenPomodoro={() => {}}
              onOpenGoals={() => {}}
              onOpenNotes={() => {}}
            />
            <FocusStats />
            <FocusLeaderboard />
            <PeriodGoals />
            <AmbientSounds />
            <QuickTemplates onCreateEvent={(e) => addEvent(e)} />
            <TagCloud events={events} />
            <ReminderPreview events={events} />
            <DailyReview events={events} />
            <TimeBlocking />
            <EfficiencyScore events={events} />
            <QuickStats events={events} />
            <StarredEvents events={events} onEventClick={handleEditEvent} />
            <WeekPlan events={events} onAddEvent={(date) => setIsModalOpen(true)} onEventClick={handleEditEvent} />
            <QuickFilters events={events} onFilterChange={(filtered) => setFilteredEvents(filtered)} />
            <WeeklySummary events={events} />
            <TodayTodoList />
            <EisenhowerMatrix events={events} onEventClick={handleEditEvent} />
            <BackupStatus events={events} onExport={() => setIsExportOpen(true)} />
            <ProgressSnapshots events={events} />
            <DraggableTimeline events={events} onUpdateEventDate={handleDateChange} />
            <PeriodSummary events={events} />
            <DataInsights events={events} />
            <WeeklyReport events={events} />
            <TimeDistribution events={events} />
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
      <MilestoneAlert events={events} />

      {/* 专注模式 */}
      {focusEvent && (
        <FocusMode
          event={focusEvent}
          onClose={() => setFocusEvent(null)}
          onComplete={(event) => {
            updateEvent(event);
            setFocusEvent(null);
          }}
        />
      )}

      {/* 备份提醒 */}
      <BackupReminder events={events} onExport={() => setIsExportOpen(true)} />

      {/* 标签管理 */}
      <TagManager
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
      />

      {/* 模板库 */}
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

      {/* 语音输入 */}
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

      {/* 事件归档 */}
      <EventArchive
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        onRestore={(event) => addEvent(event)}
        onPermanentDelete={(id) => console.log('Permanently deleted:', id)}
      />

      {/* 统计报告导出 */}
      <ReportExport
        events={events}
        isOpen={isReportExportOpen}
        onClose={() => setIsReportExportOpen(false)}
      />

      {/* 浮动快捷菜单 */}
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
    </div>
  );
}
