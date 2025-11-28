import { createContext, useContext, useState, ReactNode } from 'react';
import { TimeScale, LayoutType } from '../types';
import { storage } from '../lib/storage';

interface TimelineContextType {
  timeScale: TimeScale;
  setTimeScale: (scale: TimeScale) => void;
  layoutType: LayoutType;
  setLayoutType: (type: LayoutType) => void;
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

export const TimelineProvider = ({ children }: { children: ReactNode }) => {
  const [timeScale, setTimeScale] = useState<TimeScale>(() => {
    const saved = storage.getTimeScale();
    return (saved as TimeScale) || 'month';
  });

  const [layoutType, setLayoutType] = useState<LayoutType>(() => {
    return storage.getLayoutPreference();
  });

  const handleSetTimeScale = (scale: TimeScale) => {
    setTimeScale(scale);
    storage.setTimeScale(scale);
  };

  const handleSetLayoutType = (type: LayoutType) => {
    setLayoutType(type);
    storage.setLayoutPreference(type);
  };

  return (
    <TimelineContext.Provider value={{ timeScale, setTimeScale: handleSetTimeScale, layoutType, setLayoutType: handleSetLayoutType }}>
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimeline = () => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimeline must be used within TimelineProvider');
  }
  return context;
};
