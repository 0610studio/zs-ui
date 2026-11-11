import { render } from '@testing-library/react-native';
import { Platform, Text } from 'react-native';
import { NativeHost } from '../../native/NativeHost';
import { createMaterialColorScheme } from '../../native/composeColors';
import { setTestTheme } from '../utils/theme';
import { getByHostType } from '../utils/hostQueries';

jest.mock('../../context/ThemeContext', () => require('../utils/theme').mockThemeModule());

const platform = Platform as { OS: string };

describe('NativeHost', () => {
  afterEach(() => {
    platform.OS = 'ios';
    setTestTheme();
  });

  it('iOS 는 앱 색 모드와 먹(text)을 SwiftUI 기본 tint 로 넘기고 Compose 스킴은 넘기지 않는다 — 채움 컨트롤은 tint(primary) 를 직접 건다', async () => {
    const { colors } = setTestTheme({ mode: 'dark' });
    await render(
      <NativeHost matchContents style={{ margin: 4 }} testID="host" pointerEvents="box-none">
        <Text>child</Text>
      </NativeHost>,
    );
    expect(getByHostType('Host').props).toMatchObject({
      colorScheme: 'dark',
      seedColor: colors.text,
      matchContents: true,
      style: { margin: 4 },
      testID: 'host',
      pointerEvents: 'box-none',
    });
    expect(getByHostType('Host').props).not.toHaveProperty('colorOverrides');
  });

  it('iOS 는 앱 글자 확대 상한을 SwiftUI Dynamic Type 상한으로 건다 — 기본 2배는 AX2(body 33pt, 1.94배)까지', async () => {
    await render(
      <NativeHost>
        <Text>child</Text>
      </NativeHost>,
    );
    expect(getByHostType('Host').props.modifiers).toEqual([{ $type: 'dynamicTypeSize', args: [{ max: 'accessibility2' }] }]);
    setTestTheme({ maxFontSizeMultiplier: 1.3 });
    await render(
      <NativeHost>
        <Text>child</Text>
      </NativeHost>,
    );
    expect(getByHostType('Host').props.modifiers).toEqual([{ $type: 'dynamicTypeSize', args: [{ max: 'xxLarge' }] }]);
    setTestTheme({ maxFontSizeMultiplier: 0 });
    await render(
      <NativeHost>
        <Text>child</Text>
      </NativeHost>,
    );
    expect(getByHostType('Host').props.modifiers).toBeUndefined();
  });

  it('Android Compose 호스트에는 글자 배율 상한을 넘기지 않는다 — 바꾸는 방법이 없다', async () => {
    platform.OS = 'android';
    await render(
      <NativeHost>
        <Text>child</Text>
      </NativeHost>,
    );
    expect(getByHostType('Host').props.modifiers).toBeUndefined();
  });

  it('Android 는 브랜드 시드로 Compose M3 팔레트를 만든다 — 모드마다 바뀌는 primary 가 아니라 시드 원색', async () => {
    platform.OS = 'android';
    const { seedColor, colors } = setTestTheme({ mode: 'dark' });
    await render(
      <NativeHost matchContents={{ vertical: true }}>
        <Text>child</Text>
      </NativeHost>,
    );
    const host = getByHostType('Host');
    expect(host.props.colorScheme).toBe('dark');
    expect(host.props.seedColor).toBe(seedColor);
    expect(host.props.seedColor).not.toBe(colors.primary);
    expect(host.props.matchContents).toEqual({ vertical: true });
  });

  it('Android 는 그 스킴 위에 zs-ui 역할을 덮는다(colorOverrides) — 컨트롤이 색을 명시하지 않는 곳도 zs-ui 색', async () => {
    platform.OS = 'android';
    const { colors } = setTestTheme({ mode: 'dark' });
    await render(
      <NativeHost>
        <Text>child</Text>
      </NativeHost>,
    );
    const host = getByHostType('Host');
    expect(host.props.colorScheme).toBe('dark');
    expect(host.props.colorOverrides).toEqual(createMaterialColorScheme(colors, 'dark'));
    expect(host.props.colorOverrides.onSurface).toBe(colors.text);
  });
});
