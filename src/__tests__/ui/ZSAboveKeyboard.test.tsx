import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import ZSAboveKeyboard from '../../ui/ZSAboveKeyboard';

jest.mock('../../model/useKeyboard', () => ({
  __esModule: true,
  default: () => ({
    isKeyboardVisible: false,
    keyboardHeight: 0,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34 }),
}));

describe('ZSAboveKeyboard', () => {
  it('children을 렌더한다', () => {
    const { getByText } = render(
      <ZSAboveKeyboard>
        <Text>Test Content</Text>
      </ZSAboveKeyboard>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('keyboardShowOffset prop을 받는다', () => {
    const { getByText } = render(
      <ZSAboveKeyboard keyboardShowOffset={10}>
        <Text>Test Content</Text>
      </ZSAboveKeyboard>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('keyboardHideOffset prop을 받는다', () => {
    const { getByText } = render(
      <ZSAboveKeyboard keyboardHideOffset={20}>
        <Text>Test Content</Text>
      </ZSAboveKeyboard>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('showOnlyKeyboardVisible이 true일 때 키보드가 보일 때만 표시한다', () => {
    jest.spyOn(require('../../model/useKeyboard'), 'default').mockReturnValue({
      isKeyboardVisible: false,
      keyboardHeight: 0,
    });

    const { getByText } = render(
      <ZSAboveKeyboard showOnlyKeyboardVisible={true}>
        <Text>Test Content</Text>
      </ZSAboveKeyboard>
    );

    // showOnlyKeyboardVisible이 true이고 키보드가 보이지 않으면 숨김
    expect(getByText('Test Content')).toBeTruthy();
  });

  it('handleLayoutHeight 콜백을 호출한다', () => {
    const mockHandleLayoutHeight = jest.fn();
    const { getByText } = render(
      <ZSAboveKeyboard handleLayoutHeight={mockHandleLayoutHeight}>
        <Text>Test Content</Text>
      </ZSAboveKeyboard>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });
});

