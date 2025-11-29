import { LayoutType } from '../types';

export const STORAGE_KEYS = {
  EVENTS: 'timeline_events',
  LAYOUT_PREFERENCE: 'timeline_layout',
  TIME_SCALE: 'timeline_time_scale',
};

export const storage = {
  getEvents: () => {
    const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return data ? JSON.parse(data) : [];
  },

  setEvents: (events: any[]) => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  },

  getLayoutPreference: (): LayoutType => {
    return (localStorage.getItem(STORAGE_KEYS.LAYOUT_PREFERENCE) as LayoutType) || 'vertical';
  },

  setLayoutPreference: (layout: LayoutType) => {
    localStorage.setItem(STORAGE_KEYS.LAYOUT_PREFERENCE, layout);
  },

  getTimeScale: () => {
    return localStorage.getItem(STORAGE_KEYS.TIME_SCALE) || 'month';
  },

  setTimeScale: (scale: string) => {
    localStorage.setItem(STORAGE_KEYS.TIME_SCALE, scale);
  },
};
