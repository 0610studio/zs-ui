import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import ZSBottomCta from '../../ui/ZSBottomCta';

jest.mock('../../model/useKeyboard', () => ({
  __esModule: true,
  default: () => ({
    isKeyboardVisible: false,
    keyboardHeight: 0,
  }),
}));

describe('ZSBottomCta', () => {
  it('render prop을 통해 children을 렌더한다', () => {
    const { getByText } = render(
      <ZSBottomCta render={() => <Text>Test Button</Text>} />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('offset prop을 받는다', () => {
    const { getByText } = render(
      <ZSBottomCta render={() => <Text>Test Button</Text>} offset={10} />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('키보드가 보일 때 올바르게 위치를 조정한다', () => {
    jest.spyOn(require('../../model/useKeyboard'), 'default').mockReturnValue({
      isKeyboardVisible: true,
      keyboardHeight: 300,
    });

    const { getByText } = render(
      <ZSBottomCta render={() => <Text>Test Button</Text>} offset={20} />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });
});

