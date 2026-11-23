import React from 'react';

const fonts = {
  regular: { fontFamily: 'System', fontWeight: '400' },
  medium: { fontFamily: 'System', fontWeight: '500' },
  bold: { fontFamily: 'System', fontWeight: '600' },
  heavy: { fontFamily: 'System', fontWeight: '700' },
} as const;

export const DefaultTheme = {
  dark: false,
  colors: { primary: 'rgb(0, 122, 255)', background: 'rgb(242, 242, 242)', card: 'rgb(255, 255, 255)', text: 'rgb(28, 28, 30)', border: 'rgb(216, 216, 216)', notification: 'rgb(255, 59, 48)' },
  fonts,
};

export const DarkTheme = {
  dark: true,
  colors: { primary: 'rgb(10, 132, 255)', background: 'rgb(1, 1, 1)', card: 'rgb(18, 18, 18)', text: 'rgb(229, 229, 231)', border: 'rgb(39, 39, 41)', notification: 'rgb(255, 69, 58)' },
  fonts,
};

export const TabRouter = () => ({});
export const unstable_useReconcileTabHistory = jest.fn();
export const createdNavigators: { content: unknown; router: unknown; options?: unknown }[] = [];
export function createStandardRouterNavigator(content: unknown, router: unknown, options?: unknown) {
  const Screen = (props: any) => React.createElement('Navigator.Screen', props);
  const Navigator = (props: any) => React.createElement('Navigator', props, props.children);
  const navigator = Object.assign(Navigator, { Screen, content, router, options });
  createdNavigators.push(navigator);
  return navigator;
}

export const mockGoBack = jest.fn();
export const useNavigation = () => ({ goBack: mockGoBack });
// 화면 포커스 = 마운트로 본다
export const useFocusEffect = (effect: React.EffectCallback) => {
  React.useEffect(effect, [effect]);
};
