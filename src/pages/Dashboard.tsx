import { useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useTimeline } from '../contexts/TimelineContext';
import { Event } from '../types';
import TimelineHeader from '../components/TimelineHeader';
import EventModal from '../components/EventModal';
import VerticalTimeline from '../components/VerticalTimeline';
import HorizontalTimeline from '../components/HorizontalTimeline';
import FilterPanel from '../components/FilterPanel';
import ReviewPanel from '../components/ReviewPanel';
import TimeScaleIndicator, { getNextTimeScale } from '../components/TimeScaleIndicator';

export default function Dashboard() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const { layoutType, timeScale, setTimeScale } = useTimeline();

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
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState<Event[] | null>(null);

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

  return (
    <div className="min-h-screen bg-slate-50" onWheel={handleWheel}>
      <TimelineHeader 
        onAddEvent={handleAddEvent} 
        onFilterClick={() => setIsFilterOpen(true)} 
        onReviewClick={() => setIsReviewOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {layoutType === 'vertical' ? (
          <VerticalTimeline
            events={filteredEvents ?? events}
            timeScale={timeScale}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onProgressChange={handleProgressChange}
          />
        ) : (
          <HorizontalTimeline
            events={filteredEvents ?? events}
            timeScale={timeScale}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onProgressChange={handleProgressChange}
          />
        )}
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

      <TimeScaleIndicator
        timeScale={timeScale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
    </div>
  );
}
