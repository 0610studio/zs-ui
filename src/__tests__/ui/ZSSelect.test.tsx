import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Platform, StyleSheet } from 'react-native';
import ZSSelect, { type ZSSelectOption } from '../../ui/ZSSelect';
import ZSSelectAndroid from '../../ui/ZSSelect/index.android';
import type { MockModifier } from '../__mocks__/expo-ui-jetpack-compose-modifiers';
import { getByHostType, nth, queryAllByHostProps, queryAllByHostType } from '../utils/hostQueries';
import { CHEVRON_PATHS } from '../../assets/SvgChevron';
import { getTestTheme } from '../utils/theme';
import { RADIUS } from '../../theme/radius';
import { placeholderColor } from '../../ui/ZSTextField/placeholderColor';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

const platform = Platform as { OS: string };

const OPTIONS: ZSSelectOption[] = [
  { label: '서울', value: 'seoul' },
  { label: '부산', value: 'busan' },
];

const input = () => getByHostType('TextInput');
const chevron = (direction: 'up' | 'down') => queryAllByHostProps({ d: CHEVRON_PATHS[direction] });
const borderFrames = () => queryAllByHostType('View').filter((node) => StyleSheet.flatten(node.props.style)?.borderWidth === 1);

describe('ZSSelect — 칸은 ZSTextField 모양(두 플랫폼 공통)', () => {
  it('고른 라벨을 읽기 전용 ZSTextField 로 그리고, 칸은 터치·스크린 리더에서 뺀다', async () => {
    await render(<ZSSelect label="지역" options={OPTIONS} value="busan" />);
    expect(input().props).toMatchObject({ value: '부산', readOnly: true, editable: true });
    const hidden = input().parent!.parent!.parent!.parent!;
    expect(screen.getByText('지역', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByText('지역')).toBeNull();
    expect(hidden).toBeTruthy();
    expect(chevron('down')).toHaveLength(1);
  });

  it('선택 전이고 placeholder 가 있으면 라벨을 띄우고 칸 글자 자리에 placeholder 색으로 쓴다', async () => {
    const { colors } = getTestTheme();
    await render(<ZSSelect label="지역" options={OPTIONS} value={null} placeholder="고르세요" />);
    expect(input().props.value).toBe('고르세요');
    expect(StyleSheet.flatten(input().props.style).color).toBe(placeholderColor(colors.textSecondary, colors.background));
  });

  it('placeholder 가 없으면 빈 칸에 라벨만 둔다', async () => {
    await render(<ZSSelect label="지역" options={OPTIONS} value={null} />);
    expect(input().props.value).toBe('');
  });

  it('variant 를 칸에 넘긴다 — underline 은 테두리 상자 대신 아래 선', async () => {
    await render(<ZSSelect label="지역" options={OPTIONS} value="seoul" />);
    expect(borderFrames().length).toBeGreaterThan(0);
    await render(<ZSSelect label="지역" options={OPTIONS} value="seoul" variant="underline" />);
    expect(borderFrames()).toHaveLength(0);
  });

  it('비활성이면 칸도 비활성 모양이다', async () => {
    await render(<ZSSelect label="지역" options={OPTIONS} value="seoul" disabled />);
    expect(input().props.editable).toBe(false);
  });
});

describe('ZSSelect — iOS UIKit 메뉴(칸 위 투명 ZSSelectMenuView)', () => {
  const menu = () => getByHostType('ZSSelectMenuView');
  const choose = (index: number) => act(() => menu().props.onSelectOption({ nativeEvent: { index } }));

  it('칸은 제자리에 두고 그 위를 덮는 네이티브 메뉴 뷰가 연다 — 선택지 라벨·고른 위치·활성을 넘긴다', async () => {
    await render(<ZSSelect label="지역" options={OPTIONS} value="busan" testID="picker" />);
    expect(StyleSheet.flatten(menu().props.style)).toMatchObject({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 });
    expect(menu().props).toMatchObject({ testID: 'picker', options: ['서울', '부산'], selectedIndex: 1, enabled: true });
  });

  it('고르면 onValueChange 로 값과 위치를 알린다', async () => {
    const onValueChange = jest.fn();
    await render(<ZSSelect label="지역" options={OPTIONS} value="busan" onValueChange={onValueChange} />);
    await choose(0);
    expect(onValueChange).toHaveBeenCalledWith('seoul', 0);
  });

  it('메뉴 버튼이 이름·값·힌트를 읽는다', async () => {
    await render(<ZSSelect label="지역" options={OPTIONS} value="busan" accessibilityLabel="사는 곳" accessibilityHint="주소에 씁니다" />);
    expect(menu().props.menuAccessibility).toEqual({ label: '사는 곳', value: '부산', hint: '주소에 씁니다' });
    await render(<ZSSelect label="지역" options={OPTIONS} value={null} />);
    expect(menu().props.menuAccessibility).toEqual({ label: '지역', value: undefined, hint: undefined });
  });

  describe('선택 전(null)', () => {
    it('고른 위치 -1 과 placeholder 를 넘긴다 — 네이티브 메뉴가 맨 위 선택 전 자리를 체크해 둔다', async () => {
      await render(<ZSSelect label="지역" options={OPTIONS} value={null} placeholder="고르세요" />);
      expect(menu().props).toMatchObject({ selectedIndex: -1, placeholder: '고르세요' });
    });

    it('options 에 없는 값도 선택 전이고, 범위 밖 위치는 onValueChange 로 나가지 않는다', async () => {
      const onValueChange = jest.fn();
      await render(<ZSSelect label="지역" options={OPTIONS} value="nowhere" onValueChange={onValueChange} />);
      expect(menu().props.selectedIndex).toBe(-1);
      await choose(-1);
      await choose(5);
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('제어: 부모가 값을 바꾸지 않으면 선택 전 그대로다', async () => {
      await render(<ZSSelect label="지역" options={OPTIONS} value={null} onValueChange={jest.fn()} />);
      await choose(1);
      expect(menu().props.selectedIndex).toBe(-1);
    });
  });

  it('비제어: 선택 전에서 시작해 고른 값을 기억하고, defaultValue 에서도 시작한다', async () => {
    await render(<ZSSelect label="지역" options={OPTIONS} />);
    await choose(1);
    expect(menu().props.selectedIndex).toBe(1);
    expect(input().props.value).toBe('부산');
    await render(<ZSSelect label="지역" options={OPTIONS} defaultValue="busan" />);
    expect(menu().props.selectedIndex).toBe(1);
  });

  it('숫자 value 도 쓴다', async () => {
    const onValueChange = jest.fn();
    await render(<ZSSelect<number> label="크기" options={[{ label: '작게', value: 12 }, { label: '크게', value: 20 }]} value={20} onValueChange={onValueChange} />);
    await choose(0);
    expect(onValueChange).toHaveBeenCalledWith(12, 0);
  });

  it('비활성이면 메뉴를 끄고(enabled false), 늦게 온 선택도 무시한다', async () => {
    const onValueChange = jest.fn();
    await render(<ZSSelect label="지역" options={OPTIONS} value="seoul" onValueChange={onValueChange} disabled />);
    expect(menu().props.enabled).toBe(false);
    await choose(1);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe('ZSSelect — Android Compose 메뉴', () => {
  let now = 0;

  beforeEach(() => {
    platform.OS = 'android';
    now = 1_000_000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
  });
  afterEach(() => {
    platform.OS = 'ios';
    jest.restoreAllMocks();
  });

  const dropdown = () => getByHostType('DropdownMenu');
  const trigger = () => getByHostType('Pressable');
  const items = () => queryAllByHostType('DropdownMenuItem');
  const open = () => fireEvent.press(trigger());

  it('칸을 RNHostView(가로 채움) 안 Pressable 로 감싸고, 메뉴는 닫힌 채 칸과 같은 모서리·표면색이다', async () => {
    const { colors } = getTestTheme();
    await render(<ZSSelectAndroid label="지역" options={OPTIONS} value="busan" testID="picker" />);
    expect(dropdown().props).toMatchObject({ expanded: false, cornerRadius: RADIUS.lg, color: colors.surface3 });
    expect((dropdown().props.modifiers as MockModifier[]).map((modifier) => modifier.$type)).toEqual(['fillMaxWidth']);
    expect(getByHostType('RNHostView').props.matchContents).toEqual({ vertical: true });
    expect(trigger().props).toMatchObject({
      testID: 'picker',
      accessibilityRole: 'combobox',
      accessibilityLabel: '지역',
      accessibilityValue: { text: '부산' },
      accessibilityState: { disabled: false, expanded: false },
    });
  });

  it('누르면 열리고 칸이 포커스처럼 보이며(화살표 위), 고른 항목에 체크를 단다', async () => {
    await render(<ZSSelectAndroid label="지역" options={OPTIONS} value="busan" />);
    await act(open);
    expect(dropdown().props.expanded).toBe(true);
    expect(trigger().props.accessibilityState).toEqual({ disabled: false, expanded: true });
    expect(chevron('up')).toHaveLength(1);
    expect(chevron('down')).toHaveLength(0);
    expect(items()).toHaveLength(2);
    expect(queryAllByHostType('DropdownMenuItem.TrailingIcon', nth(items(), 1))).toHaveLength(1);
    expect(queryAllByHostType('DropdownMenuItem.TrailingIcon', nth(items(), 0))).toHaveLength(0);
  });

  it('항목을 누르면 onValueChange 후 닫고, 바깥을 누르면(onDismissRequest) 닫는다', async () => {
    const onValueChange = jest.fn();
    await render(<ZSSelectAndroid label="지역" options={OPTIONS} value="busan" onValueChange={onValueChange} />);
    await act(open);
    await act(() => nth(items(), 0).props.onClick());
    expect(onValueChange).toHaveBeenCalledWith('seoul', 0);
    expect(dropdown().props.expanded).toBe(false);
    now += 300;
    await act(open);
    await act(() => dropdown().props.onDismissRequest());
    expect(dropdown().props.expanded).toBe(false);
  });

  it('칸 누름은 300ms 쓰로틀 — 닫은 직후 연타로는 다시 열리지 않고, 300ms 가 지나면 열린다', async () => {
    await render(<ZSSelectAndroid label="지역" options={OPTIONS} value="busan" />);
    await act(open);
    await act(() => dropdown().props.onDismissRequest());
    now += 299;
    await act(open);
    expect(dropdown().props.expanded).toBe(false);
    now += 1;
    await act(open);
    expect(dropdown().props.expanded).toBe(true);
  });

  it('칸 폭을 재면 메뉴 항목 폭을 칸 폭에 맞춘다', async () => {
    await render(<ZSSelectAndroid label="지역" options={OPTIONS} value="busan" />);
    expect(nth(items(), 0).props.modifiers).toBeUndefined();
    await act(() => fireEvent(trigger(), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 320.4, height: 56 } } }));
    expect(nth(items(), 0).props.modifiers).toEqual([{ $type: 'width', args: [320] }]);
  });

  it('menuColor 는 색 역할 이름이나 직접 지정한 색을 메뉴 면에 쓴다', async () => {
    const { colors } = getTestTheme();
    await render(<ZSSelectAndroid label="지역" options={OPTIONS} menuColor="primaryContainer" />);
    expect(dropdown().props.color).toBe(colors.primaryContainer);
    await render(<ZSSelectAndroid label="지역" options={OPTIONS} menuColor="#E8F3EF" />);
    expect(dropdown().props.color).toBe('#E8F3EF');
  });

  it('outlined 칸은 떠오른 라벨이 Compose 호스트에 잘리지 않게 위를 라벨 반 높이만큼 비운다 — 다른 variant 는 비우지 않는다', async () => {
    const reserved = () => queryAllByHostType('View').filter((node) => node.props.accessibilityElementsHidden === true && StyleSheet.flatten(node.props.style)?.paddingTop > 0);
    await render(<ZSSelectAndroid label="지역" options={OPTIONS} />);
    expect(reserved()).toHaveLength(1);
    await render(<ZSSelectAndroid label="지역" options={OPTIONS} variant="inbox" />);
    expect(reserved()).toHaveLength(0);
  });

  it('비활성이면 열리지 않고, 열린 채 비활성이 되면 닫힌다', async () => {
    const field = (disabled: boolean) => <ZSSelectAndroid label="지역" options={OPTIONS} value="busan" disabled={disabled} />;
    await render(field(false));
    await act(open);
    await screen.rerender(field(true));
    expect(dropdown().props.expanded).toBe(false);
    expect(trigger().props.disabled).toBe(true);
    await screen.rerender(field(false));
    expect(dropdown().props.expanded).toBe(false);
  });
});
