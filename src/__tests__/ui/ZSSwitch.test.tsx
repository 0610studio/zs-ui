import { act, render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';
import ZSSwitch from '../../ui/ZSSwitch';
import { getByHostType, nth, queryAllByHostType } from '../utils/hostQueries';
import { getTestTheme } from '../utils/theme';
import { createComposeColors } from '../../native/composeColors';
import type { MockModifier } from '../__mocks__/expo-ui-jetpack-compose-modifiers';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

describe.each([
  ['ZSSwitch', ZSSwitch, 'Switch'],
] as const)('%s', (_name, Component, hostType) => {
  it('값·콜백·라벨·비활성을 네이티브 컨트롤에 넘긴다', async () => {
    const onValueChange = jest.fn();
    await render(<Component value label="알림" disabled testID="control" onValueChange={onValueChange} />);
    expect(getByHostType(hostType).props).toMatchObject({ value: true, label: '알림', disabled: true, testID: 'control' });
    await act(() => getByHostType(hostType).props.onValueChange(false));
    expect(onValueChange).toHaveBeenCalledWith(false);
  });

  it('라벨이 있으면 한 줄 행으로 폭을 채우고 높이만 콘텐츠에 맞춘다', async () => {
    await render(<Component value={false} label="행" style={{ marginTop: 2 }} onValueChange={jest.fn()} />);
    const host = getByHostType('Host');
    expect(host.props.matchContents).toEqual({ vertical: true });
    expect(host.props.style).toEqual([{ alignSelf: 'stretch' }, { marginTop: 2 }]);
  });

  it('라벨이 없으면 컨트롤 크기에 맞추고 기본은 활성이다', async () => {
    await render(<Component value={false} accessibilityLabel="알림" onValueChange={jest.fn()} />);
    expect(getByHostType('Host').props.matchContents).toBe(true);
    expect(getByHostType('Host').props.style).toEqual([null, undefined]);
    expect(getByHostType(hostType).props.disabled).toBe(false);
  });

  it('제어: value 를 바꾸지 않으면 눌러도 그대로다', async () => {
    const onValueChange = jest.fn();
    await render(<Component value={false} accessibilityLabel="알림" onValueChange={onValueChange} />);
    await act(() => getByHostType(hostType).props.onValueChange(true));
    expect(onValueChange).toHaveBeenCalledWith(true);
    expect(getByHostType(hostType).props.value).toBe(false);
  });

  it('비제어: value 없이 defaultValue 로 시작해 바뀐 값을 기억한다', async () => {
    const onValueChange = jest.fn();
    await render(<Component defaultValue accessibilityLabel="알림" onValueChange={onValueChange} />);
    expect(getByHostType(hostType).props.value).toBe(true);
    await act(() => getByHostType(hostType).props.onValueChange(false));
    expect(onValueChange).toHaveBeenCalledWith(false);
    expect(getByHostType(hostType).props.value).toBe(false);
  });

  it('비제어 기본값은 false 이고 콜백 없이도 바뀐다', async () => {
    await render(<Component accessibilityLabel="알림" />);
    expect(getByHostType(hostType).props.value).toBe(false);
    await act(() => getByHostType(hostType).props.onValueChange(true));
    expect(getByHostType(hostType).props.value).toBe(true);
  });

  describe('iOS SwiftUI 수식자', () => {
    const modifiers = () => getByHostType(hostType).props.modifiers as MockModifier[];
    const ROW = { $type: 'frame', args: [{ minHeight: 44 }] };
    const LABELS_HIDDEN = { $type: 'labelsHidden', args: [] };
    const TINT = { $type: 'tint', args: [getTestTheme().colors.primary] };

    it('라벨 행은 목록 행 높이 44 — 이름은 보이는 라벨이라 접근성 수식자를 달지 않는다', async () => {
      await render(<Component label="알림" />);
      expect(modifiers()).toEqual([ROW, TINT]);
    });

    it('contentInset 은 라벨 행 좌우 안쪽 여백이다 — 라벨 없는 스위치에는 두지 않는다', async () => {
      await render(<Component label="알림" contentInset={16} />);
      expect(modifiers()).toEqual([ROW, { $type: 'padding', args: [{ leading: 16, trailing: 16 }] }, TINT]);
      await render(<Component accessibilityLabel="알림" contentInset={16} />);
      expect(modifiers().some((modifier) => modifier.$type === 'padding')).toBe(false);
    });

    it('켜진 트랙은 채움 강조라 primary tint 로 고정한다 — Host tint(seedColor)에 맡기지 않는다', async () => {
      await render(<Component accessibilityLabel="Wi-Fi" />);
      expect(modifiers()).toContainEqual(TINT);
    });

    it('라벨이 없으면 빈 라벨 자리를 지워(labelsHidden) 스위치가 내용선에서 시작한다', async () => {
      await render(<Component accessibilityLabel="Wi-Fi" />);
      expect(nth(modifiers(), 0)).toEqual(LABELS_HIDDEN);
    });

    it('accessibilityLabel 이 라벨과 다를 때만 accessibilityLabel 수식자, 힌트는 accessibilityHint 수식자로 단다', async () => {
      await render(<Component label="알림" accessibilityLabel="푸시 알림" accessibilityHint="끄면 소리 없이 받습니다" />);
      expect(modifiers()).toEqual([
        ROW,
        TINT,
        { $type: 'accessibilityLabel', args: ['푸시 알림'] },
        { $type: 'accessibilityHint', args: ['끄면 소리 없이 받습니다'] },
      ]);
      await render(<Component label="알림" accessibilityLabel="알림" />);
      expect(modifiers()).toEqual([ROW, TINT]);
    });

    it('라벨이 없으면 accessibilityLabel 이 이름이다', async () => {
      await render(<Component accessibilityLabel="Wi-Fi" />);
      expect(modifiers()).toEqual([LABELS_HIDDEN, TINT, { $type: 'accessibilityLabel', args: ['Wi-Fi'] }]);
    });
  });
});

describe.each([
  ['ZSSwitch', ZSSwitch, 'ComposeSwitch', 'switch'],
] as const)('%s — Android Compose', (_name, Component, hostType, colorKey) => {
  const platform = Platform as { OS: string };
  const { colors } = getTestTheme();
  const compose = createComposeColors(colors);
  beforeEach(() => {
    platform.OS = 'android';
  });
  afterEach(() => {
    platform.OS = 'ios';
  });

  it('zs-ui 색을 넘기고 값이 바뀌면 콜백을 부른다 — 범용 컨트롤은 그리지 않는다', async () => {
    const onValueChange = jest.fn();
    await render(<Component value accessibilityLabel="알림" testID="control" onValueChange={onValueChange} />);
    const control = getByHostType(hostType);
    expect(control.props).toMatchObject({ value: true, enabled: true, colors: compose[colorKey] });
    expect(queryAllByHostType(hostType === 'ComposeSwitch' ? 'Switch' : 'Checkbox')).toHaveLength(0);
    await act(() => control.props.onCheckedChange(false));
    expect(onValueChange).toHaveBeenCalledWith(false);
  });

  it('비제어: defaultValue 로 시작해 Compose 컨트롤 값이 바뀐다', async () => {
    const onValueChange = jest.fn();
    await render(<Component defaultValue accessibilityLabel="알림" onValueChange={onValueChange} />);
    expect(getByHostType(hostType).props.value).toBe(true);
    await act(() => getByHostType(hostType).props.onCheckedChange(false));
    expect(onValueChange).toHaveBeenCalledWith(false);
    expect(getByHostType(hostType).props.value).toBe(false);
  });

  it('라벨은 같은 행의 Compose 글자이고, 비활성이면 컨트롤도 비활성이고 text 38% 로 그린다', async () => {
    await render(<Component value={false} label="알림" disabled onValueChange={jest.fn()} />);
    expect(getByHostType('Row')).toBeTruthy();
    expect(screen.getByText('알림').props.color).toBe(compose.disabledText);
    expect(getByHostType(hostType).props.enabled).toBe(false);
  });

  it('라벨 없는 컨트롤은 accessibilityLabel 을 semantics contentDescription 으로 단다 — 힌트는 Compose 경로에 없다', async () => {
    await render(<Component accessibilityLabel="알림" accessibilityHint="끄면 소리 없이 받습니다" testID="control" />);
    expect(getByHostType(hostType).props.modifiers).toEqual([
      { $type: 'semantics', args: [{ contentDescription: '알림' }] },
      { $type: 'testID', args: ['control'] },
    ]);
  });
});

describe('ZSSwitch — Android 이름', () => {
  const platform = Platform as { OS: string };
  beforeEach(() => {
    platform.OS = 'android';
  });
  afterEach(() => {
    platform.OS = 'ios';
  });

  const switchModifiers = () => getByHostType('ComposeSwitch').props.modifiers as MockModifier[];
  const rowModifier = (type: string) => (getByHostType('Row').props.modifiers as MockModifier[]).find((item) => item.$type === type);
  const pressRow = () => {
    const onToggle = rowModifier('toggleable')?.args[1];
    if (typeof onToggle !== 'function') throw new Error('라벨 행에 toggleable 이 없다');
    return act(() => {
      onToggle();
    });
  };

  it('라벨 행 전체가 스위치 하나다 — 행이 role switch 의 toggleable 이고, 안의 스위치는 자기 클릭·이름이 없다', async () => {
    await render(<ZSSwitch label="푸시 알림" testID="push" />);
    expect(getByHostType('ComposeSwitch').props).toMatchObject({ enabled: true, onCheckedChange: undefined });
    expect(switchModifiers()).toEqual([{ $type: 'testID', args: ['push'] }]);
    expect(screen.getByText('푸시 알림')).toBeTruthy();
    expect(getByHostType('Row').props.modifiers).toEqual([
      { $type: 'fillMaxWidth', args: [] },
      { $type: 'width', args: ['max'] },
      { $type: 'defaultMinSize', args: [{ minHeight: 56 }] },
      { $type: 'toggleable', args: [false, expect.any(Function), { role: 'switch', enabled: true }] },
    ]);
  });

  it('contentInset 은 toggleable 안쪽 여백이다 — 누름 효과(리플)가 여백까지 행 끝에서 끝으로 퍼진다', async () => {
    await render(<ZSSwitch label="푸시 알림" contentInset={16} />);
    const types = (getByHostType('Row').props.modifiers as MockModifier[]).map((item) => item.$type);
    expect(types.slice(-2)).toEqual(['toggleable', 'padding']);
    expect(rowModifier('padding')?.args).toEqual([16, 0, 16, 0]);
  });

  it('비제어: 라벨 행을 누를 때마다 값이 바뀌고 onValueChange 로 알린다', async () => {
    const onValueChange = jest.fn();
    await render(<ZSSwitch label="알림" onValueChange={onValueChange} />);
    await pressRow();
    expect(onValueChange).toHaveBeenLastCalledWith(true);
    expect(getByHostType('ComposeSwitch').props.value).toBe(true);
    expect(rowModifier('toggleable')?.args[0]).toBe(true);
  });

  it('행은 라벨 글자를 이름으로 읽고, 다른 accessibilityLabel 만 행 semantics 로 덮는다', async () => {
    await render(<ZSSwitch label="알림" accessibilityLabel="알림" />);
    expect(rowModifier('semantics')).toBeUndefined();
    await render(<ZSSwitch label="알림" accessibilityLabel="푸시 알림" />);
    expect(rowModifier('semantics')?.args).toEqual([{ contentDescription: '푸시 알림' }]);
    expect(switchModifiers()).toEqual([]);
  });

  it('비활성이면 행이 enabled false 의 toggleable 이고, 안의 스위치는 자기 클릭 없이 비활성으로 그린다', async () => {
    await render(<ZSSwitch label="알림" disabled onValueChange={jest.fn()} />);
    expect(rowModifier('toggleable')?.args[2]).toEqual({ role: 'switch', enabled: false });
    expect(getByHostType('ComposeSwitch').props).toMatchObject({ enabled: false, onCheckedChange: undefined });
  });

  it('라벨 없는 비활성 스위치는 빈 콜백으로 켬·끔과 비활성을 알리고 값은 그대로다', async () => {
    const onValueChange = jest.fn();
    await render(<ZSSwitch accessibilityLabel="알림" disabled onValueChange={onValueChange} />);
    expect(getByHostType('ComposeSwitch').props.enabled).toBe(false);
    await act(() => getByHostType('ComposeSwitch').props.onCheckedChange(true));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(getByHostType('ComposeSwitch').props.value).toBe(false);
  });
});
