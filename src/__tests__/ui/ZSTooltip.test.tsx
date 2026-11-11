import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import * as Reanimated from 'react-native-reanimated';
import ZSTooltip, { TOOLTIP_CLOSE_SIZE, TOOLTIP_MIN_HEIGHT, TOOLTIP_TAIL_HEIGHT, TOOLTIP_TAIL_WIDTH, TOOLTIP_TOP_CLEARANCE } from '../../ui/ZSTooltip';
import { withOpacity } from '../../theme/color';
import { springConfig, timingConfig } from '../../theme/motion';
import { SPACE } from '../../theme/spacing';
import { getTestTheme, setTestTheme } from '../utils/theme';
import { queryAllByHostType } from '../utils/hostQueries';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

let mockWindowY: number | null = null;
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  const React = require('react');
  return {
    ...RN,
    View: React.forwardRef((props: any, ref: any) => {
      React.useImperativeHandle(ref, () => mockWindowY === null ? null : { measureInWindow: (callback: (...frame: number[]) => void) => callback(0, mockWindowY!, 200, 40) });
      return React.createElement('View', props, props.children);
    }),
  };
});

const styleOf = (node: { props: { style?: unknown } }) => StyleSheet.flatten(node.props.style as never) ?? {};
const arrow = () => styleOf(screen.getByTestId('zs-tooltip-arrow'));
const tailFill = () => screen.getByTestId('zs-tooltip-arrow').queryAll((node) => typeof node.props.d === 'string')[0]?.props.fill;
const shadowCasters = () => queryAllByHostType('View').filter((node) => styleOf(node).boxShadow !== undefined);

describe('ZSTooltip', () => {
  const { colors, shadows } = getTestTheme();

  afterEach(() => jest.restoreAllMocks());

  afterEach(() => {
    mockWindowY = null;
  });

  it('기본은 반전 막(backgroundInverse 88% + 흐림) 위 textInverse 600 글자다', async () => {
    await render(<ZSTooltip message="길게 눌러 순서를 바꿔보세요" testID="tip" />);
    expect(StyleSheet.flatten(screen.getByText('길게 눌러 순서를 바꿔보세요').props.style)).toMatchObject({ color: colors.textInverse, fontSize: 13, fontWeight: '600' });
    expect(queryAllByHostType('BlurView')).toHaveLength(1);
    const fill = withOpacity(colors.backgroundInverse, 0.88);
    expect(queryAllByHostType('View').some((node) => styleOf(node).backgroundColor === fill)).toBe(true);
    expect(tailFill()).toBe(fill);
  });

  it('한 줄 높이 40, 여백 좌우 12·위아래 8 — 닫기가 있으면 끝 여백 4 에 닫기 32', async () => {
    await render(<ZSTooltip message="여백" showClose={false} />);
    const bubble = screen.getByText('여백').parent!.parent!;
    expect(TOOLTIP_MIN_HEIGHT).toBe(40);
    expect(styleOf(bubble)).toMatchObject({ minHeight: 40, paddingHorizontal: SPACE.md, paddingVertical: SPACE.sm });
    expect(styleOf(bubble).paddingEnd).toBeUndefined();
    await render(<ZSTooltip message="닫기" />);
    expect(styleOf(screen.getByText('닫기').parent!.parent!)).toMatchObject({ paddingEnd: SPACE.xs });
    expect(styleOf(screen.getByTestId('zs-tooltip-close'))).toMatchObject({ width: TOOLTIP_CLOSE_SIZE, height: TOOLTIP_CLOSE_SIZE });
  });

  it('닫기는 늘 말풍선 끝 — 말풍선을 넓혀도 글자 바로 뒤에 붙지 않는다', async () => {
    await render(<ZSTooltip message="넓은 말풍선" style={{ alignSelf: 'stretch' }} />);
    expect(styleOf(screen.getByTestId('zs-tooltip-close'))).toMatchObject({ marginStart: 'auto' });
  });

  describe('진입·퇴장 — motion 토큰', () => {
    it.each([
      ['top', SPACE.sm, SPACE.xs],
      ['bottom', -SPACE.sm, -SPACE.xs],
    ] as const)('%s — 앵커 반대쪽에서 다가오며(move·fade spring fast) 나타나고, 앵커 쪽으로 비켜 가며 timing fast 로 사라진다', async (placement, from, away) => {
      await render(<ZSTooltip message="안내" placement={placement} testID="tip" />);
      const spring = jest.spyOn(Reanimated, 'withSpring');
      const timing = jest.spyOn(Reanimated, 'withTiming');
      const tip = screen.getByTestId('tip');
      const entering = (tip.props.entering as () => Reanimated.LayoutAnimation)();
      expect(entering.initialValues).toEqual({ opacity: 0, transform: [{ translateY: from }] });
      expect(spring).toHaveBeenCalledWith(0, springConfig('move', 'fast'));
      expect(spring).toHaveBeenCalledWith(1, springConfig('fade', 'fast'));
      const exiting = (tip.props.exiting as () => Reanimated.LayoutAnimation)();
      expect(exiting.animations).toEqual({ opacity: 0, transform: [{ translateY: away }] });
      expect(timing).toHaveBeenCalledWith(0, timingConfig('fast'));
    });
  });

  it('색·글자 스타일을 바꿀 수 있다 — 색을 주면 막 대신 그 색 단색이다', async () => {
    await render(<ZSTooltip message="색" backgroundColor="#101010" textColor="#fafafa" textVariant="body1" />);
    expect(StyleSheet.flatten(screen.getByText('색').props.style)).toMatchObject({ color: '#fafafa', fontSize: 17 });
    expect(tailFill()).toBe('#101010');
    expect(queryAllByHostType('BlurView')).toHaveLength(0);
  });

  it('색은 테마 색 이름도 받는다 — 말풍선·꼬리·글자·닫기 누름 표시 모두 그 색이다', async () => {
    await render(<ZSTooltip message="이름" backgroundColor="primaryContainer" textColor="onPrimaryContainer" showClose />);
    expect(StyleSheet.flatten(screen.getByText('이름').props.style)).toMatchObject({ color: colors.onPrimaryContainer });
    expect(tailFill()).toBe(colors.primaryContainer);
    const casters = shadowCasters().map(styleOf);
    expect(casters).toHaveLength(1);
    expect(casters[0]).toMatchObject({ backgroundColor: colors.primaryContainer, boxShadow: shadows.md.boxShadow });
    expect(screen.getByTestId('zs-tooltip-close').props.android_ripple).toEqual({ color: withOpacity(colors.onPrimaryContainer, 0.1), foreground: true });
  });

  it('children 이 있으면 message 대신 그린다', async () => {
    await render(
      <ZSTooltip message="무시">
        <Text>커스텀</Text>
      </ZSTooltip>,
    );
    expect(screen.getByText('커스텀')).toBeTruthy();
    expect(screen.queryByText('무시')).toBeNull();
  });

  it('닫기 버튼은 기본으로 있고(showClose 기본 true), showClose={false} 면 없다', async () => {
    await render(<ZSTooltip message="안내" />);
    expect(screen.getByTestId('zs-tooltip-close')).toBeTruthy();
    await render(<ZSTooltip message="안내" showClose={false} />);
    expect(screen.queryByTestId('zs-tooltip-close')).toBeNull();
  });

  it('비제어: 닫기를 누르면 사라지고 onClose 를 호출한다', async () => {
    const onClose = jest.fn();
    await render(<ZSTooltip message="안내" showClose onClose={onClose} closeAccessibilityLabel="닫기" />);
    expect(screen.getByTestId('zs-tooltip-close').props.accessibilityLabel).toBe('닫기');
    await fireEvent.press(screen.getByTestId('zs-tooltip-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('안내')).toBeNull();
  });

  it('닫기 라벨은 기본 영어, ThemeProvider accessibilityLabels.closeTooltip 이 있으면 그것을 쓴다', async () => {
    await render(<ZSTooltip message="안내" showClose />);
    expect(screen.getByTestId('zs-tooltip-close').props.accessibilityLabel).toBe('Close tooltip');
    setTestTheme({ accessibilityLabels: { closeTooltip: '툴팁 닫기' } });
    await render(<ZSTooltip message="안내" showClose />);
    expect(screen.getByTestId('zs-tooltip-close').props.accessibilityLabel).toBe('툴팁 닫기');
    setTestTheme();
  });

  it('제어: visible 이면 닫기를 눌러도 남는다', async () => {
    const onClose = jest.fn();
    await render(<ZSTooltip message="안내" visible showClose onClose={onClose} />);
    await fireEvent.press(screen.getByTestId('zs-tooltip-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByText('안내')).toBeTruthy();
  });

  it('visible=false·defaultVisible=false 면 그리지 않는다', async () => {
    await render(<ZSTooltip message="안내" visible={false} />);
    expect(screen.queryByText('안내')).toBeNull();
    await render(<ZSTooltip message="안내" defaultVisible={false} />);
    expect(screen.queryByText('안내')).toBeNull();
  });

  it('제어: visible 이 바뀌면 따라 보이고 숨는다', async () => {
    await render(<ZSTooltip message="안내" visible={false} />);
    expect(screen.queryByText('안내')).toBeNull();
    await screen.rerender(<ZSTooltip message="안내" visible />);
    expect(screen.getByText('안내')).toBeTruthy();
  });

  describe('꼬리 18×8', () => {
    it('top(기본)은 말풍선 아래 시작 쪽에서 arrowOffset 만큼 — 말풍선에 0.5 묻혀 이음새가 없다', async () => {
      await render(<ZSTooltip message="위" arrowOffset={24} />);
      expect(arrow()).toMatchObject({ position: 'absolute', width: TOOLTIP_TAIL_WIDTH, height: TOOLTIP_TAIL_HEIGHT, left: 24, bottom: StyleSheet.hairlineWidth });
      expect(arrow().transform).toBeUndefined();
      const bubbleSpace = screen.getByTestId('zs-tooltip-arrow').parent!;
      expect(styleOf(bubbleSpace).paddingBottom).toBe(TOOLTIP_TAIL_HEIGHT);
    });

    it('bottom 은 말풍선 위에 뒤집어 두고, end 정렬은 끝 쪽 간격을 쓴다', async () => {
      await render(<ZSTooltip message="아래" placement="bottom" arrowAlign="end" />);
      expect(arrow()).toMatchObject({ right: 16, top: StyleSheet.hairlineWidth, transform: [{ rotate: '180deg' }] });
    });

    it('center 정렬은 가운데다', async () => {
      await render(<ZSTooltip message="가운데" arrowAlign="center" />);
      expect(arrow()).toMatchObject({ left: '50%', marginLeft: -TOOLTIP_TAIL_WIDTH / 2 });
    });
  });

  describe('자리 — 앵커 위에 자리가 모자라면 아래로', () => {
    const anchored = { position: 'absolute', bottom: '100%', marginBottom: 10 } as const;
    const tipStyle = () => styleOf(screen.getByTestId('tip'));

    it(`앵커 위에 absolute 로 띄운 말풍선이 화면 위 끝에서 ${TOOLTIP_TOP_CLEARANCE} 안쪽이면 앵커 아래로 뒤집는다 — 꼬리도 위를 향한다`, async () => {
      mockWindowY = TOOLTIP_TOP_CLEARANCE - 1;
      await render(<ZSTooltip message="위" testID="tip" style={anchored} />);
      await fireEvent(screen.getByText('위').parent!.parent!, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 200, height: 40 } } });
      expect(tipStyle()).toMatchObject({ position: 'absolute', top: '100%', marginTop: 10 });
      expect(tipStyle().bottom).toBeUndefined();
      expect(tipStyle().marginBottom).toBeUndefined();
      expect(arrow()).toMatchObject({ transform: [{ rotate: '180deg' }] });
    });

    it('자리가 넉넉하면 그대로 둔다', async () => {
      mockWindowY = TOOLTIP_TOP_CLEARANCE;
      await render(<ZSTooltip message="위" testID="tip" style={anchored} />);
      await fireEvent(screen.getByText('위').parent!.parent!, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 200, height: 40 } } });
      expect(tipStyle()).toMatchObject({ bottom: '100%', marginBottom: 10 });
      expect(arrow().transform).toBeUndefined();
    });

    it('흐름 안(absolute 아님)이나 bottom 배치는 옮기지 않는다', async () => {
      mockWindowY = 0;
      await render(<ZSTooltip message="흐름" testID="tip" />);
      await fireEvent(screen.getByText('흐름').parent!.parent!, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 200, height: 40 } } });
      expect(arrow().transform).toBeUndefined();
      await render(<ZSTooltip message="아래" testID="tip" placement="bottom" style={{ position: 'absolute', top: '100%' }} />);
      await fireEvent(screen.getByText('아래').parent!.parent!, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 200, height: 40 } } });
      expect(tipStyle()).toMatchObject({ top: '100%' });
    });

    it('잴 수 없으면(측정 함수 없음) 그대로 둔다', async () => {
      await render(<ZSTooltip message="위" testID="tip" style={anchored} />);
      await fireEvent(screen.getByText('위').parent!.parent!, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 200, height: 40 } } });
      expect(tipStyle()).toMatchObject({ bottom: '100%' });
    });

    it('숨겼다 다시 보이면 원래 자리에서 다시 잰다', async () => {
      mockWindowY = 0;
      await render(<ZSTooltip message="위" testID="tip" style={anchored} visible />);
      await fireEvent(screen.getByText('위').parent!.parent!, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 200, height: 40 } } });
      expect(tipStyle()).toMatchObject({ top: '100%' });
      await screen.rerender(<ZSTooltip message="위" testID="tip" style={anchored} visible={false} />);
      mockWindowY = 100;
      await screen.rerender(<ZSTooltip message="위" testID="tip" style={anchored} visible />);
      expect(tipStyle()).toMatchObject({ bottom: '100%' });
    });
  });

  describe('floating', () => {
    it('떠다니는 반복 애니메이션을 걸고 사라질 때 멈춘다', async () => {
      const repeat = jest.spyOn(Reanimated, 'withRepeat');
      const cancel = jest.spyOn(Reanimated, 'cancelAnimation');
      await render(<ZSTooltip message="둥실" floating />);
      expect(repeat).toHaveBeenCalledWith(expect.anything(), -1, true);
      await screen.unmount();
      expect(cancel).toHaveBeenCalledTimes(1);
    });

    it('시스템 동작 줄이기가 켜져 있으면 움직이지 않는다', async () => {
      jest.spyOn(Reanimated, 'useReducedMotion').mockReturnValue(true);
      const repeat = jest.spyOn(Reanimated, 'withRepeat');
      await render(<ZSTooltip message="고정" floating />);
      expect(repeat).not.toHaveBeenCalled();
    });

    it('floating 이 아니면 움직이지 않는다', async () => {
      const repeat = jest.spyOn(Reanimated, 'withRepeat');
      await render(<ZSTooltip message="고정" />);
      expect(repeat).not.toHaveBeenCalled();
    });
  });
});
