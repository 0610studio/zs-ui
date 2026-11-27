import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Platform, Text } from 'react-native';
import ZSMenu, { type ZSMenuItem } from '../../ui/ZSMenu';
import ZSMenuAndroid from '../../ui/ZSMenu/index.android';
import ZSButton from '../../ui/ZSButton';
import ZSPressable from '../../ui/ZSPressable';
import { getTestTheme, setTestTheme } from '../utils/theme';
import { createComposeColors } from '../../native/composeColors';
import { getByHostType, nth, queryAllByHostType } from '../utils/hostQueries';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

const platform = Platform as { OS: string };

const ITEMS: ZSMenuItem[] = [
  { key: 'edit', label: '편집', icon: { sf: 'pencil', android: { uri: 'file:///edit.png' } } },
  { key: 'pin', label: '고정', checked: true },
  { key: 'mute', label: '알림 끄기', checked: false, disabled: true },
  { key: 'delete', label: '삭제', destructive: true },
];

describe('ZSMenu — iOS UIMenu', () => {
  afterEach(() => setTestTheme());

  const menu = () => getByHostType('MenuView');

  it('항목을 네이티브 메뉴 동작(SF Symbol·체크·파괴·비활성)으로 바꾼다', async () => {
    const { colors } = getTestTheme();
    await render(
      <ZSMenu items={ITEMS} onSelect={jest.fn()} title="더보기" testID="menu" style={{ margin: 1 }}>
        <Text>열기</Text>
      </ZSMenu>,
    );
    expect(menu().props).toMatchObject({ title: '더보기', colorScheme: 'light', shouldOpenOnLongPress: false, testID: 'menu', style: { margin: 1 } });
    expect(menu().props.actions).toEqual([
      { id: 'edit', title: '편집', image: 'pencil', imageColor: undefined, state: undefined, attributes: { destructive: undefined, disabled: undefined } },
      { id: 'pin', title: '고정', image: undefined, imageColor: undefined, state: 'on', attributes: { destructive: undefined, disabled: undefined } },
      { id: 'mute', title: '알림 끄기', image: undefined, imageColor: undefined, state: 'off', attributes: { destructive: undefined, disabled: true } },
      { id: 'delete', title: '삭제', image: undefined, imageColor: colors.error, state: undefined, attributes: { destructive: true, disabled: undefined } },
    ]);
    expect(screen.getByText('열기')).toBeTruthy();
  });

  it('고른 동작의 key 로 onSelect 를 호출한다', async () => {
    const onSelect = jest.fn();
    await render(
      <ZSMenu items={ITEMS} onSelect={onSelect}>
        <Text>열기</Text>
      </ZSMenu>,
    );
    await act(() => menu().props.onPressAction({ nativeEvent: { event: 'delete' } }));
    expect(onSelect).toHaveBeenCalledWith('delete');
  });

  it('onPress 없는 ZSButton 도 트리거로 그대로 감싼다 — 누름은 시스템 메뉴가 받는다', async () => {
    await render(
      <ZSMenu items={ITEMS} onSelect={jest.fn()}>
        <ZSButton title="더보기" />
      </ZSMenu>,
    );
    expect(queryAllByHostType('Pressable', menu())).toHaveLength(1);
    expect(screen.getByText('더보기')).toBeTruthy();
  });

  it('길게 눌러 열기·다크 모드를 넘긴다', async () => {
    setTestTheme({ mode: 'dark' });
    await render(
      <ZSMenu items={ITEMS} onSelect={jest.fn()} openOnLongPress>
        <Text>열기</Text>
      </ZSMenu>,
    );
    expect(menu().props).toMatchObject({ shouldOpenOnLongPress: true, colorScheme: 'dark' });
  });
});

describe('ZSMenu — Android M3 DropdownMenu', () => {
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
  // 화면 순서대로 — 일반 항목(DropdownMenuItem)과 고르는 항목(SelectableDropdownMenuItem)을 함께
  const items = () => queryAllByHostType('DropdownMenuItem').concat(queryAllByHostType('SelectableDropdownMenuItem'))
    .sort((a, b) => ITEMS.findIndex((item) => item.label === labelOf(a)) - ITEMS.findIndex((item) => item.label === labelOf(b)));
  const labelOf = (node: ReturnType<typeof getByHostType>) => getByHostType('Text', node).props.children;

  it('트리거를 RNHostView 로 감싸고 메뉴는 닫힌 채 시작한다(clipping 끔)', async () => {
    await render(
      <ZSMenuAndroid items={ITEMS} onSelect={jest.fn()} testID="menu" style={{ margin: 1 }}>
        <Text>열기</Text>
      </ZSMenuAndroid>,
    );
    expect(screen.getByTestId('menu').props.style).toEqual({ margin: 1 });
    expect(dropdown().props).toMatchObject({ expanded: false, properties: { clippingEnabled: false } });
    expect(getByHostType('RNHostView').props.matchContents).toBe(true);
    expect(getByHostType('DropdownMenu.Trigger')).toBeTruthy();
  });

  it('일반 트리거는 눌러서 열고, 항목을 고르면 닫고 key 를 알린다', async () => {
    const onSelect = jest.fn();
    await render(
      <ZSMenuAndroid items={ITEMS} onSelect={onSelect}>
        <Text>열기</Text>
      </ZSMenuAndroid>,
    );
    await fireEvent.press(screen.getByText('열기'));
    expect(dropdown().props.expanded).toBe(true);
    await act(() => nth(items(), 0).props.onClick());
    expect(onSelect).toHaveBeenCalledWith('edit');
    expect(dropdown().props.expanded).toBe(false);
  });

  it('트리거 누름은 300ms 쓰로틀 — 트리거 자신의 onPress 와 메뉴 열기를 함께 한 번만 하고, 지나면 다시 연다', async () => {
    const onPress = jest.fn();
    await render(
      <ZSMenuAndroid items={ITEMS} onSelect={jest.fn()}>
        <Text onPress={onPress}>열기</Text>
      </ZSMenuAndroid>,
    );
    await fireEvent.press(screen.getByText('열기'));
    await act(() => dropdown().props.onDismissRequest());
    now += 299;
    await fireEvent.press(screen.getByText('열기'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(dropdown().props.expanded).toBe(false);
    now += 1;
    await fireEvent.press(screen.getByText('열기'));
    expect(onPress).toHaveBeenCalledTimes(2);
    expect(dropdown().props.expanded).toBe(true);
  });

  it('openOnLongPress 면 길게 눌러 연다', async () => {
    await render(
      <ZSMenuAndroid items={ITEMS} onSelect={jest.fn()} openOnLongPress>
        <Text>열기</Text>
      </ZSMenuAndroid>,
    );
    const trigger = getByHostType('Pressable');
    expect(trigger.props.onPress).toBeUndefined();
    await fireEvent(trigger, 'longPress');
    expect(dropdown().props.expanded).toBe(true);
  });

  it('누를 수 있는 트리거(ZSButton)는 그 누름에 메뉴 열기를 잇는다', async () => {
    const onPress = jest.fn();
    await render(
      <ZSMenuAndroid items={ITEMS} onSelect={jest.fn()}>
        <ZSButton title="더보기" onPress={onPress} />
      </ZSMenuAndroid>,
    );
    expect(queryAllByHostType('Pressable')).toHaveLength(1);
    await fireEvent.press(screen.getByText('더보기'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(dropdown().props.expanded).toBe(true);
  });

  it('onPress 없는 ZSButton 트리거도 그 버튼이 연다 — 바깥 Pressable 을 두지 않는다', async () => {
    await render(
      <ZSMenuAndroid items={ITEMS} onSelect={jest.fn()}>
        <ZSButton title="더보기" />
      </ZSMenuAndroid>,
    );
    const button = getByHostType('Pressable');
    expect(button.props.accessibilityLabel).toBe('더보기');
    expect(button.props.onPress).toEqual(expect.any(Function));
    await fireEvent.press(screen.getByText('더보기'));
    expect(dropdown().props.expanded).toBe(true);
  });

  it('onPress 없는 ZSButton 도 openOnLongPress 면 길게 눌러 연다', async () => {
    await render(
      <ZSMenuAndroid items={ITEMS} onSelect={jest.fn()} openOnLongPress>
        <ZSButton title="더보기" />
      </ZSMenuAndroid>,
    );
    const button = getByHostType('Pressable');
    expect(button.props.onPress).toBeUndefined();
    await fireEvent(button, 'longPress');
    expect(dropdown().props.expanded).toBe(true);
  });

  it('onPress 없는 ZSPressable 트리거도 그 누름 영역이 연다', async () => {
    await render(
      <ZSMenuAndroid items={ITEMS} onSelect={jest.fn()}>
        <ZSPressable accessibilityLabel="더보기">
          <Text>⋯</Text>
        </ZSPressable>
      </ZSMenuAndroid>,
    );
    expect(getByHostType('Pressable').props.accessibilityLabel).toBe('더보기');
    await fireEvent.press(screen.getByText('⋯'));
    expect(dropdown().props.expanded).toBe(true);
  });

  it('ZSButton 트리거도 openOnLongPress 면 길게 눌러 연다', async () => {
    const onLongPress = jest.fn();
    await render(
      <ZSMenuAndroid items={ITEMS} onSelect={jest.fn()} openOnLongPress>
        <ZSButton title="더보기" onPress={jest.fn()} onLongPress={onLongPress} />
      </ZSMenuAndroid>,
    );
    const button = getByHostType('Pressable');
    expect(button.props.onLongPress).toEqual(expect.any(Function));
    await fireEvent(button, 'longPress');
    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(dropdown().props.expanded).toBe(true);
  });

  it('누를 수 있는 트리거를 길게 눌러 열 수도 있다', async () => {
    const onLongPress = jest.fn();
    const Trigger = (_props: { onLongPress?: () => void }) => null;
    await render(
      <ZSMenuAndroid items={ITEMS} onSelect={jest.fn()} openOnLongPress>
        <Trigger onLongPress={onLongPress} />
      </ZSMenuAndroid>,
    );
    const { children } = getByHostType('RNHostView').props;
    await act(() => children.props.onLongPress());
    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(dropdown().props.expanded).toBe(true);
  });

  it('바깥을 누르면(onDismissRequest) 닫는다', async () => {
    await render(
      <ZSMenuAndroid items={ITEMS} onSelect={jest.fn()}>
        <Text>열기</Text>
      </ZSMenuAndroid>,
    );
    await fireEvent.press(screen.getByText('열기'));
    await act(() => dropdown().props.onDismissRequest());
    expect(dropdown().props.expanded).toBe(false);
  });

  it('항목 아이콘·파괴 색·비활성을 Compose 항목에 넘긴다 — checked 가 있는 항목만 M3 선택 항목이다', async () => {
    const { colors } = getTestTheme();
    await render(
      <ZSMenuAndroid items={ITEMS} onSelect={jest.fn()}>
        <Text>열기</Text>
      </ZSMenuAndroid>,
    );
    expect(items().map((item) => item.props.enabled)).toEqual([true, true, false, true]);
    expect(items().map((item) => item.type)).toEqual(['DropdownMenuItem', 'SelectableDropdownMenuItem', 'SelectableDropdownMenuItem', 'DropdownMenuItem']);
    const compose = createComposeColors(colors);
    expect(items()[3]?.props.elementColors).toEqual({ ...compose.menuItem, textColor: colors.error, leadingIconColor: colors.error });
    expect(items()[0]?.props.elementColors).toEqual(compose.menuItem);
    expect(getByHostType('DropdownMenu').props.color).toBe(colors.surface3);
    expect(getByHostType('Icon', nth(items(), 0)).props).toEqual({ source: { uri: 'file:///edit.png' }, size: 24 });
    expect(queryAllByHostType('DropdownMenuItem.LeadingIcon')).toHaveLength(1);
    expect(queryAllByHostType('DropdownMenuItem.TrailingIcon')).toHaveLength(0);
    expect(screen.queryByText('✓')).toBeNull();
    expect(screen.getByText('삭제')).toBeTruthy();
  });

  it('checked 항목은 selected 로 넘기고, 체크 아이콘은 선택 때만 보이는 앞 아이콘 자리에 둔다', async () => {
    const { colors } = getTestTheme();
    const compose = createComposeColors(colors);
    await render(
      <ZSMenuAndroid items={[{ key: 'pin', label: '고정', checked: true }, { key: 'mute', label: '알림 끄기', checked: false, disabled: true }]} onSelect={jest.fn()}>
        <Text>열기</Text>
      </ZSMenuAndroid>,
    );
    const selectable = queryAllByHostType('SelectableDropdownMenuItem');
    expect(selectable.map((item) => [item.props.selected, item.props.enabled])).toEqual([[true, true], [false, false]]);
    expect(selectable.map((item) => item.props.colors)).toEqual([compose.selectableMenuItem, compose.selectableMenuItem]);
    for (const item of selectable) {
      const check = getByHostType('Icon', getByHostType('SelectableDropdownMenuItem.SelectedLeadingIcon', item));
      expect(check.props).toEqual({ source: { uri: 'zs_ui_check' }, size: 20 });
    }
  });

  it('고르는 항목의 앞 아이콘은 LeadingIcon 자리 — 선택되면 체크가 그 자리를 대신한다', async () => {
    await render(
      <ZSMenuAndroid items={[{ key: 'grid', label: '격자', checked: true, icon: { android: { uri: 'file:///grid.png' } } }]} onSelect={jest.fn()}>
        <Text>열기</Text>
      </ZSMenuAndroid>,
    );
    const item = getByHostType('SelectableDropdownMenuItem');
    expect(getByHostType('Icon', getByHostType('SelectableDropdownMenuItem.LeadingIcon', item)).props.source).toEqual({ uri: 'file:///grid.png' });
  });

  it('고른 항목은 primary 면에 onPrimary 글자·체크다(선택된 ZSChip 과 같은 넓은 채움 강조)', async () => {
    const { colors } = getTestTheme();
    await render(
      <ZSMenuAndroid items={[{ key: 'pin', label: '고정', checked: true }]} onSelect={jest.fn()}>
        <Text>열기</Text>
      </ZSMenuAndroid>,
    );
    expect(getByHostType('SelectableDropdownMenuItem').props.colors).toMatchObject({
      containerColor: '#00000000',
      selectedContainerColor: colors.primary,
      selectedTextColor: colors.onPrimary,
      selectedLeadingIconColor: colors.onPrimary,
    });
  });

  it('고른 파괴 항목은 error 면에 onError 글자·체크, 고르지 않으면 error 글자다', async () => {
    const { colors } = getTestTheme();
    const compose = createComposeColors(colors);
    await render(
      <ZSMenuAndroid items={[{ key: 'block', label: '차단', checked: true, destructive: true }]} onSelect={jest.fn()}>
        <Text>열기</Text>
      </ZSMenuAndroid>,
    );
    expect(getByHostType('SelectableDropdownMenuItem').props.colors).toEqual({
      ...compose.selectableMenuItem,
      textColor: colors.error,
      leadingIconColor: colors.error,
      selectedContainerColor: colors.error,
      selectedTextColor: colors.onError,
      selectedLeadingIconColor: colors.onError,
    });
  });

  it('고르는 항목을 눌러도 닫고 key 를 알린다', async () => {
    const onSelect = jest.fn();
    await render(
      <ZSMenuAndroid items={ITEMS} onSelect={onSelect}>
        <Text>열기</Text>
      </ZSMenuAndroid>,
    );
    await fireEvent.press(screen.getByText('열기'));
    await act(() => nth(items(), 1).props.onClick());
    expect(onSelect).toHaveBeenCalledWith('pin');
    expect(dropdown().props.expanded).toBe(false);
  });
});
