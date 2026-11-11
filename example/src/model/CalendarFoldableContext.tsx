import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { startOfMonth, todayDateString, type CalendarMode, type DateString } from '@0610studio/zs-ui';
import { useCalendarDataSource, type CalendarDataSource } from './useCalendarDataSource';

export interface CalendarFoldableSettings {
  scrollTransition: boolean;
  tabletop: boolean;
}

interface CalendarFoldableValue {
  source: CalendarDataSource;
  selectedDate: DateString;
  setSelectedDate: (date: DateString) => void;
  visibleMonth: DateString;
  setVisibleMonth: (month: DateString) => void;
  mode: CalendarMode;
  setMode: (mode: CalendarMode) => void;
  settings: CalendarFoldableSettings;
  updateSettings: (patch: Partial<CalendarFoldableSettings>) => void;
}

const CalendarFoldableContext = createContext<CalendarFoldableValue | null>(null);

const DEFAULT_SETTINGS: CalendarFoldableSettings = {
  scrollTransition: true,
  tabletop: false,
};

export function CalendarFoldableProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<DateString>(todayDateString);
  const [visibleMonth, setVisibleMonth] = useState<DateString>(() => startOfMonth(todayDateString()));
  const [mode, setMode] = useState<CalendarMode>('month');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const source = useCalendarDataSource();

  const updateSettings = useCallback(
    (patch: Partial<CalendarFoldableSettings>) => setSettings((prev) => ({ ...prev, ...patch })),
    [],
  );

  const value = useMemo(
    () => ({ source, selectedDate, setSelectedDate, visibleMonth, setVisibleMonth, mode, setMode, settings, updateSettings }),
    [source, selectedDate, visibleMonth, mode, settings, updateSettings],
  );

  return <CalendarFoldableContext.Provider value={value}>{children}</CalendarFoldableContext.Provider>;
}

export function useCalendarFoldable(): CalendarFoldableValue {
  const value = useContext(CalendarFoldableContext);
  if (!value) throw new Error('useCalendarFoldable must be used within a CalendarFoldableProvider');
  return value;
}
