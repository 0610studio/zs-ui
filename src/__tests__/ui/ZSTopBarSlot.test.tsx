import { act, render, renderHook, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ZSTopBarSlotProvider, useTopBarSlot } from '../../ui/ZSTopBar/TopBarSlot';
import type { ZSTopBarRegion } from '../../ui/ZSTopBar';

let reportRegion: (region: ZSTopBarRegion) => void = () => {};
jest.mock('../../ui/ZSTopBar/index', () => ({
  __esModule: true,
  default: ({ onRegionChange }: { onRegionChange: (region: ZSTopBarRegion) => void }) => {
    reportRegion = onRegionChange;
    return null;
  },
}));

const region = (placement: ZSTopBarRegion['placement']): ZSTopBarRegion => ({
  placement,
  measured: true,
  height: 48,
  contentInsets: { top: 0, left: 20, right: 0, bottom: 0 },
  systemBar: null,
  systemMargins: null,
});

function SlotProbe() {
  const slot = useTopBarSlot();
  return <Text testID="slot">{slot ? `${slot.placement}:${slot.contentInsets.left}` : 'none'}</Text>;
}

describe('ZSTopBarSlotProvider · useTopBarSlot', () => {
  it('보이지 않는 ZSTopBar 로 잰 region 을 시계 옆 칸일 때만 알려 준다', async () => {
    await render(
      <ZSTopBarSlotProvider>
        <SlotProbe />
      </ZSTopBarSlotProvider>,
    );
    expect(screen.getByTestId('slot').props.children).toBe('none');
    await act(() => reportRegion(region('besideStatusBar')));
    expect(screen.getByTestId('slot').props.children).toBe('besideStatusBar:20');
    await act(() => reportRegion(region('belowStatusBar')));
    expect(screen.getByTestId('slot').props.children).toBe('none');
  });

  it('Provider 밖에서는 null', async () => {
    const { result } = await renderHook(() => useTopBarSlot());
    expect(result.current).toBeNull();
  });
});
