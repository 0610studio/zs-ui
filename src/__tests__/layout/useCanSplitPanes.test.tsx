import { renderHook } from '@testing-library/react-native';
import { Platform, StyleSheet } from 'react-native';
import { useCanSplitPanes } from '../../layout/useCanSplitPanes';
import type { WindowLayout } from '../../layout/types';

let mockWindow: Pick<WindowLayout, 'width' | 'widthClass' | 'largeScreen'>;
let mockInsets = { top: 0, bottom: 0, left: 0, right: 0 };

jest.mock('../../layout/LayoutContext', () => ({ useWindowLayout: () => mockWindow }));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => mockInsets }));

const platform = Platform as { OS: string };
const split = async (options?: Parameters<typeof useCanSplitPanes>[0]) => (await renderHook(() => useCanSplitPanes(options))).result.current;

describe('useCanSplitPanes', () => {
  const os = platform.OS;
  afterEach(() => {
    platform.OS = os;
    mockInsets = { top: 0, bottom: 0, left: 0, right: 0 };
  });

  it('화면 확대로 compact 가 된 Android 펼친 폴더블(큰 화면 창)도 두 칸 — 폭 등급이 아니라 ZSPaneLayout 분할 규칙을 본다', async () => {
    platform.OS = 'android';
    // Fold7 526dpi — 지금 폭 599dp(compact)
    mockWindow = { width: 599, widthClass: 'compact', largeScreen: true };
    expect(await split()).toBe(true);
    // 기본 Android 간격 24 를 빼고 pane 240 두 개가 안 들어가면 한 칸
    mockWindow = { width: 503, widthClass: 'compact', largeScreen: true };
    expect(await split()).toBe(false);
    expect(await split({ spacing: 0 })).toBe(true);
  });

  it('바형 폰은 폭과 상관없이 한 칸', async () => {
    mockWindow = { width: 900, widthClass: 'expanded', largeScreen: false };
    expect(await split()).toBe(false);
  });

  it('iOS 는 기본으로 구분선(hairline)을 빼고, 좌우 safe area 도 뺀다', async () => {
    platform.OS = 'ios';
    mockWindow = { width: 480 + StyleSheet.hairlineWidth, widthClass: 'medium', largeScreen: true };
    expect(await split()).toBe(true);
    mockInsets = { top: 0, bottom: 0, left: 1, right: 0 };
    expect(await split()).toBe(false);
    mockInsets = { top: 0, bottom: 0, left: 0, right: 0 };
    mockWindow = { width: 480, widthClass: 'medium', largeScreen: true };
    expect(await split()).toBe(false);
    expect(await split({ divider: false })).toBe(true);
  });
});
