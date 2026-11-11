import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { todayDateString } from '../core/date';

export function useToday() {
  const [today, setToday] = useState(todayDateString);

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const pause = () => {
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
    };
    const refresh = () => {
      if (!mounted) return;
      pause();
      const now = new Date();
      setToday(todayDateString(now));
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      timer = setTimeout(refresh, Math.max(1, midnight.getTime() - Date.now()));
    };
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
      else pause();
    });
    if (AppState.currentState === 'active') refresh();
    return () => {
      mounted = false;
      pause();
      subscription.remove();
    };
  }, []);

  return today;
}
