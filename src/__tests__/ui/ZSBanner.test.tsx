import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform, StyleSheet, Text } from 'react-native';
import ZSBanner from '../../ui/ZSBanner';
import { getPaletteColors } from '../../theme/color';
import { getTestTheme, setTestTheme } from '../utils/theme';
import { queryAllByHostProps, queryAllByHostType } from '../utils/hostQueries';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

const bar = () => screen.getByTestId('zs-banner');
const barStyle = () => StyleSheet.flatten(bar().props.style);
const strokes = () => queryAllByHostType('View').map((node) => node.props.stroke).filter(Boolean);
const paths = () => queryAllByHostType('View').map((node) => node.props.d).filter(Boolean);
const fills = () => queryAllByHostType('View').map((node) => node.props.fill).filter((fill) => fill && fill !== 'none');
const iconFace = () => queryAllByHostType('View').find((node) => node.props.r === '9.5' || (typeof node.props.d === 'string' && node.props.d.startsWith('M14.25')));
const PROHIBITION_STROKE = 'M6.91 17.09L17.09 6.91';

describe('ZSBanner', () => {
  const { colors } = getTestTheme();
  let now = 0;

  beforeEach(() => {
    now = 1_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
  });
  afterEach(() => jest.restoreAllMocks());

  it('메시지를 그리고 화면 안 상태로 알린다(사라지지 않는다)', async () => {
    await render(<ZSBanner message="주소를 입력해 주세요" />);
    expect(screen.getByText('주소를 입력해 주세요')).toBeTruthy();
    expect(bar().props).toMatchObject({ accessibilityRole: 'summary', accessibilityLiveRegion: 'polite' });
  });

  it('error·warning 은 alert 역할이다', async () => {
    await render(<ZSBanner message="실패" status="error" />);
    expect(bar().props.accessibilityRole).toBe('alert');
    await render(<ZSBanner message="주의" status="warning" />);
    expect(bar().props.accessibilityRole).toBe('alert');
  });

  it('title 이 있으면 강조 제목과 함께 위로 정렬하고 문구는 기본 굵기다', async () => {
    const { typography } = getTestTheme();
    await render(<ZSBanner title="인증 필요" message="30일마다 인증해요" />);
    expect(StyleSheet.flatten(screen.getByText('인증 필요').props.style).fontWeight).toBe(typography.emphasized.body2.fontWeight);
    expect(StyleSheet.flatten(screen.getByText('30일마다 인증해요').props.style).fontWeight).toBe(typography.body2.fontWeight);
    expect(barStyle().alignItems).toBe('flex-start');
  });

  it('title 이 없으면 문구가 곧 제목이라 강조 굵기다', async () => {
    const { typography } = getTestTheme();
    await render(<ZSBanner message="방문 전 예약이 필요해요" />);
    expect(StyleSheet.flatten(screen.getByText('방문 전 예약이 필요해요').props.style).fontWeight).toBe(typography.emphasized.body2.fontWeight);
  });

  it('문구가 여러 줄이면(큰 글자·좁은 폭) 위로 정렬하고 아이콘 칸을 첫 줄 높이로 맞춘다', async () => {
    await render(<ZSBanner message="긴 안내 문구" />);
    expect(barStyle().alignItems).toBe('center');
    const layout = (lines: { height: number }[]) =>
      fireEvent(screen.getByText('긴 안내 문구'), 'textLayout', { nativeEvent: { lines } });
    await layout([{ height: 40 }, { height: 40 }]);
    expect(barStyle().alignItems).toBe('flex-start');
    const iconSlot = bar().props.children[0];
    expect(StyleSheet.flatten(iconSlot.props.style)).toMatchObject({ justifyContent: 'center', minHeight: 40 });
    await layout([{ height: 40 }]);
    expect(barStyle().alignItems).toBe('center');
  });

  it('fits Android message height to the rendered lines after text and font size changes', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const tree = await render(<ZSBanner message="Short" />);
    const measure = (text: string, heights: number[]) =>
      fireEvent(screen.getByText(text), 'textLayout', { nativeEvent: { lines: heights.map(height => ({ height })) } });
    const maxHeight = (text: string) => StyleSheet.flatten(screen.getByText(text).props.style).maxHeight;

    expect(maxHeight('Short')).toBeUndefined();
    await measure('Short', [21.5]);
    expect(maxHeight('Short')).toBe(22);
    await tree.rerender(<ZSBanner message="A longer message that wraps" />);
    await measure('A longer message that wraps', [21.5, 23]);
    expect(maxHeight('A longer message that wraps')).toBe(45);
    await measure('A longer message that wraps', [30, 31, 32]);
    expect(maxHeight('A longer message that wraps')).toBe(93);
    await measure('A longer message that wraps', [30, 31]);
    expect(maxHeight('A longer message that wraps')).toBe(61);
  });

  it.each(['android', 'ios'] as const)('measures the title separately from the message on %s', async (platform) => {
    jest.replaceProperty(Platform, 'OS', platform);
    await render(<ZSBanner title="Title" message="Several lines of detail" />);
    const title = screen.getByText('Title');
    await fireEvent(title, 'textLayout', { nativeEvent: { lines: [{ height: 20 }] } });
    expect(StyleSheet.flatten(title.props.style).maxHeight).toBe(platform === 'android' ? 20 : undefined);
    expect(StyleSheet.flatten(screen.getByText('Several lines of detail').props.style).maxHeight).toBeUndefined();
  });

  it.each(['info', 'success', 'warning', 'error'] as const)('tonal %s 는 상태 색 container 에 onContainer 글자, 아이콘은 상태 main 색 면에 기호를 container 색으로 오려 낸다', async (status) => {
    const tone = getPaletteColors(colors, status);
    await render(<ZSBanner message="메시지" status={status} />);
    expect(barStyle()).toMatchObject({ backgroundColor: tone.container, borderWidth: 0, alignItems: 'center' });
    expect(StyleSheet.flatten(screen.getByText('메시지').props.style).color).toBe(tone.onContainer);
    expect(iconFace()!.props.fill).toBe(tone.main);
    expect(new Set(fills())).toEqual(status === 'success' ? new Set([tone.main]) : new Set([tone.main, tone.container]));
    expect(strokes().filter((stroke) => stroke !== tone.main)).toEqual(expect.arrayContaining([tone.container]));
  });

  describe('아이콘 — 상태 main 색 원(경고는 세모)', () => {
    const iconSlot = () => bar().props.children[0];
    const glyph = async (status: 'info' | 'success' | 'warning' | 'error' | 'neutral') => {
      await render(<ZSBanner message="m" status={status} />);
      return paths().join(' ');
    };

    it('error 는 금지 표지가 아니라 원 안 느낌표, info 는 원 안 i — 같은 원 안에서 기호 모양으로도 갈린다(색 외 단서)', async () => {
      await render(<ZSBanner message="실패" status="error" />);
      expect(paths()).not.toContain(PROHIBITION_STROKE);
      expect(queryAllByHostProps({ r: '9.5' })).toHaveLength(1);
      const kinds: string[] = [];
      for (const status of ['info', 'success', 'warning', 'error'] as const) kinds.push(await glyph(status));
      expect(new Set(kinds).size).toBe(4);
      expect(await glyph('neutral')).toBe(await glyph('info'));
      expect(iconSlot()).toBeTruthy();
    });

    it('경고는 세모 면이다 — 원이 아니다', async () => {
      await render(<ZSBanner message="주의" status="warning" />);
      expect(queryAllByHostProps({ r: '9.5' })).toHaveLength(0);
      expect(iconFace()!.props.d.startsWith('M14.25')).toBe(true);
    });
  });

  it('outlined 는 배경색 위에 상태 색 테두리, 아이콘 면은 상태 색이고 기호는 배경색으로 오려 낸다', async () => {
    await render(<ZSBanner message="메시지" status="success" variant="outlined" />);
    expect(barStyle()).toMatchObject({ backgroundColor: colors.background, borderColor: colors.success, borderWidth: 1 });
    expect(StyleSheet.flatten(screen.getByText('메시지').props.style).color).toBe(colors.text);
    expect(iconFace()!.props.fill).toBe(colors.success);
    expect(new Set(strokes())).toEqual(new Set([colors.background]));
  });

  it('neutral 은 고르는 면과 같은 회색(surface2)에 text 글자, 아이콘 면은 textSecondary 다', async () => {
    await render(<ZSBanner message="중립" status="neutral" />);
    expect(barStyle().backgroundColor).toBe(colors.surface2);
    expect(StyleSheet.flatten(screen.getByText('중립').props.style).color).toBe(colors.text);
    expect(iconFace()!.props.fill).toBe(colors.textSecondary);
    await render(<ZSBanner message="중립" status="neutral" variant="outlined" />);
    expect(iconFace()!.props.fill).toBe(colors.textSecondary);
  });

  it('icon={null} 이면 아이콘을 숨기고, 노드를 주면 그것을 그린다', async () => {
    await render(<ZSBanner message="안내" icon={null} />);
    expect(strokes()).toHaveLength(0);
    await render(<ZSBanner message="안내" icon={<Text>커스텀</Text>} />);
    expect(screen.getByText('커스텀')).toBeTruthy();
    expect(strokes()).toHaveLength(0);
  });

  it('action 으로 동작 버튼을 둔다', async () => {
    const onPress = jest.fn();
    await render(<ZSBanner message="저장 실패" action={{ label: '다시 시도', onPress }} />);
    await fireEvent.press(screen.getByText('다시 시도'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('outlined 동작 버튼 글자는 상태 색이다', async () => {
    await render(<ZSBanner message="m" status="error" variant="outlined" action={{ label: '보기', onPress: jest.fn() }} />);
    expect(StyleSheet.flatten(screen.getByText('보기').props.style).color).toBe(colors.error);
  });

  it('onClose 가 없으면 닫기 버튼이 없다', async () => {
    await render(<ZSBanner message="안내" />);
    expect(screen.queryByTestId('zs-banner-close')).toBeNull();
  });

  it('닫기 터치 영역은 44 — 세로 가운데를 첫 줄 가운데에 두고, X(20) 칸이 내용선에 오게 끝으로 민다', async () => {
    const closeStyle = () => StyleSheet.flatten(screen.getByTestId('zs-banner-close').props.style);
    await render(<ZSBanner title="인증 필요" message="30일마다 인증해요" onClose={jest.fn()} />);
    expect(closeStyle()).toMatchObject({ width: 44, height: 44, marginVertical: (22 - 44) / 2, marginEnd: -12 });
    await fireEvent(screen.getByText('인증 필요'), 'textLayout', { nativeEvent: { lines: [{ height: 40 }] } });
    expect(closeStyle()).toMatchObject({ marginVertical: -2, marginEnd: -12 });
  });

  it('비제어: 닫기를 누르면 사라지고 onClose 를 호출한다', async () => {
    const onClose = jest.fn();
    await render(<ZSBanner message="안내" onClose={onClose} />);
    expect(screen.getByTestId('zs-banner-close').props.accessibilityLabel).toBe('Close message');
    await fireEvent.press(screen.getByTestId('zs-banner-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('안내')).toBeNull();
  });

  it('ThemeProvider accessibilityLabels.closeMessage 를 라벨로 쓰고, closeAccessibilityLabel 이 있으면 그것이 우선한다', async () => {
    setTestTheme({ accessibilityLabels: { closeMessage: '메시지 닫기' } });
    await render(<ZSBanner message="안내" onClose={jest.fn()} />);
    expect(screen.getByTestId('zs-banner-close').props.accessibilityLabel).toBe('메시지 닫기');
    await render(<ZSBanner message="안내" onClose={jest.fn()} closeAccessibilityLabel="안내 닫기" />);
    expect(screen.getByTestId('zs-banner-close').props.accessibilityLabel).toBe('안내 닫기');
    setTestTheme();
  });

  it('제어: visible 이면 닫기를 눌러도 남고, false 면 그리지 않는다', async () => {
    const onClose = jest.fn();
    await render(<ZSBanner message="안내" visible onClose={onClose} testID="bar" />);
    await fireEvent.press(screen.getByTestId('bar-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByText('안내')).toBeTruthy();
    await screen.rerender(<ZSBanner message="안내" visible={false} onClose={onClose} testID="bar" />);
    expect(screen.queryByText('안내')).toBeNull();
  });

  it('비제어: defaultVisible=false 면 숨긴 채 시작하고, visible 로 열 수 있다', async () => {
    await render(<ZSBanner message="안내" defaultVisible={false} onClose={jest.fn()} />);
    expect(screen.queryByText('안내')).toBeNull();
    await screen.rerender(<ZSBanner message="안내" defaultVisible={false} visible onClose={jest.fn()} />);
    expect(screen.getByText('안내')).toBeTruthy();
    await screen.rerender(<ZSBanner message="안내" defaultVisible={false} onClose={jest.fn()} />);
    expect(screen.getByText('안내')).toBeTruthy();
  });

  it('닫은 뒤 visible 이 true 로 바뀌면 다시 보인다', async () => {
    await render(<ZSBanner message="안내" onClose={jest.fn()} />);
    await fireEvent.press(screen.getByTestId('zs-banner-close'));
    expect(screen.queryByText('안내')).toBeNull();
    await screen.rerender(<ZSBanner message="안내" visible onClose={jest.fn()} />);
    await screen.rerender(<ZSBanner message="안내" onClose={jest.fn()} />);
    expect(screen.getByText('안내')).toBeTruthy();
  });

  it('fullWidth=false 면 내용 폭에 맞춘다', async () => {
    await render(<ZSBanner message="좁게" fullWidth={false} style={{ margin: 4 }} />);
    expect(barStyle().margin).toBe(4);
    const wrapper = queryAllByHostType('View').find((node) => StyleSheet.flatten(node.props.style)?.alignSelf === 'flex-start');
    expect(wrapper).toBeTruthy();
  });
});
