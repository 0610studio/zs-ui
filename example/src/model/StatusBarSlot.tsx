import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ZSTopBar, useBarAxis, type ZSTopBarRegion } from '@0610studio/zs-ui';
import { useBarAxisSetting } from './BarAxisSetting';

const StatusBarSlotContext = createContext<ZSTopBarRegion | null>(null);

export function StatusBarSlotProvider({ children }: { children: ReactNode }) {
  const [region, setRegion] = useState<ZSTopBarRegion | null>(null);
  return (
    <StatusBarSlotContext.Provider value={region}>
      {children}
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.probe}>
        <ZSTopBar onRegionChange={setRegion} />
      </View>
    </StatusBarSlotContext.Provider>
  );
}

export function useStatusBarSlot(): ZSTopBarRegion | null {
  const region = useContext(StatusBarSlotContext);
  return region?.placement === 'besideStatusBar' ? region : null;
}

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

const styles = StyleSheet.create({
  probe: { position: 'absolute', top: 0, left: 0, right: 0, opacity: 0 },
});
