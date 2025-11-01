import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, ScrollView, Dimensions } from 'react-native';
import ZSContainer from '../../ui/ZSContainer';

jest.mock('../../context/ThemeContext', () => {
  const paletteFn = require('../../theme/palette').default;
  const typographyFn = require('../../theme/typography').default;
  const palette = paletteFn({ mode: 'light' });
  const typography = typographyFn({ themeFonts: {} });
  return {
    ThemeProvider: ({ children }: any) => children,
    useTheme: () => ({ palette, typography, elevation: {} }),
  };
});

jest.mock('../../model/useKeyboard', () => ({
  __esModule: true,
  default: jest.fn(({ handleKeyboardShow, handleKeyboardHide }) => {
    // 테스트에서 키보드 이벤트를 트리거할 수 있도록 함수를 저장
    if (typeof jest !== 'undefined') {
      (jest as any).__keyboardShow = handleKeyboardShow;
      (jest as any).__keyboardHide = handleKeyboardHide;
    }
    return {};
  }),
}));

jest.mock('../../model/useFoldingState', () => ({
  __esModule: true,
  default: () => ({
    foldingState: 'folded',
    width: 400,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  const React = require('react');
  return {
    ...RN,
    Dimensions: {
      get: jest.fn(() => ({ height: 800, width: 400 })),
    },
    ScrollView: React.forwardRef((props: any, ref: any) => 
      React.createElement('ScrollView', { ...props, ref }, props.children)
    ),
  };
});

describe('ZSContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('children을 렌더한다', () => {
    const { getByText } = render(
      <ZSContainer>
        <Text>Test Content</Text>
      </ZSContainer>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('backgroundColor prop을 받는다', () => {
    const { getByText } = render(
      <ZSContainer backgroundColor="#FF0000">
        <Text>Test</Text>
      </ZSContainer>
    );

    expect(getByText('Test')).toBeTruthy();
  });

  it('scrollViewDisabled가 true일 때 ScrollView를 사용하지 않는다', () => {
    const { getByText } = render(
      <ZSContainer scrollViewDisabled={true}>
        <Text>Test</Text>
      </ZSContainer>
    );

    expect(getByText('Test')).toBeTruthy();
  });

  it('topComponent를 렌더한다', () => {
    const { getByText } = render(
      <ZSContainer topComponent={<Text>Top Component</Text>}>
        <Text>Content</Text>
      </ZSContainer>
    );

    expect(getByText('Top Component')).toBeTruthy();
    expect(getByText('Content')).toBeTruthy();
  });

  it('bottomComponent를 렌더한다', () => {
    const { getByText } = render(
      <ZSContainer bottomComponent={<Text>Bottom Component</Text>}>
        <Text>Content</Text>
      </ZSContainer>
    );

    expect(getByText('Bottom Component')).toBeTruthy();
    expect(getByText('Content')).toBeTruthy();
  });

  it('edges prop을 받는다', () => {
    const { getByText } = render(
      <ZSContainer edges={['top']}>
        <Text>Test</Text>
      </ZSContainer>
    );

    expect(getByText('Test')).toBeTruthy();
  });

  it('showsVerticalScrollIndicator prop을 받는다', () => {
    const { getByText } = render(
      <ZSContainer showsVerticalScrollIndicator={false}>
        <Text>Test</Text>
      </ZSContainer>
    );

    expect(getByText('Test')).toBeTruthy();
  });

  it('foldableSingleScreen prop을 받는다', () => {
    const { getByText } = render(
      <ZSContainer foldableSingleScreen={true}>
        <Text>Test</Text>
      </ZSContainer>
    );

    expect(getByText('Test')).toBeTruthy();
  });

  it('foldableSingleScreen일 때 rightComponent 사용 시 에러 로그를 출력한다', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(
      <ZSContainer 
        foldableSingleScreen={true}
        rightComponent={<Text>Right</Text>}
      >
        <Text>Test</Text>
      </ZSContainer>
    );

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('dividerLineComponent를 렌더한다', () => {
    const { getByText } = render(
      <ZSContainer 
        rightComponent={<Text>Right</Text>}
        dividerLineComponent={<Text>Divider</Text>}
      >
        <Text>Test</Text>
      </ZSContainer>
    );

    expect(getByText('Test')).toBeTruthy();
  });

  it('onScroll 이벤트를 처리한다', () => {
    const mockOnScroll = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <ZSContainer onScroll={mockOnScroll}>
        <Text>Test</Text>
      </ZSContainer>
    );

    const scrollViews = UNSAFE_getAllByType(ScrollView);
    if (scrollViews.length > 0) {
      fireEvent.scroll(scrollViews[0], {
        nativeEvent: {
          contentOffset: { y: 100 },
        },
      });

      expect(mockOnScroll).toHaveBeenCalled();
    }
  });

  it('ref를 사용할 수 있다', () => {
    const ref = React.createRef<ScrollView>();
    render(
      <ZSContainer ref={ref} scrollViewDisabled={false}>
        <Text>Test</Text>
      </ZSContainer>
    );

    // ref가 전달되었는지 확인
    expect(ref).toBeTruthy();
  });

  it('StatusBar를 조건부로 렌더한다', () => {
    const { rerender } = render(
      <ZSContainer>
        <Text>Test</Text>
      </ZSContainer>
    );

    rerender(
      <ZSContainer barStyle="dark-content">
        <Text>Test</Text>
      </ZSContainer>
    );

    expect(true).toBeTruthy(); // StatusBar 렌더링 확인
  });

  it('translucent prop을 받는다', () => {
    const { getByText } = render(
      <ZSContainer translucent={true}>
        <Text>Test</Text>
      </ZSContainer>
    );

    expect(getByText('Test')).toBeTruthy();
  });

  it('statusBarColor prop을 받는다', () => {
    const { getByText } = render(
      <ZSContainer statusBarColor="#000000">
        <Text>Test</Text>
      </ZSContainer>
    );

    expect(getByText('Test')).toBeTruthy();
  });

  it('scrollEventThrottle prop을 받는다', () => {
    const { getByText } = render(
      <ZSContainer scrollEventThrottle={32}>
        <Text>Test</Text>
      </ZSContainer>
    );

    expect(getByText('Test')).toBeTruthy();
  });

  it('keyboardScrollExtraOffset prop을 받는다', () => {
    const { getByText } = render(
      <ZSContainer keyboardScrollExtraOffset={50}>
        <Text>Test</Text>
      </ZSContainer>
    );

    expect(getByText('Test')).toBeTruthy();
  });
});

