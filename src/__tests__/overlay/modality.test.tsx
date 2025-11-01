import React from 'react';
import { render } from '@testing-library/react-native';
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
    
    // modalityVisible이 false면 null을 반환
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
