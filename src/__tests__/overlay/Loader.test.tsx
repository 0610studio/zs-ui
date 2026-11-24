import { act, render, screen } from '@testing-library/react-native';
import { Platform, StyleSheet } from 'react-native';
import Loader, { LOADER_BOX_SIZE, LOADER_PROGRESS_WIDTH } from '../../overlay/Loader';
import { withOpacity } from '../../theme/color';
import { RADIUS } from '../../theme/radius';
import { DURATION } from '../../theme/motion';
import { getTestTheme } from '../utils/theme';
import { createComposeColors } from '../../native/composeColors';
import { getByHostType, queryAllByHostType } from '../utils/hostQueries';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

const platform = Platform as { OS: string };
const styleOf = (node: { props: { style?: unknown } }) => StyleSheet.flatten(node.props.style as never) ?? {};
const scrimOf = () => screen.getByTestId('zs-loader').children.find((child) => typeof child !== 'string')! as unknown as { props: { style?: unknown }; queryAll: (fn: (node: { props: { style?: unknown } }) => boolean) => { props: { style?: unknown } }[] };
const fillOf = (node: ReturnType<typeof scrimOf>) => node.queryAll((child) => typeof styleOf(child).backgroundColor === 'string').map(styleOf)[0];

describe('Loader', () => {
  const { colors } = getTestTheme();

  afterEach(() => {
    platform.OS = 'ios';
  });

  it('화면을 막 + 흐림(scrim, 검정 32%)으로 덮고 스크린 리더에 진행 중인 모달로 알린다', async () => {
    await render(<Loader visible accessibilityLabel="불러오는 중" />);
    const loader = screen.getByTestId('zs-loader');
    expect(loader.props).toMatchObject({
      accessible: true,
      accessibilityViewIsModal: true,
      importantForAccessibility: 'yes',
      accessibilityRole: 'progressbar',
      accessibilityLabel: '불러오는 중',
      accessibilityState: { busy: true },
    });
    expect(styleOf(loader)).toMatchObject({ zIndex: 8999, alignItems: 'center' });
    expect(styleOf(loader).opacity).toBeUndefined();
    expect(fillOf(scrimOf())).toMatchObject({ backgroundColor: withOpacity(colors.backdrop, 0.32), opacity: 0 });
    expect(queryAllByHostType('BlurView').map((node) => node.props.intensity)).toEqual([1, 1]);
  });

  it('iOS 는 창에 직접 붙는 FullWindowOverlay 에 그린다 — 열린 SwiftUI 시트까지 막는다', async () => {
    await render(<Loader visible accessibilityLabel="로딩" />);
    expect(queryAllByHostType('FullWindowOverlay')).toHaveLength(1);
    expect(getByHostType('FullWindowOverlay').props.unstable_accessibilityContainerViewIsModal).toBeUndefined();
    expect(queryAllByHostType('Modal')).toHaveLength(0);
  });

  it('Android 는 투명 Modal 창에 그리고 뒤로가기를 막는다', async () => {
    platform.OS = 'android';
    await render(<Loader visible accessibilityLabel="로딩" />);
    expect(getByHostType('Modal').props).toMatchObject({ visible: true, transparent: true, animationType: 'none', statusBarTranslucent: true, navigationBarTranslucent: true });
    expect(getByHostType('Modal').props.onRequestClose()).toBeUndefined();
    expect(queryAllByHostType('FullWindowOverlay')).toHaveLength(0);
  });

  it('visible 이 false 가 되면 사라지는 전환이 끝난 뒤 거두고, 그동안 마지막 문구를 읽힌다', async () => {
    jest.useFakeTimers();
    const { rerender } = await render(<Loader visible accessibilityLabel="결제 중" />);
    await rerender(<Loader visible={false} accessibilityLabel="Loading" />);
    expect(screen.getByTestId('zs-loader').props.accessibilityLabel).toBe('결제 중');
    await act(() => jest.advanceTimersByTime(DURATION.fast));
    expect(screen.queryByTestId('zs-loader')).toBeNull();
    await rerender(<Loader visible accessibilityLabel="다시" />);
    expect(screen.getByTestId('zs-loader').props.accessibilityLabel).toBe('다시');
    jest.useRealTimers();
  });

  it('visible 이 false 로 시작하면 아무것도 그리지 않는다', async () => {
    await render(<Loader visible={false} accessibilityLabel="로딩" />);
    expect(screen.queryByTestId('zs-loader')).toBeNull();
  });

  it('iOS 는 막(veil) 88 상자(반경 lg) 안 시스템 activity indicator 다', async () => {
    await render(<Loader visible accessibilityLabel="로딩" />);
    expect(screen.getByTestId('activity-indicator').props).toMatchObject({ size: 'large', color: colors.textSecondary });
    const box = screen.getByTestId('activity-indicator').parent!.parent!;
    expect(LOADER_BOX_SIZE).toBe(88);
    expect(styleOf(box)).toMatchObject({ width: 88, height: 88, borderRadius: RADIUS.lg });
    expect(fillOf(box as never)).toMatchObject({ backgroundColor: withOpacity(colors.surface1, 0.8) });
    expect(queryAllByHostType('ContainedLoadingIndicator')).toHaveLength(0);
  });

  it('progress 가 없으면 진행률을 그리지 않고 스크린 리더 값도 두지 않는다', async () => {
    await render(<Loader visible accessibilityLabel="로딩" />);
    expect(screen.queryByTestId('zs-loader-progress')).toBeNull();
    expect(screen.queryByTestId('zs-loader-percent')).toBeNull();
    expect(screen.getByTestId('zs-loader').props.accessibilityValue).toBeUndefined();
  });

  it.each(['ios', 'android'])('%s: progress 를 주면 진행 표시 아래 막(veil) 상자에 막대와 백분율을 그리고 스크린 리더 값으로 알린다', async (os) => {
    platform.OS = os;
    await render(<Loader visible accessibilityLabel="압축 중" progress={0.426} />);
    expect(screen.getByTestId('zs-loader').props.accessibilityValue).toEqual({ min: 0, max: 100, now: 42 });
    expect(screen.getByTestId('zs-loader-percent').props.children).toBe('42%');
    expect(styleOf(screen.getByTestId('zs-loader-percent'))).toMatchObject({ color: colors.textSecondary, fontVariant: ['tabular-nums'] });
    expect(styleOf(screen.getByTestId('zs-loader-progress'))).toMatchObject({ width: LOADER_PROGRESS_WIDTH, height: 4, backgroundColor: colors.surface4 });
    expect(styleOf(screen.getByTestId('zs-loader-progress-fill'))).toMatchObject({ backgroundColor: colors.primary, width: '42.6%' });
    const box = screen.getByTestId('zs-loader-progress').parent!.parent!;
    expect(styleOf(box)).toMatchObject({ position: 'absolute', top: '100%', borderRadius: RADIUS.lg });
  });

  it.each([
    [1.5, '100%'],
    [-0.2, '0%'],
    [Number.NaN, '0%'],
    [0.999, '99%'],
  ])('progress %p 는 0~1 로 자르고 내림해 %s 로 보인다', async (progress, text) => {
    await render(<Loader visible accessibilityLabel="로딩" progress={progress} />);
    expect(screen.getByTestId('zs-loader-percent').props.children).toBe(text);
  });

  it('visible 이 false 가 되면 사라지는 동안 마지막 진행률을 그대로 보인다', async () => {
    jest.useFakeTimers();
    const { rerender } = await render(<Loader visible accessibilityLabel="압축 중" progress={0.7} />);
    await rerender(<Loader visible={false} accessibilityLabel="Loading" />);
    expect(screen.getByTestId('zs-loader-percent').props.children).toBe('70%');
    await act(() => jest.advanceTimersByTime(DURATION.fast));
    expect(screen.queryByTestId('zs-loader')).toBeNull();
    jest.useRealTimers();
  });

  it('Android 는 M3 Expressive ContainedLoadingIndicator 다 — Modal 창이라 뒤는 흐리지 않고 대체 scrim(48%)', async () => {
    platform.OS = 'android';
    await render(<Loader visible accessibilityLabel="로딩" />);
    expect(getByHostType('ContainedLoadingIndicator').props).toEqual(createComposeColors(getTestTheme().colors).loadingIndicator);
    expect(getByHostType('Host').props.matchContents).toBe(true);
    expect(screen.queryByTestId('activity-indicator')).toBeNull();
    expect(queryAllByHostType('BlurView')).toHaveLength(0);
    expect(fillOf(scrimOf())?.backgroundColor).toBe(withOpacity(colors.backdrop, 0.48));
  });
});
