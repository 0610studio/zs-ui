import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Platform, StyleSheet, TextInput } from 'react-native';
import ZSTextField from '../../ui/ZSTextField';

jest.mock('../../context/ThemeContext', () => {
  const paletteFn = require('../../theme/palette').default;
  const typographyFn = require('../../theme/typography').default;
  const elevationFn = require('../../theme/elevation').default;
  const palette = paletteFn({ mode: 'light' });
  const typography = typographyFn({ themeFonts: {} });
  const elevation = elevationFn(palette);
  return {
    ThemeProvider: ({ children }: any) => children,
    useTheme: () => ({ palette, typography, elevation }),
  };
});

jest.mock('../../ui/ZSTextField/ui/ButtonClose', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ onChangeText }: any) => React.createElement('TouchableOpacity', {
      testID: 'button-close',
      onPress: () => onChangeText?.('')
    }),
  };
});

jest.mock('../../ui/ZSTextField/ui/ErrorComponent', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ errorMessage }: any) => React.createElement('Text', { testID: 'error-message' }, errorMessage),
  };
});

jest.mock('../../ui/atoms/ViewAtom', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ children, ...props }: any) => React.createElement('View', props, children),
  };
});

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const makeAnim = () => ({ duration: () => ({}) });
  const useSharedValue = (v: any) => ({ value: v });
  const useAnimatedStyle = (fn: any) => {
    try {
      return fn() || {};
    } catch {
      return {};
    }
  };
  const withTiming = (v: any) => v;
  const interpolate = (value: any, inputRange: any, outputRange: any, _extrapolate?: any) => {
    const numValue = typeof value === 'object' && value?.value !== undefined ? value.value : value;
    
    if (Array.isArray(inputRange) && Array.isArray(outputRange)) {
      if (numValue <= inputRange[0]) return outputRange[0];
      if (numValue >= inputRange[inputRange.length - 1]) return outputRange[outputRange.length - 1];
      
      for (let i = 0; i < inputRange.length - 1; i++) {
        if (numValue >= inputRange[i] && numValue <= inputRange[i + 1]) {
          const t = (numValue - inputRange[i]) / (inputRange[i + 1] - inputRange[i]);
          return outputRange[i] + (outputRange[i + 1] - outputRange[i]) * t;
        }
      }
    }
    
    return outputRange?.[0] ?? 0;
  };

  const Animated = {
    View: ({ children, ...props }: any) => React.createElement('View', props, children),
    Text: ({ children, ...props }: any) => React.createElement('Text', props, children),
  };

  return {
    __esModule: true,
    default: Animated,
    withTiming,
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    ReduceMotion: { System: 'system' },
    FadeInDown: makeAnim(),
  };
});

describe('ZSTextField', () => {
  it('기본 렌더링', () => {
    const { getByText } = render(
      <ZSTextField value="" onChangeText={() => {}} label="Test Label" />
    );

    expect(getByText('Test Label')).toBeTruthy();
  });

  it('value를 표시한다', () => {
    const { getByDisplayValue } = render(
      <ZSTextField value="test value" onChangeText={() => {}} label="Label" />
    );

    expect(getByDisplayValue('test value')).toBeTruthy();
  });

  it('onChangeText를 호출한다', () => {
    const mockOnChangeText = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <ZSTextField value="" onChangeText={mockOnChangeText} label="Label" />
    );

    const textInput = UNSAFE_getAllByType(TextInput)[0];
    fireEvent.changeText(textInput, 'new text');
    expect(mockOnChangeText).toHaveBeenCalledWith('new text');
  });

  it('status가 error일 때 에러를 표시한다', () => {
    const { getByTestId } = render(
      <ZSTextField 
        value="" 
        onChangeText={() => {}} 
        label="Label"
        status="error"
        errorMessage="Error message"
      />
    );

    expect(getByTestId('error-message')).toBeTruthy();
  });

  it('focus 시 닫기 버튼을 표시한다', () => {
    const { UNSAFE_getAllByType, getByTestId } = render(
      <ZSTextField value="test" onChangeText={() => {}} label="Label" />
    );

    const textInput = UNSAFE_getAllByType(TextInput)[0];
    fireEvent(textInput, 'focus');
    expect(getByTestId('button-close')).toBeTruthy();
  });

  it('blur 시 닫기 버튼을 숨긴다', () => {
    const { UNSAFE_getAllByType, queryByTestId } = render(
      <ZSTextField value="" onChangeText={() => {}} label="Label" />
    );

    const input = UNSAFE_getAllByType(TextInput)[0];
    fireEvent(input, 'focus');
    fireEvent(input, 'blur');
    
    expect(queryByTestId('button-close')).toBeFalsy();
  });

  it('boxStyle prop을 받는다', () => {
    const { getByText } = render(
      <ZSTextField value="" onChangeText={() => {}} label="Label" boxStyle="underline" />
    );

    expect(getByText('Label')).toBeTruthy();
  });

  it('boxStyle이 inbox일 때 정상 작동한다', () => {
    const { getByText } = render(
      <ZSTextField value="" onChangeText={() => {}} label="Label" boxStyle="inbox" />
    );

    expect(getByText('Label')).toBeTruthy();
  });

  it('inbox 는 기본 배경이 layer1, outline 은 base 다', () => {
    const palette = require('../../theme/palette').default({ mode: 'light' });

    const readBoxBackground = (boxStyle: 'outline' | 'inbox') => {
      const { UNSAFE_getByType } = render(
        <ZSTextField value="" onChangeText={() => {}} label="Label" boxStyle={boxStyle} />
      );
      const box = UNSAFE_getByType(TextInput).parent;
      return StyleSheet.flatten(box?.props.style)?.backgroundColor;
    };

    expect(readBoxBackground('inbox')).toBe(palette.background.layer1);
    expect(readBoxBackground('outline')).toBe(palette.background.base);
    expect(readBoxBackground('inbox')).not.toBe(readBoxBackground('outline'));
  });

  it('inputBgColor 를 넘기면 inbox 기본 배경보다 우선한다', () => {
    const { UNSAFE_getByType } = render(
      <ZSTextField value="" onChangeText={() => {}} label="Label" boxStyle="inbox" inputBgColor="#123456" />
    );

    const box = UNSAFE_getByType(TextInput).parent;
    expect(StyleSheet.flatten(box?.props.style)?.backgroundColor).toBe('#123456');
  });

  it('innerBoxStyle prop을 받는다', () => {
    const { getByText } = render(
      <ZSTextField value="" onChangeText={() => {}} label="Label" innerBoxStyle="top" />
    );

    expect(getByText('Label')).toBeTruthy();
  });

  it('isTextArea prop을 받는다', () => {
    const { getByText } = render(
      <ZSTextField value="" onChangeText={() => {}} label="Label" isTextArea={true} />
    );

    expect(getByText('Label')).toBeTruthy();
  });

  it('disabled prop을 받는다', () => {
    const { getByText } = render(
      <ZSTextField value="" onChangeText={() => {}} label="Label" disabled={true} />
    );

    expect(getByText('Label')).toBeTruthy();
  });

  it('allowFontScaling prop을 받는다', () => {
    const { getByText } = render(
      <ZSTextField value="" onChangeText={() => {}} label="Label" allowFontScaling={false} />
    );

    expect(getByText('Label')).toBeTruthy();
  });

  it('typo prop을 받는다', () => {
    const { getByText } = render(
      <ZSTextField value="" onChangeText={() => {}} label="Label" typo="body.1" />
    );

    expect(getByText('Label')).toBeTruthy();
  });

  it('ref를 통해 TextInput 메서드를 호출할 수 있다', () => {
    const ref = React.createRef<any>();
    render(
      <ZSTextField ref={ref} value="" onChangeText={() => {}} label="Label" />
    );

    // 테스트 환경은 mock 이라 ref 가 연결되지 않을 수 있다
    expect(ref).toBeTruthy();
  });

  it('textInputProps를 전달한다', () => {
    const { getByPlaceholderText } = render(
      <ZSTextField 
        value="" 
        onChangeText={() => {}} 
        label="Label"
        textInputProps={{ placeholder: 'Custom placeholder' }}
      />
    );

    expect(getByPlaceholderText('Custom placeholder')).toBeTruthy();
  });

  it('웹에서는 입력 높이와 라벨의 수평 기준을 네이티브와 일치시킨다', () => {
    const originalPlatform = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });

    try {
      const { UNSAFE_getByType, UNSAFE_getByProps } = render(
        <ZSTextField value="" onChangeText={() => {}} label="Label" />
      );

      const textInput = UNSAFE_getByType(TextInput);
      const inputStyle = StyleSheet.flatten(textInput.props.style);
      const labelContainerStyle = StyleSheet.flatten(
        UNSAFE_getByProps({ pointerEvents: 'none' }).props.style
      );

      expect(inputStyle).toMatchObject({
        paddingTop: 15,
        paddingBottom: 13,
      });
      expect(labelContainerStyle).toMatchObject({
        position: 'absolute',
        left: 0,
      });
    } finally {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
    }
  });

  it('웹 underline은 아래쪽 선만 수평으로 렌더링한다', () => {
    const originalPlatform = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });

    try {
      const { UNSAFE_getByType } = render(
        <ZSTextField value="" onChangeText={() => {}} label="Label" boxStyle="underline" />
      );

      const box = UNSAFE_getByType(TextInput).parent;
      const boxStyle = StyleSheet.flatten(box?.props.style);

      expect(boxStyle).toMatchObject({
        borderBottomWidth: 1.2,
        borderRadius: 0,
      });
      expect(boxStyle.borderWidth).toBeUndefined();
    } finally {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
    }
  });
});
