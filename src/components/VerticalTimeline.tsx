import { Event } from '../types';
import { formatDate, isEventInRange, getDateRange } from '../utils/dateUtils';
import { TimeScale } from '../types';
import EventCard from './EventCard';

interface VerticalTimelineProps {
  events: Event[];
  timeScale: TimeScale;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (id: string) => void;
  onProgressChange: (eventId: string, progress: number) => void;
}

export default function VerticalTimeline({
  events,
  timeScale,
  onEditEvent,
  onDeleteEvent,
  onProgressChange,
}: VerticalTimelineProps) {
  const { start, end } = getDateRange(timeScale);

  const filteredEvents = events
    .filter(e => isEventInRange(e.date, start, end))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
    <div className="space-y-6">
      {filteredEvents.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-md"></div>
            {index < filteredEvents.length - 1 && (
              <div className="w-1 h-16 bg-gradient-to-b from-blue-200 to-slate-200 my-2"></div>
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="text-sm font-medium text-slate-500 mb-2">
              {formatDate(event.date, 'long')}
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
  );
}
