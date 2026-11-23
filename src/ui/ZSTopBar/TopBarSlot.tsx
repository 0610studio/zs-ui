import { createContext, useContext, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import ZSTopBar from './index';
import type { ZSTopBarRegion } from './topBarRegion';

const TopBarSlotContext = createContext<ZSTopBarRegion | null>(null);

/**
 * 시계 옆 상단 바 칸(iPhone Duo 가로 바)이 있는지·어디인지를 앱 루트에서 한 번 잰다.
 * 보이지 않는 ZSTopBar 하나로 재므로 화면마다 재지 않는다(재면 첫 프레임에 시스템 헤더가 보였다 사라진다).
 * SafeAreaProvider 안, 화면 맨 위 좌표에 둔다.
 */
export function ZSTopBarSlotProvider({ children }: { children: ReactNode }) {
  const [region, setRegion] = useState<ZSTopBarRegion | null>(null);
  return (
    <TopBarSlotContext.Provider value={region}>
      {children}
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.probe}>
        <ZSTopBar onRegionChange={setRegion} />
      </View>
    </TopBarSlotContext.Provider>
  );
}

/**
 * 시계 옆 칸이 있을 때만 그 region(화면 맨 위 좌표). 없거나(`belowStatusBar`) Provider 밖이면 `null`.
 * `contentInsets.left` 는 ZSTopBar 가 시스템 여백(모서리 반영)을 넣은 왼쪽 시작이다.
 */
export function useTopBarSlot(): ZSTopBarRegion | null {
  const region = useContext(TopBarSlotContext);
  return region?.placement === 'besideStatusBar' ? region : null;
}

const styles = StyleSheet.create({
  probe: { position: 'absolute', top: 0, left: 0, right: 0, opacity: 0 },
});
