import { useState } from 'react';
import { Event } from '../types';
import { formatDate, isEventInRange, getDateRange } from '../utils/dateUtils';
import { TimeScale } from '../types';
import EventCard from './EventCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalTimelineProps {
  events: Event[];
  timeScale: TimeScale;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (id: string) => void;
  onProgressChange: (eventId: string, progress: number) => void;
}

export default function HorizontalTimeline({
  events,
  timeScale,
  onEditEvent,
  onDeleteEvent,
  onProgressChange,
}: HorizontalTimelineProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const { start, end } = getDateRange(timeScale);

  const filteredEvents = events
    .filter(e => isEventInRange(e.date, start, end))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('horizontal-timeline-container');
    if (!container) return;

    const scrollAmount = 400;
    const newPosition = direction === 'left'
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount;

    container.scrollLeft = newPosition;
    setScrollPosition(newPosition);
  };

  if (filteredEvents.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-slate-500">此时间段内暂无事件</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
      >
        <ChevronLeft className="w-5 h-5 text-slate-600" />
      </button>

      <div
        id="horizontal-timeline-container"
        className="overflow-x-auto pb-4 px-12"
        onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
      >
        <div className="flex gap-6 min-w-min">
          <div className="relative pt-12 pb-4">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200"></div>
            <div className="flex gap-6">
              {filteredEvents.map((event) => (
                <div key={event.id} className="flex flex-col items-center">
                  <div className="absolute -top-4 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-md left-1/2 -translate-x-1/2"></div>
                  <div className="w-72 mt-8">
                    <div className="text-center text-sm font-medium text-slate-500 mb-3">
                      {formatDate(event.date, 'short')}
                    </div>
                    <EventCard
                      event={event}
                      onEdit={onEditEvent}
                      onDelete={onDeleteEvent}
                      onProgressChange={onProgressChange}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
      >
        <ChevronRight className="w-5 h-5 text-slate-600" />
      </button>
    </div>
  );
}
