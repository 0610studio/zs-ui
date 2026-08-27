import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import ZSDropdown from '../../ui/ZSDropdown';

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

const chevronStyle = (getByTestId: any) =>
  StyleSheet.flatten(getByTestId('zs-dropdown-chevron').props.style);

describe('ZSDropdown', () => {
  it('value 를 필드 값으로 렌더한다', () => {
    const { UNSAFE_getByType } = render(
      <ZSDropdown label='도메인' value='gmail.com' onPress={jest.fn()} />
    );
    const { TextInput } = require('react-native');

    expect(UNSAFE_getByType(TextInput).props.value).toBe('gmail.com');
  });

  it('value 미지정 시 빈 문자열로 렌더한다', () => {
    const { UNSAFE_getByType } = render(<ZSDropdown label='도메인' onPress={jest.fn()} />);
    const { TextInput } = require('react-native');

    expect(UNSAFE_getByType(TextInput).props.value).toBe('');
  });

  describe('표시 전용 (onChangeText 미전달)', () => {
    it('필드 전체를 누르면 onPress 가 호출된다', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(<ZSDropdown label='도메인' onPress={onPress} />);

      fireEvent.press(getByTestId('zs-dropdown-surface'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('TextInput 의 포커스를 막기 위해 editable=false 로 렌더한다', () => {
      const { UNSAFE_getByType } = render(<ZSDropdown label='도메인' onPress={jest.fn()} />);
      const { TextInput } = require('react-native');

      expect(UNSAFE_getByType(TextInput).props.editable).toBe(false);
    });

    it('carret 을 우측 기본 위치에 둔다', () => {
      const { getByTestId } = render(<ZSDropdown label='도메인' onPress={jest.fn()} />);

      expect(chevronStyle(getByTestId).right).toBe(15);
    });
  });

  describe('입력형 (onChangeText 전달)', () => {
    it('press 대상 래퍼 없이 필드에 직접 입력한다', () => {
      const onChangeText = jest.fn();
      const { queryByTestId, UNSAFE_getByType } = render(
        <ZSDropdown label='도메인' onPress={jest.fn()} onChangeText={onChangeText} />
      );
      const { TextInput } = require('react-native');

      expect(queryByTestId('zs-dropdown-surface')).toBeNull();
      expect(UNSAFE_getByType(TextInput).props.editable).toBeUndefined();

      fireEvent.changeText(UNSAFE_getByType(TextInput), 'gmail');
      expect(onChangeText).toHaveBeenCalledWith('gmail');
    });

    it('carret 을 값 삭제 버튼과 겹치지 않게 왼쪽으로 민다', () => {
      const { getByTestId } = render(
        <ZSDropdown label='도메인' onPress={jest.fn()} onChangeText={jest.fn()} />
      );

      expect(chevronStyle(getByTestId).right).toBe(39);
    });
  });

  it('carret 을 누르면 onPress 가 호출된다', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <ZSDropdown label='도메인' onPress={onPress} onChangeText={jest.fn()} />
    );

    fireEvent.press(getByTestId('zs-dropdown-chevron'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('disabled 면 필드도 carret 도 눌리지 않는다', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<ZSDropdown label='도메인' onPress={onPress} disabled />);

    fireEvent.press(getByTestId('zs-dropdown-surface'));
    fireEvent.press(getByTestId('zs-dropdown-chevron'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('expanded 를 accessibilityState 로 노출한다', () => {
    const { getByTestId } = render(<ZSDropdown label='도메인' onPress={jest.fn()} expanded />);

    expect(getByTestId('zs-dropdown-surface').props.accessibilityState.expanded).toBe(true);
    expect(getByTestId('zs-dropdown-chevron').props.accessibilityState.expanded).toBe(true);
  });

  it('carret 폭만큼 입력 우측 여백을 확보한다', () => {
    const { UNSAFE_getByType } = render(<ZSDropdown label='도메인' onPress={jest.fn()} />);
    const { TextInput } = require('react-native');

    // 기본 위치(15) + 아이콘(20) + 간격(6)
    expect(StyleSheet.flatten(UNSAFE_getByType(TextInput).props.style).paddingRight).toBe(41);
  });

  it('status=error 와 errorMessage 가 함께 오면 에러 메시지를 렌더한다', () => {
    const { getByText } = render(
      <ZSDropdown label='도메인' onPress={jest.fn()} status='error' errorMessage='필수 항목이에요.' />
    );

    expect(getByText('필수 항목이에요.')).toBeTruthy();
  });

  it('errorMessage 만 있고 status 가 default 면 렌더하지 않는다', () => {
    const { queryByText } = render(
      <ZSDropdown label='도메인' onPress={jest.fn()} errorMessage='필수 항목이에요.' />
    );

    expect(queryByText('필수 항목이에요.')).toBeNull();
  });

  it('children 을 필드 뒤에 함께 렌더한다', () => {
    const { getByText } = render(
      <ZSDropdown label='도메인' onPress={jest.fn()}>
        <Text>바텀시트</Text>
      </ZSDropdown>
    );

    expect(getByText('바텀시트')).toBeTruthy();
  });

  it('chevron 으로 carret 을 교체할 수 있다', () => {
    const { getByText } = render(
      <ZSDropdown label='도메인' onPress={jest.fn()} chevron={<Text>▾</Text>} />
    );

    expect(getByText('▾')).toBeTruthy();
  });
});
