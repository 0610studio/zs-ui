import React from 'react';
import { act, render } from '@testing-library/react-native';
import * as Reanimated from 'react-native-reanimated';
import { Text } from 'react-native';
import Modality from '../../overlay/Modality';

jest.mock('../../context/ThemeContext', () => {
  const paletteFn = require('../../theme/palette').default;
  const typographyFn = require('../../theme/typography').default;
  const palette = paletteFn({ mode: 'light' });
  const typography = typographyFn({ themeFonts: {} });
  return {
    ThemeProvider: ({ children }: any) => children,
    useTheme: () => ({ palette, typography }),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34 }),
  initialWindowMetrics: { insets: { top: 44, bottom: 34 } },
}));

jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn(() => ({ width: 390, height: 844 })),
}));

jest.mock('react-native/Libraries/Components/StatusBar/StatusBar', () => ({
  setBackgroundColor: jest.fn(),
}));

jest.mock('../../ui/ZSView', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}));

jest.mock('../../model/useOverlay', () => ({
  useModality: jest.fn(() => ({ modalityVisible: false })),
}));

describe('Modality', () => {
  it('modalityVisible이 false일 때 렌더되지 않는다', () => {
    const { queryByText } = render(
      <Modality 
        foldableSingleScreen={false} 
        modalityComponent={<Text>Test Content</Text>} 
      />
    );
    
    expect(queryByText('Test Content')).toBeNull();
  });

  it('modalityVisible이 true일 때 컴포넌트가 렌더된다', () => {
    const { useModality } = require('../../model/useOverlay');
    jest.mocked(useModality).mockReturnValue({
      modalityVisible: true,
    });

    const { getByText } = render(
      <Modality 
        foldableSingleScreen={false} 
        modalityComponent={<Text>Test Content</Text>} 
      />
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('백그라운드에서 돌아오면 열린 모달의 값을 열림 값으로 다시 넣는다', () => {
    const { AppState } = require('react-native');
    const { useModality } = require('../../model/useOverlay');
    jest.mocked(useModality).mockReturnValue({
      modalityVisible: true,
    });
    const sharedValueSpy = jest.spyOn(Reanimated, 'useSharedValue');

    render(
      <Modality
        foldableSingleScreen={false}
        modalityComponent={<Text>Test Content</Text>}
      />
    );

    // useSharedValue 생성 순서: backScale → backTranslateY → backBorderRadius → mainTranslateY → backgroundOpacity
    const [backScale, backTranslateY, backBorderRadius, mainTranslateY, backgroundOpacity] =
      sharedValueSpy.mock.results.slice(0, 5).map((r) => r.value);
    // 백그라운드 왕복 뒤 화면에 남은 닫힌 값
    mainTranslateY.value = 844;
    backgroundOpacity.value = 0;

    act(() => {
      AppState.mockChange('background');
      AppState.mockChange('active');
    });

    expect(backScale.value).toBe(0.92);
    expect(backTranslateY.value).toBe(44);
    expect(backBorderRadius.value).toBe(12);
    expect(mainTranslateY.value).toBe(10 + 44);
    expect(backgroundOpacity.value).toBe(1);
  });

  it('foldableSingleScreen prop을 받는다', () => {
    const { useModality } = require('../../model/useOverlay');
    jest.mocked(useModality).mockReturnValue({
      modalityVisible: true,
    });

    const { getByText } = render(
      <Modality 
        foldableSingleScreen={true} 
        modalityComponent={<Text>Test Content</Text>} 
      />
    );

    expect(getByText('Test Content')).toBeTruthy();
  });
});
