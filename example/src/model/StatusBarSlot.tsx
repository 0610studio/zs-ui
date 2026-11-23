import { useLayoutEffect } from 'react';
import { useBarAxis } from '@0610studio/zs-ui';
import { useBarAxisSetting } from './BarAxisSetting';

// 시계 옆 칸 자체는 zs-ui ZSTopBarSlotProvider · useTopBarSlot 으로 잰다

let horizontalHolders = 0;

export function useHorizontalBars() {
  const [, setBarAxis] = useBarAxis();
  const { barAxis: saved } = useBarAxisSetting();
  useLayoutEffect(() => {
    horizontalHolders += 1;
    setBarAxis('horizontal');
    return () => {
      horizontalHolders -= 1;
      if (horizontalHolders === 0) setBarAxis(saved);
    };
  }, [saved, setBarAxis]);
}
